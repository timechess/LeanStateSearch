import os
import bleach
from grpc import StatusCode
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    LeanStateSearchServiceServicer,
)
from state_search_be.state_search.v1.state_search_pb2 import (
    SearchTheoremResponse,
    FeedbackResponse,
    GetAllRevResponse,
    Theorem,
)
from dotenv import load_dotenv
import re
from flag_model import FlagModel
from eval import index, search
from prisma import Prisma

load_dotenv()


class LeanStateSearchServicer(LeanStateSearchServiceServicer):
    def __init__(self, db: Prisma, theorems):
        self.db = db
        self.model = FlagModel(
            "ruc-ai4math/Lean_State_Search_s0.75_d0.75",
            use_fp16=False,
            pooling_method="mean",
        )
        self.embedding_path = os.getenv("STATE_SEARCH_VECTOR_STORE_PATH")
        revs = set(map(lambda t: t.rev, theorems))
        for rev in revs:
            embedding_path = os.path.join(self.embedding_path, rev)
            context_embedding_path = os.path.join(embedding_path, "context_embedding")
            goal_embedding_path = os.path.join(embedding_path, "goal_embedding")
            rev_theorems = list(filter(lambda t: t.rev == rev, theorems))
            if not os.path.exists(embedding_path):
                os.makedirs(embedding_path)
                context_corpus = [
                    "".join(map(lambda v: "<VAR>" + v, theorem.args))
                    for theorem in rev_theorems
                ]
                goal_corpus = ["<GOAL>" + theorem.goal for theorem in rev_theorems]
                index(
                    self.model,
                    context_corpus,
                    save_path=context_embedding_path,
                    save_embedding=True,
                )
                index(
                    self.model,
                    goal_corpus,
                    save_path=goal_embedding_path,
                    save_embedding=True,
                )

    async def _clean_input(self, input_str: str) -> str:
        """Clean and validate user input"""
        if not input_str or len(input_str) > 1000:
            raise ValueError("Invalid input length")
        return bleach.clean(input_str, strip=True)

    # @RateLimiter(times=100, minutes=1)
    async def SearchTheorem(self, request, context):
        try:
            # Clean and validate input
            query = self._clean_input(request.query)
            nresult = min(max(request.nresult, 1), 100)  # Limit results to 1-100
            # rerank = bool(request.rerank)
            rev = self._clean_input(request.rev)
            context_corpus_embeddings = index(
                self.model,
                None,
                save_path=os.path.join(self.embedding_path, rev, "context_embedding"),
                load_embedding=True,
            )
            goal_corpus_embeddings = index(
                self.model,
                None,
                save_path=os.path.join(self.embedding_path, rev, "goal_embedding"),
                load_embedding=True,
            )
            query = query.split("⊢")
            context = query[0]
            if len(query) == 2:
                goal = query[1]
            else:
                goal = ""
            context = re.sub(r"\n\s+", "", context).strip()
            context = "".join(["<VAR>" + var for var in context.split("\n")])
            goal = "<GOAL>" + goal.strip()
            query = context + goal
            indice, _ = search(
                self.model,
                [query],
                context_corpus_embeddings,
                goal_corpus_embeddings,
                nresult,
            )

            theorems = await self.db.theorem.find_many(
                where={"id": {"in": indice.tolist()[0]}}
            )

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

        except ValueError as e:
            context.set_code(StatusCode.INVALID_ARGUMENT)
            context.set_details(str(e))
            return None
        except Exception as e:
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Internal server error {e}")
            return None

    # # @RateLimiter(times=100, minutes=1)
    async def Feedback(self, request, context):
        try:
            # Clean and validate input
            query = self._clean_input(request.query)
            theorem_id = self._clean_input(request.theorem_id)
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

        except ValueError as e:
            context.set_code(StatusCode.INVALID_ARGUMENT)
            context.set_details(str(e))
            return None
        except Exception as e:
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Internal server error {e}")
            return None

    async def GetAllRev(self, request, context):
        results = await self.db.query_raw('SELECT DISTINCT "rev" FROM "Theorem";')
        values = [result["rev"] for result in results]
        return GetAllRevResponse(revs=values)
