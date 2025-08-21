import json
from lean_graph_tool import LeanGraph

graph = LeanGraph.load_from_json("/home/timechess/GitHub/TheoremForge/graph.json")

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

with open("nodes.json", "w") as f:
    json.dump(prisma_nodes, f, ensure_ascii=False)

del nodes
del prisma_nodes

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

with open("edges.json", "w") as f:
    json.dump(prisma_edges, f, ensure_ascii=False)
