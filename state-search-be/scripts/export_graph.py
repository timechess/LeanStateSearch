import json
import argparse
from lean_graph_tool import LeanGraph


def export_to_regular_json(graph_path: str, nodes_output: str, edges_output: str):
    """Export to regular JSON array format (original method)."""
    print(f"Loading graph from {graph_path}...")
    graph = LeanGraph.load_from_json(graph_path)

    print("Processing nodes...")
    nodes = graph.get_all_nodes()
    prisma_nodes = [
        {
            "name": node.name,
            "const_category": node.const_category,
            "const_type": node.const_type,
            "module": node.module,
            "doc_string": node.doc_string,
            "informal_name": node.informal_name,
            "informal_statement": node.informal_statement,
        }
        for node in nodes
    ]

    print(f"Writing {len(prisma_nodes)} nodes to {nodes_output}...")
    with open(nodes_output, "w") as f:
        json.dump(prisma_nodes, f, ensure_ascii=False, indent=2)

    del nodes
    del prisma_nodes

    print("Processing edges...")
    edges = graph.get_edges()
    prisma_edges = [
        {
            "id": f"{edge.edge_type}_{edge.from_name}->{edge.to_name}",
            "source": edge.from_name,
            "target": edge.to_name,
            "edge_type": edge.edge_type,
        }
        for edge in edges
    ]

    print(f"Writing {len(prisma_edges)} edges to {edges_output}...")
    with open(edges_output, "w") as f:
        json.dump(prisma_edges, f, ensure_ascii=False, indent=2)

    print("Export completed successfully!")


def export_to_line_delimited_json(
    graph_path: str, nodes_output: str, edges_output: str
):
    """Export to line-delimited JSON format for streaming processing."""
    print(f"Loading graph from {graph_path}...")
    graph = LeanGraph.load_from_json(graph_path)

    print("Processing nodes...")
    nodes = graph.get_all_nodes()

    print(f"Writing {len(nodes)} nodes to {nodes_output}...")
    with open(nodes_output, "w") as f:
        for node in nodes:
            prisma_node = {
                "name": node.name,
                "const_category": node.const_category,
                "const_type": node.const_type,
                "module": node.module,
                "doc_string": node.doc_string,
                "informal_name": node.informal_name,
                "informal_statement": node.informal_statement,
            }
            json.dump(prisma_node, f, ensure_ascii=False)
            f.write("\n")

    del nodes

    print("Processing edges...")
    edges = graph.get_edges()

    print(f"Writing {len(edges)} edges to {edges_output}...")
    with open(edges_output, "w") as f:
        for edge in edges:
            prisma_edge = {
                "id": f"{edge.edge_type}_{edge.from_name}->{edge.to_name}",
                "source": edge.from_name,
                "target": edge.to_name,
                "edge_type": edge.edge_type,
            }
            json.dump(prisma_edge, f, ensure_ascii=False)
            f.write("\n")

    print("Export completed successfully!")


def main():
    parser = argparse.ArgumentParser(
        description="Export dependency graph data from LeanGraphTool"
    )
    parser.add_argument(
        "--graph", type=str, required=True, help="Path to graph.json file"
    )
    parser.add_argument(
        "--nodes", type=str, default="nodes.json", help="Output file for nodes"
    )
    parser.add_argument(
        "--edges", type=str, default="edges.json", help="Output file for edges"
    )
    parser.add_argument(
        "--format",
        choices=["regular", "line-delimited"],
        default="regular",
        help="Output format: regular JSON array or line-delimited JSON",
    )

    args = parser.parse_args()

    if args.format == "line-delimited":
        # Use .ld.json extension for line-delimited files
        nodes_output = args.nodes.replace(".json", "_ld.json")
        edges_output = args.edges.replace(".json", "_ld.json")
        export_to_line_delimited_json(args.graph, nodes_output, edges_output)
    else:
        export_to_regular_json(args.graph, args.nodes, args.edges)


if __name__ == "__main__":
    main()
