import os
import bleach
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from grpc import StatusCode
from state_search.v1.state_search_pb2_grpc import LeanStateSearchServiceServicer
from dotenv import load_dotenv

load_dotenv()

class LeanStateSearchService(LeanStateSearchServiceServicer):
    def __init__(self):
        # Initialize rate limiter
        self.rate_limit = int(os.getenv('RATE_LIMIT', 100))
        self.rate_window = int(os.getenv('RATE_LIMIT_WINDOW', 60))
        FastAPILimiter.init(
            rate_limit=self.rate_limit,
            window=self.rate_window
        )

    async def _clean_input(self, input_str: str) -> str:
        """Clean and validate user input"""
        if not input_str or len(input_str) > 1000:
            raise ValueError("Invalid input length")
        return bleach.clean(input_str, strip=True)

    @RateLimiter(times=100, minutes=1)
    def SearchTheorem(self, request, context):
        try:
            # Clean and validate input
            query = self._clean_input(request.query)
            nresult = min(max(request.nresult, 1), 100)  # Limit results to 1-100
            rerank = bool(request.rerank)
            rev = self._clean_input(request.rev)

            # TODO: Implement actual search logic
            raise NotImplementedError()

        except ValueError as e:
            context.set_code(StatusCode.INVALID_ARGUMENT)
            context.set_details(str(e))
            return None
        except Exception as e:
            context.set_code(StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return None

    @RateLimiter(times=100, minutes=1)
    def Feedback(self, request, context):
        try:
            # Clean and validate input
            query = self._clean_input(request.query)
            theorem_id = self._clean_input(request.theorem_id)
            relevant = bool(request.relevant)
            update = bool(request.update)

            # TODO: Implement actual feedback logic
            raise NotImplementedError()

        except ValueError as e:
            context.set_code(StatusCode.INVALID_ARGUMENT)
            context.set_details(str(e))
            return None
        except Exception as e:
            context.set_code(StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return None
