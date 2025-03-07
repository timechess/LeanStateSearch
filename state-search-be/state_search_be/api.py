import os
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    LeanStateSearchServiceServicer,
)
from state_search_be.state_search.v1.state_search_pb2 import (
    SearchTheoremRequest,
    SearchTheoremResponse,
    FeedbackRequest,
    FeedbackResponse,
    GetAllRevResponse,
    Theorem,
)
from dotenv import load_dotenv
import re
from flag_model import FlagModel
from prisma import Prisma
from qdrant_client import QdrantClient

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
        context = "".join(filter(lambda line: ":" in line, ["<VAR>" + var for var in context.split("\n")]))
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
                )
                for theorem in theorems
            ]
        )

    async def Feedback(self, request: FeedbackRequest, context):
        query = request.query
        theorem_id = request.theorem_id
        relevant = bool(request.relevant)
        update = bool(request.update)

        if update:
            old = await self.db.feedback.find_first(
                where={"query": query, "theorem_id": theorem_id}
            )
            await self.db.feedback.update(
                data={
                    "query": query,
                    "theorem_id": theorem_id,
                    "relevant": relevant,
                },
                where={"id": old.id},
            )
        else:
            await self.db.feedback.create(
                data={
                    "query": query,
                    "theorem_id": theorem_id,
                    "relevant": relevant,
                }
            )
        return FeedbackResponse()

    async def GetAllRev(self, request, context):
        results = await self.db.query_raw('SELECT DISTINCT "rev" FROM "Theorem";')
        values = [result["rev"] for result in results]
        return GetAllRevResponse(revs=values)
