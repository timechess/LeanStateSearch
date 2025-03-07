from prisma import Prisma
import jsonlines
import argparse
import asyncio
from tqdm import tqdm


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--save-path", type=str, required=True)

    args = parser.parse_args()
    db = Prisma()
    await db.connect()
    feedbacks = await db.feedback.find_many()
    with jsonlines.open(args.save_path, "w") as f:
        for feedback in tqdm(feedbacks):
            f.write({
              "id": feedback.id,
              "query": feedback.query,
              "theorem_id": feedback.theorem_id,
              "relevant": feedback.relevant,
            })
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
