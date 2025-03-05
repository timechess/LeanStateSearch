import asyncio
import grpc
from state_search_be.api import LeanStateSearchServicer
import logging
from state_search_be.state_search.v1.state_search_pb2_grpc import (
    add_LeanStateSearchServiceServicer_to_server,
)
from prisma import Prisma
from qdrant_client import QdrantClient
from dotenv import load_dotenv


async def serve() -> None:
    load_dotenv()
    db = Prisma()
    vb = QdrantClient("http://qdrant:6333")
    await db.connect()
    server = grpc.aio.server()
    add_LeanStateSearchServiceServicer_to_server(
        LeanStateSearchServicer(db=db, vb=vb), server
    )

    listen_addr = "[::]:7720"
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
