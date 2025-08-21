import json
import argparse
import asyncio
import os
from prisma import Prisma
from tqdm import tqdm

os.environ["DATABASE_URL"] = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@localhost:{os.getenv('POSTGRES_PORT')}/statesearch"
)

# Batch sizes for database operations
NODE_BATCH_SIZE = 5000
EDGE_BATCH_SIZE = 10000


async def upload_nodes_streaming(db: Prisma, nodes_file: str):
    """Upload nodes using streaming JSON parsing to minimize memory usage."""
    print("Uploading nodes...")

    total_nodes = 0
    batch = []

    with open(nodes_file, "r") as f:
        # Read file line by line for JSONL format
        for line in f:
            if line.strip():
                try:
                    node = json.loads(line.strip())
                    batch.append(node)
                    total_nodes += 1

                    # Process in batches
                    if len(batch) >= NODE_BATCH_SIZE:
                        await db.leannode.create_many(data=batch, skip_duplicates=True)
                        batch = []
                        print(f"Processed {total_nodes} nodes...")
                except json.JSONDecodeError:
                    print(f"Warning: Skipping invalid JSON line: {line[:100]}...")

        # Process remaining nodes
        if batch:
            await db.leannode.create_many(data=batch, skip_duplicates=True)

    print(f"Total nodes uploaded: {total_nodes}")
    return total_nodes


async def upload_edges_streaming(db: Prisma, edges_file: str):
    """Upload edges using streaming JSON parsing to minimize memory usage."""
    print("Uploading edges...")

    total_edges = 0
    batch = []

    with open(edges_file, "r") as f:
        # Read file line by line for JSONL format
        for line in f:
            if line.strip():
                try:
                    edge = json.loads(line.strip())
                    batch.append(edge)
                    total_edges += 1

                    # Process in batches
                    if len(batch) >= EDGE_BATCH_SIZE:
                        await db.leanedge.create_many(data=batch, skip_duplicates=True)
                        batch = []
                        print(f"Processed {total_edges} edges...")
                except json.JSONDecodeError:
                    print(f"Warning: Skipping invalid JSON line: {line[:100]}...")

        # Process remaining edges
        if batch:
            await db.leanedge.create_many(data=batch, skip_duplicates=True)

    print(f"Total edges uploaded: {total_edges}")
    return total_edges


async def upload_nodes_chunked(db: Prisma, nodes_file: str):
    """Alternative method: Upload nodes in chunks using regular JSON loading."""
    print("Uploading nodes in chunks...")

    with open(nodes_file, "r") as f:
        # Load and process in chunks to avoid memory issues
        chunk_size = NODE_BATCH_SIZE
        total_nodes = 0

        # Read file line by line for very large files
        batch = []
        for line in f:
            if line.strip():
                try:
                    node = json.loads(line.strip())
                    batch.append(node)

                    if len(batch) >= chunk_size:
                        await db.leannode.create_many(data=batch, skip_duplicates=True)
                        total_nodes += len(batch)
                        batch = []
                        print(f"Processed {total_nodes} nodes...")
                except json.JSONDecodeError:
                    print(f"Warning: Skipping invalid JSON line: {line[:100]}...")

        # Process remaining nodes
        if batch:
            await db.leannode.create_many(data=batch, skip_duplicates=True)
            total_nodes += len(batch)

    print(f"Total nodes uploaded: {total_nodes}")
    return total_nodes


async def upload_edges_chunked(db: Prisma, edges_file: str):
    """Alternative method: Upload edges in chunks using regular JSON loading."""
    print("Uploading edges in chunks...")

    with open(edges_file, "r") as f:
        # Load and process in chunks to avoid memory issues
        chunk_size = EDGE_BATCH_SIZE
        total_edges = 0

        # Read file line by line for very large files
        batch = []
        for line in f:
            if line.strip():
                try:
                    edge = json.loads(line.strip())
                    batch.append(edge)

                    if len(batch) >= chunk_size:
                        await db.leanedge.create_many(data=batch, skip_duplicates=True)
                        total_edges += len(batch)
                        batch = []
                        print(f"Processed {total_edges} edges...")
                except json.JSONDecodeError:
                    print(f"Warning: Skipping invalid JSON line: {line[:100]}...")

        # Process remaining edges
        if batch:
            await db.leanedge.create_many(data=batch, skip_duplicates=True)
            total_edges += len(batch)

    print(f"Total edges uploaded: {total_edges}")
    return total_edges


async def convert_to_line_delimited(input_file: str, output_file: str):
    """Convert JSON array format to line-delimited JSON for streaming processing."""
    print(f"Converting {input_file} to line-delimited format...")

    with open(input_file, "r") as infile, open(output_file, "w") as outfile:
        data = json.load(infile)

        for item in data:
            json.dump(item, outfile, ensure_ascii=False)
            outfile.write("\n")

    print(f"Converted to {output_file}")


async def main():
    parser = argparse.ArgumentParser(
        description="Upload dependency graph data to database"
    )
    parser.add_argument(
        "--nodes", type=str, required=True, help="Path to nodes JSON file"
    )
    parser.add_argument(
        "--edges", type=str, required=True, help="Path to edges JSON file"
    )
    parser.add_argument(
        "--convert",
        action="store_true",
        help="Convert input files to line-delimited JSON format",
    )
    parser.add_argument(
        "--streaming",
        action="store_true",
        help="Use streaming JSON parsing (requires ijson)",
    )
    parser.add_argument(
        "--chunked", action="store_true", help="Use chunked processing (default)"
    )

    args = parser.parse_args()

    # Check if files exist
    if not os.path.exists(args.nodes):
        print(f"Error: Nodes file {args.nodes} not found")
        return

    if not os.path.exists(args.edges):
        print(f"Error: Edges file {args.edges} not found")
        return

    # Convert files if requested
    if args.convert:
        nodes_ld = args.nodes.replace(".json", "_ld.json")
        edges_ld = args.edges.replace(".json", "_ld.json")

        await convert_to_line_delimited(args.nodes, nodes_ld)
        await convert_to_line_delimited(args.edges, edges_ld)

        print(f"Converted files created: {nodes_ld}, {edges_ld}")
        print("You can now use these files with --streaming option")
        return

    # Connect to database
    db = Prisma()
    await db.connect()

    try:
        # Choose upload method
        if args.streaming:
            print("Using streaming JSON parsing...")
            await upload_nodes_streaming(db, args.nodes)
            await upload_edges_streaming(db, args.edges)
        else:
            print("Using chunked processing...")
            await upload_nodes_chunked(db, args.nodes)
            await upload_edges_chunked(db, args.edges)

        print("Upload completed successfully!")

    except Exception as e:
        print(f"Error during upload: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
