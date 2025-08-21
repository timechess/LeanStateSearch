import Graph from "@/components/graph";
import { SearchForm } from "@/components/search-form";

export default async function GraphPage(props: {
  params: Promise<{
    name: string;
  }>;
}) {
  const params = await props.params;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dependency Graph
          </h1>
          <p className="text-gray-600 mb-4">
            Showing dependencies for:{" "}
            <span className="font-mono bg-gray-200 px-2 py-1 rounded">
              {params.name}
            </span>
          </p>

          {/* Search Input */}
          <SearchForm initialValue={params.name} />
        </div>

        {/* Graph Container */}
        <Graph nodes={[]} edges={[]} nodeName={params.name} />
      </div>
    </div>
  );
}
