import { getNodesAndEdges } from "@/lib/grpc";
import Graph from "@/components/graph";


export default async function GraphPage(props: {
  params: Promise<{
    name: string;
  }>;
}) {
  const params = await props.params;
  const name = params.name;
  const { nodes, edges } = await getNodesAndEdges({ name: name ?? "" });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dependency Graph</h1>
          <p className="text-gray-600">Showing dependencies for: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{name}</span></p>
        </div>

        {/* Graph Container */}
          <Graph nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}
