import asyncio
import grpc
from state_search_be.api import LeanStateSearchServicer, LeanGraphServicer
import logging
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    add_LeanStateSearchServiceServicer_to_server,
    add_LeanGraphServiceServicer_to_server,
)
from prisma import Prisma
from qdrant_client import QdrantClient
import meilisearch
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

    # Initialize database connections
    if os.getenv("MODE") == "docker":
        qdrant_url = "http://qdrant:6333"
        meili_url = "http://meilisearch:7700"
    else:
        qdrant_url = f"http://localhost:{os.getenv('QDRANT_PORT')}"
        meili_url = f"http://localhost:{os.getenv('MEILI_PORT', '7700')}"

    vb = QdrantClient(qdrant_url)
    meili_client = meilisearch.Client(
        meili_url, os.getenv("MEILI_MASTER_KEY", "masterKey")
    )

    await db.connect()

    # Create servicers
    lean_state_search_servicer = LeanStateSearchServicer(db=db, vb=vb)
    lean_graph_servicer = LeanGraphServicer(db=db, meili_client=meili_client)

    # Initialize Meilisearch index
    logging.info("Initializing Meilisearch index...")
    await lean_graph_servicer.initialize_meilisearch_index()
    logging.info("Meilisearch index initialized successfully")

    server = grpc.aio.server()
    add_LeanStateSearchServiceServicer_to_server(lean_state_search_servicer, server)
    add_LeanGraphServiceServicer_to_server(lean_graph_servicer, server)

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
