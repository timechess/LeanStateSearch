from prisma import Prisma
import argparse
import asyncio
import os
import json
from tqdm import tqdm

os.environ["DATABASE_URL"] = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@localhost:{os.getenv('POSTGRES_PORT')}/statesearch"
)


async def main():
    parser = argparse.ArgumentParser()
    # parser.add_argument("--nodes", type=str, required=True)
    parser.add_argument("--edges", type=str, required=True)
    args = parser.parse_args()
    db = Prisma()
    await db.connect()

    # with open(args.nodes, "r") as f:
    #     data = json.load(f)

    # await db.leannode.create_many(
    #   data=data
    # )
    # del data

    with open(args.edges, "r") as f:
        data = json.load(f)

    for i in tqdm(range(0, len(data), 10000)):
        await db.leanedge.create_many(data=data[i : i + 10000], skip_duplicates=True)

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
