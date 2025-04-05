import asyncio
import grpc
from state_search_be.api import LeanStateSearchServicer
import logging
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    add_LeanStateSearchServiceServicer_to_server,
)
from prisma import Prisma
from qdrant_client import QdrantClient
import os

if os.getenv("MODE") == "docker":
    os.environ["DATABASE_URL"] = (
        f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@pg:5432/statesearch"
    )
else:
    os.environ["DATABASE_URL"] = (
        f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@localhost:{os.getenv('POSTGRES_PORT')}/statesearch"
    )


async def serve() -> None:
    db = Prisma()
    if os.getenv("MODE") == "docker":
        qdrant_url = "http://qdrant:6333"
    else:
        qdrant_url = f"http://localhost:{os.getenv('QDRANT_PORT')}"
    vb = QdrantClient(qdrant_url)
    await db.connect()
    server = grpc.aio.server()
    add_LeanStateSearchServiceServicer_to_server(
        LeanStateSearchServicer(db=db, vb=vb), server
    )

    listen_addr = f"[::]:{os.getenv('BACKEND_PORT')}"
    server.add_insecure_port(listen_addr)
    logging.info("Starting server on %s", listen_addr)

    await server.start()
    await server.wait_for_termination()
    await db.disconnect()


def main():
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve())


if __name__ == "__main__":
    main()
