from prisma import Prisma
import asyncio
import argparse
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv
from state_search_be.flag_model import FlagModel
import os

load_dotenv()


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rev", type=str, required=True)
    args = parser.parse_args()
    model = FlagModel(
        os.getenv("MODEL_NAME_OR_PATH"),
        use_fp16=False,
        pooling_method="mean",
    )
    vb_client = QdrantClient("http://localhost:6333")
    db_client = Prisma()
    await db_client.connect()
    theorems = await db_client.theorem.find_many(where={"rev": args.rev})
    context_corpus = [
        "".join(map(lambda v: "<VAR>" + v, theorem.args)) for theorem in theorems
    ]
    goal_corpus = ["<GOAL>" + theorem.goal for theorem in theorems]
    context_embeddings = model.encode_corpus(context_corpus)
    goal_embeddings = model.encode_corpus(goal_corpus)
    corpus_embeddings = (context_embeddings + goal_embeddings) / 2
    points = [
        PointStruct(
            id=i,
            vector=corpus_embeddings[i].tolist(),
            payload={"id": theorems[i].id}
        )
        for i in range(len(corpus_embeddings))
    ]

    vb_client.delete_collection(args.rev)
    vb_client.create_collection(
        collection_name=args.rev,
        vectors_config=VectorParams(
            size=len(corpus_embeddings[0]), distance=Distance.DOT
        ),
    )
    vb_client.upload_points(collection_name=args.rev, points=points)
    await db_client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
