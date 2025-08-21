"use client";

import Graph from "@/components/graph";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GraphPage(props: {
  params: Promise<{
    name: string;
  }>;
}) {
  const [params, setParams] = useState<{ name: string } | null>(null);
  const [inputName, setInputName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Handle async params
  useEffect(() => {
    props.params.then((resolvedParams) => {
      setParams(resolvedParams);
      setInputName(resolvedParams.name);
      setIsLoading(false);
    });
  }, [props.params]);

  const handleSearch = () => {
    if (inputName.trim()) {
      router.push(`/graph/${encodeURIComponent(inputName.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading || !params) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-3 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter theorem name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!inputName.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Graph Container */}
        <Graph nodes={[]} edges={[]} nodeName={params.name} />
      </div>
    </div>
  );
}
