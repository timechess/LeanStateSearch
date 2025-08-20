import os
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    LeanGraphServiceServicer,
    LeanStateSearchServiceServicer,
)
from state_search_be.state_search.v1.state_search_pb2 import (
    GetNodesAndEdgesRequest,
    SearchTheoremRequest,
    SearchTheoremResponse,
    FeedbackRequest,
    FeedbackResponse,
    GetAllRevResponse,
    ClickRequest,
    ClickResponse,
    CallRequest,
    CallResponse,
    Theorem,
    LeanEdge as ProtoLeanEdge,
    LeanNode as ProtoLeanNode,
    GetNodesAndEdgesResponse,
)
from dotenv import load_dotenv
import re
from .flag_model import FlagModel
from prisma import Prisma
from prisma.errors import RawQueryError
from qdrant_client import QdrantClient
from lean_graph_tool import LeanGraph

load_dotenv()


class LeanStateSearchServicer(LeanStateSearchServiceServicer):
    def __init__(self, db: Prisma, vb: QdrantClient):
        self.db = db
        self.vb = vb
        self.model = FlagModel(
            os.getenv("MODEL_NAME_OR_PATH"),
            use_fp16=False,
            pooling_method="mean",
        )

    async def SearchTheorem(self, request: SearchTheoremRequest, context):
        query = request.query.split("⊢")
        nresult = min(max(request.nresult, 1), 100)
        rev = request.rev
        context = query[0]
        if len(query) == 2:
            goal = query[1]
        else:
            goal = ""

        context = re.sub(r"\n\s+", "", context).strip()
        context = "".join(
            filter(
                lambda line: ":" in line, ["<VAR>" + var for var in context.split("\n")]
            )
        )
        goal = "<GOAL>" + goal.strip()
        query = context + goal
        query_embedding = self.model.encode_queries(query).tolist()
        results = self.vb.query_points(
            rev, query_embedding, limit=nresult, with_payload=True
        )
        results_ids = list(map(lambda p: p.payload["id"], results.points))

        theorems = await self.db.theorem.find_many(
            where={
                "id": {
                    "in": results_ids,
                }
            }
        )
        theorems = sorted(theorems, key=lambda x: results_ids.index(x.id))

        def to_code(theorem):
            args = "".join(theorem.args)
            return f"theorem {theorem.name} {args} : {theorem.goal}"

        return SearchTheoremResponse(
            results=[
                Theorem(
                    id=theorem.id,
                    name=theorem.name,
                    code=to_code(theorem),
                    rev=rev,
                    module=theorem.module,
                    formal_type=theorem.formal_type,
                )
                for theorem in theorems
            ]
        )

    async def Feedback(self, request: FeedbackRequest, context):
        query = request.query
        theorem_id = request.theorem_id
        relevant = bool(request.relevant)
        update = bool(request.update)
        rank = request.rank

        if update:
            old = await self.db.feedback.find_first(
                where={"query": query, "theorem_id": theorem_id}
            )
            await self.db.feedback.update(
                data={
                    "query": query,
                    "theorem_id": theorem_id,
                    "relevant": relevant,
                    "rank": rank,
                },
                where={"id": old.id},
            )
        else:
            await self.db.feedback.create(
                data={
                    "query": query,
                    "theorem_id": theorem_id,
                    "relevant": relevant,
                    "rank": rank,
                }
            )
        return FeedbackResponse()

    async def GetAllRev(self, request, context):
        try:
            results = await self.db.query_raw('SELECT DISTINCT "rev" FROM "Theorem";')
            values = [result["rev"] for result in results]
        except RawQueryError:
            values = []

        return GetAllRevResponse(revs=values)

    async def Click(self, request: ClickRequest, context):
        query = request.query
        theorem_id = request.theorem_id
        rank = request.rank

        await self.db.click.create(
            data={"query": query, "theorem_id": theorem_id, "rank": rank}
        )
        return ClickResponse()

    async def Call(self, request: CallRequest, context):
        call_type = request.call_type
        await self.db.call.create(data={"type": call_type})
        return CallResponse()


class LeanGraphServicer(LeanGraphServiceServicer):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.graph = LeanGraph.load_from_json(file_path)

    async def GetNodesAndEdges(self, request: GetNodesAndEdgesRequest, context):
        name = request.name
        node = self.graph.get_by_name(name)
        body_deps = self.graph.get_body_deps_by_name(name)
        type_deps = self.graph.get_type_deps_by_name(name)
        body_edges = [
            ProtoLeanEdge(
                id=f"body_{name}->{dep.name}",
                source=name,
                target=dep.name,
                weight=1,
            )
            for dep in body_deps
        ]
        type_edges = [
            ProtoLeanEdge(
                id=f"type_{name}->{dep.name}",
                source=name,
                target=dep.name,
                weight=0,
            )
            for dep in type_deps
        ]
        nodes = [
            ProtoLeanNode(
                name=dep.name,
                const_category=dep.const_category,
                const_type=dep.const_type,
                module=dep.module,
                doc_string=dep.doc_string,
                informal_name=dep.informal_name,
                informal_statement=dep.informal_statement,
            )
            for dep in body_deps + type_deps
        ] + [
            ProtoLeanNode(
                name=name,
                const_category=node.const_category,
                const_type=node.const_type,
                module=node.module,
                doc_string=node.doc_string,
                informal_name=node.informal_name,
                informal_statement=node.informal_statement,
            )
        ]
        return GetNodesAndEdgesResponse(nodes=nodes, edges=body_edges + type_edges)
