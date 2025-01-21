from prisma import Prisma
import jsonlines
import argparse
import asyncio
from tqdm import tqdm


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", type=str, required=True)
    parser.add_argument("--rev", type=str, required=True)

    args = parser.parse_args()
    db = Prisma()
    theorems = []
    await db.connect()
    with jsonlines.open(args.data_path, "r") as f:
        for it in tqdm(f.iter()):
            theorems.append(
                {
                    "name": it["full_name"],
                    "args": it["args"],
                    "goal": it["goal"],
                    "module": it["mod_name"],
                    "rev": args.rev,
                }
            )
    await db.theorem.create_many(data=theorems)
    await db.revs.create(data={"rev": args.rev})
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
