import os
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    LeanGraphServiceServicer,
    LeanStateSearchServiceServicer,
)
from state_search_be.state_search.v1.state_search_pb2 import (
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
    GetDependencyNodesAndEdgesRequest,
    GetDependencyNodesAndEdgesResponse,
    GetDependentNodesAndEdgesRequest,
    GetDependentNodesAndEdgesResponse,
    SamplingInfo,
    GetNodeSuggestionsRequest,
    GetNodeSuggestionsResponse,
)
from dotenv import load_dotenv
import re
import random
import meilisearch
from .flag_model import FlagModel
from prisma import Prisma
from prisma.errors import RawQueryError
from qdrant_client import QdrantClient

load_dotenv()


def random_sample_with_target(nodes, edges, target_name, max_nodes=50):
    """
    Randomly sample nodes ensuring the target node is always included.
    Returns sampled nodes, edges, and sampling information.
    """
    original_count = len(nodes)

    if len(nodes) <= max_nodes:
        return (
            nodes,
            edges,
            {
                "was_sampled": False,
                "original_node_count": original_count,
                "sampled_node_count": len(nodes),
            },
        )

    # Find the target node
    target_node = None
    for node in nodes:
        if node.name == target_name:
            target_node = node
            break

    if not target_node:
        # If target node not found, just do random sampling
        sampled_nodes = random.sample(nodes, max_nodes)
    else:
        # Always include the target node
        other_nodes = [n for n in nodes if n.name != target_name]
        sampled_others = random.sample(other_nodes, max_nodes - 1)
        sampled_nodes = [target_node] + sampled_others

    # Create set of sampled node names for efficient lookup
    sampled_names = {node.name for node in sampled_nodes}

    # Filter edges to only include those between sampled nodes
    sampled_edges = [
        edge
        for edge in edges
        if edge.source in sampled_names and edge.target in sampled_names
    ]

    return (
        sampled_nodes,
        sampled_edges,
        {
            "was_sampled": True,
            "original_node_count": original_count,
            "sampled_node_count": len(sampled_nodes),
        },
    )


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
        await self.db.call.create(data={"type": call_type, "query": request.query})
        return CallResponse()


class LeanGraphServicer(LeanGraphServiceServicer):
    def __init__(self, db: Prisma, meili_client: meilisearch.Client):
        self.db = db
        self.meili_client = meili_client
        self.index_name = "lean_nodes"

    async def GetDependencyNodesAndEdges(
        self, request: GetDependencyNodesAndEdgesRequest, context
    ):
        node = await self.db.leannode.find_first(where={"name": request.name})
        if node is None:
            return GetDependencyNodesAndEdgesResponse(nodes=[], edges=[])

        edges = await self.db.leanedge.find_many(where={"source": node.name})

        nodes = await self.db.leannode.find_many(
            where={"name": {"in": [edge.target for edge in edges]}}
        )

        # Create proto nodes for dependency targets
        proto_nodes = [
            ProtoLeanNode(
                name=node.name,
                const_category=node.const_category,
                const_type=node.const_type,
                module=node.module,
                doc_string=node.doc_string,
                informal_name=node.informal_name,
                informal_statement=node.informal_statement,
            )
            for node in nodes
        ]

        # Add the target node itself to the list
        proto_nodes.append(
            ProtoLeanNode(
                name=node.name,
                const_category=node.const_category,
                const_type=node.const_type,
                module=node.module,
                doc_string=node.doc_string,
                informal_name=node.informal_name,
                informal_statement=node.informal_statement,
            )
        )

        proto_edges = [
            ProtoLeanEdge(
                id=edge.id,
                source=edge.source,
                target=edge.target,
                edge_type=edge.edge_type,
            )
            for edge in edges
        ]

        # Apply sampling if needed
        sampled_nodes, sampled_edges, sampling_data = random_sample_with_target(
            proto_nodes, proto_edges, request.name
        )

        # Create sampling info
        sampling_info = SamplingInfo(
            was_sampled=sampling_data["was_sampled"],
            original_node_count=sampling_data["original_node_count"],
            sampled_node_count=sampling_data["sampled_node_count"],
        )

        return GetDependencyNodesAndEdgesResponse(
            nodes=sampled_nodes,
            edges=sampled_edges,
            sampling_info=sampling_info,
        )

    async def GetDependentNodesAndEdges(
        self, request: GetDependentNodesAndEdgesRequest, context
    ):
        node = await self.db.leannode.find_first(where={"name": request.name})
        if node is None:
            return GetDependencyNodesAndEdgesResponse(nodes=[], edges=[])

        edges = await self.db.leanedge.find_many(where={"target": node.name})

        nodes = await self.db.leannode.find_many(
            where={"name": {"in": [edge.source for edge in edges]}}
        )

        # Create proto nodes for dependent sources
        proto_nodes = [
            ProtoLeanNode(
                name=node.name,
                const_category=node.const_category,
                const_type=node.const_type,
                module=node.module,
                doc_string=node.doc_string,
                informal_name=node.informal_name,
                informal_statement=node.informal_statement,
            )
            for node in nodes
        ]

        # Add the target node itself to the list
        proto_nodes.append(
            ProtoLeanNode(
                name=node.name,
                const_category=node.const_category,
                const_type=node.const_type,
                module=node.module,
                doc_string=node.doc_string,
                informal_name=node.informal_name,
                informal_statement=node.informal_statement,
            )
        )

        proto_edges = [
            ProtoLeanEdge(
                id=edge.id,
                source=edge.source,
                target=edge.target,
                edge_type=edge.edge_type,
            )
            for edge in edges
        ]

        # Apply sampling if needed
        sampled_nodes, sampled_edges, sampling_data = random_sample_with_target(
            proto_nodes, proto_edges, request.name
        )

        # Create sampling info
        sampling_info = SamplingInfo(
            was_sampled=sampling_data["was_sampled"],
            original_node_count=sampling_data["original_node_count"],
            sampled_node_count=sampling_data["sampled_node_count"],
        )

        return GetDependentNodesAndEdgesResponse(
            nodes=sampled_nodes,
            edges=sampled_edges,
            sampling_info=sampling_info,
        )

    async def initialize_meilisearch_index(self):
        """Initialize the Meilisearch index with all node names"""
        try:
            # Get or create the index
            try:
                index = self.meili_client.index(self.index_name)
            except meilisearch.errors.MeiliSearchApiError:
                # Index doesn't exist, create it
                index = self.meili_client.create_index(
                    self.index_name, {"primaryKey": "name"}
                )

            # Fetch all nodes from database
            all_nodes = await self.db.leannode.find_many()

            # Prepare documents for indexing
            documents = [
                {
                    "id": i,
                    "name": node.name,
                }
                for i, node in enumerate(all_nodes)
            ]

            # Add documents to index
            if documents:
                index.add_documents(documents)
                print(f"Initialized Meilisearch index with {len(documents)} nodes")
            else:
                print("No nodes found to index")

        except Exception as e:
            print(f"Failed to initialize Meilisearch index: {e}")
            raise

    async def GetNodeSuggestions(self, request: GetNodeSuggestionsRequest, context):
        query = request.query
        max_suggestions = request.max_suggestions or 10

        if len(query) < 2:
            return GetNodeSuggestionsResponse(suggestions=[])

        try:
            # Get the index
            index = self.meili_client.index(self.index_name)

            # Search using Meilisearch
            search_results = index.search(
                query,
                {
                    "limit": max_suggestions,
                },
            )

            # Extract node names from search results
            suggestions = [hit["name"] for hit in search_results["hits"]]

            return GetNodeSuggestionsResponse(suggestions=suggestions)

        except Exception as e:
            print(f"Meilisearch search failed: {e}")
            # Fallback to empty results if search fails
            return GetNodeSuggestionsResponse(suggestions=[])
