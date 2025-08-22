"use client";

import { LeanEdge, LeanNode } from "@/lib/gen/state_search/v1/state_search_pb";
import { PlainMessage } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { Markdown } from "./markdown";
import { useState, useEffect, useRef } from "react";
import { fetchDependencyData, fetchDependentData } from "@/lib/actions";

// Backend now handles sampling, so this function is no longer needed

const GraphCanvas = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  { ssr: false },
);

// Academic color scheme for different node types - distinct and professional
const color_map = {
  Theorem: "#1e40af", // Blue - primary mathematical objects
  Definition: "#059669", // Green - foundational definitions
  Structure: "#7c3aed", // Purple - structural elements
  Inductive: "#dc2626", // Red - inductive types
  default: "#6b7280", // Gray - default for unknown types
};

// Edge color scheme based on edge type
const getEdgeColor = (edgeType: string) => {
  if (edgeType === "typeDeps") {
    return "#d1d5db"; // Light gray for type dependencies
  } else if (edgeType === "bodyDeps") {
    return "#6b7280"; // Darker gray for body dependencies
  } else {
    return "#9ca3af"; // Medium gray for other relationship types
  }
};

export default function Graph({
  nodes: initialNodes,
  edges: initialEdges,
  nodeName,
}: {
  nodes: PlainMessage<LeanNode>[];
  edges: PlainMessage<LeanEdge>[];
  nodeName: string;
}) {
  const [nodes, setNodes] = useState<PlainMessage<LeanNode>[]>(initialNodes);
  const [edges, setEdges] = useState<PlainMessage<LeanEdge>[]>(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"dependency" | "dependent">(
    "dependency",
  );
  const [showSamplingDialog, setShowSamplingDialog] = useState(false);
  const [samplingInfo, setSamplingInfo] = useState<{
    originalCount: number;
    sampledCount: number;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: "node" | "edge";
    data: PlainMessage<LeanNode> | PlainMessage<LeanEdge>;
  } | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default width: 384px (w-96)
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const fetchData = async (mode: "dependency" | "dependent") => {
    setIsLoading(true);
    try {
      let data;
      if (mode === "dependency") {
        data = await fetchDependencyData(nodeName);
      } else {
        data = await fetchDependentData(nodeName);
      }
      console.log(`Fetched ${mode} data:`, data);

      const processedNodes = data.nodes || [];
      const processedEdges = data.edges || [];

      // Check if backend performed sampling
      if (data.samplingInfo && data.samplingInfo.wasSampled) {
        setSamplingInfo({
          originalCount: data.samplingInfo.originalNodeCount,
          sampledCount: data.samplingInfo.sampledNodeCount,
        });
        setShowSamplingDialog(true);
      } else {
        setSamplingInfo(null);
        setShowSamplingDialog(false);
      }

      setNodes(processedNodes);
      setEdges(processedEdges);
      setViewMode(mode);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial dependency data when component mounts
  useEffect(() => {
    fetchData("dependency");
  }, [nodeName]);

  const graph_nodes = nodes.map((node) => ({
    id: node.name,
    label: node.name,
    fill:
      color_map[node.constCategory as keyof typeof color_map] ||
      color_map.default,
    data: node,
  }));

  const graph_edges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    fill: getEdgeColor(edge.edgeType),
    data: edge,
  }));

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      // Constrain width between 300px and 800px
      const constrainedWidth = Math.max(300, Math.min(800, newWidth));
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Tip:</span> Click on any node to
                view detailed information, or click on edges to see relationship
                details.
              </p>
              {nodes.length > 0 && (
                <p className="mt-1">
                  <span className="font-medium">Displaying:</span>{" "}
                  {nodes.length} nodes and {edges.length} edges
                  {samplingInfo && (
                    <span className="text-blue-600 ml-2">
                      (backend sampled from {samplingInfo.originalCount} nodes,
                      target node always included)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => fetchData("dependency")}
                disabled={isLoading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "dependency"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Dependencies
              </button>
              <button
                onClick={() => fetchData("dependent")}
                disabled={isLoading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "dependent"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Dependents
              </button>
            </div>
            {isLoading && (
              <div className="flex items-center text-gray-500">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Sampling Info Dialog */}
        {showSamplingDialog && samplingInfo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Large Graph Detected
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This graph contains {samplingInfo.originalCount} nodes,
                    which exceeds the display limit of 50. The backend has
                    randomly sampled {samplingInfo.sampledCount} nodes to ensure
                    optimal performance.
                  </p>
                  <p className="mt-1">
                    <strong>Note:</strong> The node you&apos;re viewing is
                    always included in the sample. The displayed edges only show
                    relationships between the sampled nodes.
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowSamplingDialog(false)}
                    className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full relative">
        {graph_nodes.length > 0 && graph_edges.length > 0 ? (
          <>
            {/* Graph Canvas */}
            <div className="w-full h-[800px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <GraphCanvas
                nodes={graph_nodes}
                edges={graph_edges}
                aggregateEdges={true}
                layoutType="forceDirected2d"
                onNodeClick={(node) => {
                  console.log("Node clicked:", node);
                  setSelectedItem({
                    type: "node",
                    data: node.data,
                  });
                }}
                onEdgeClick={(edge) => {
                  console.log("Edge clicked:", edge);
                  setSelectedItem({
                    type: "edge",
                    data: edge.data,
                  });
                }}
                onCanvasClick={() => {
                  setSelectedItem(null);
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                No {viewMode} data available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                This theorem has no recorded{" "}
                {viewMode === "dependency" ? "dependencies" : "dependents"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar for Node/Edge Information */}
      {selectedItem && (
        <div
          className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-50"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors"
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-full"></div>
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedItem.type === "node"
                  ? "Node Information"
                  : "Edge Information"}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {selectedItem.type === "node" ? (
              <NodeInfoSidebar
                node={selectedItem.data as PlainMessage<LeanNode>}
              />
            ) : (
              <EdgeInfoSidebar
                edge={selectedItem.data as PlainMessage<LeanEdge>}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Node Information Sidebar Component
function NodeInfoSidebar({ node }: { node: PlainMessage<LeanNode> }) {
  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">
          Name
        </label>
        <p className="text-gray-900 font-mono text-sm break-all">{node.name}</p>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">
          Type
        </label>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                color_map[node.constCategory as keyof typeof color_map] ||
                color_map.default,
            }}
          ></div>
          <span className="text-gray-900 font-medium capitalize">
            {node.constCategory || "Unknown"}
          </span>
        </div>
      </div>

      {/* Module */}
      {node.module && (
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Module
          </label>
          <p className="text-gray-900 font-mono text-sm break-all">
            {node.module}
          </p>
        </div>
      )}

      {/* Doc String */}
      {node.docString && (
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Doc String
          </label>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <Markdown content={node.docString} />
          </div>
        </div>
      )}

      {/* Informal Name */}
      {node.informalName && (
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Informal Name
          </label>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <Markdown content={node.informalName} />
          </div>
        </div>
      )}

      {/* Informal Statement */}
      {node.informalStatement && (
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Informal Statement
          </label>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <Markdown content={node.informalStatement} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
        <a
          href={`/graph/${encodeURIComponent(node.name)}`}
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          View Graph
        </a>

        <a
          href={`https://leanprover-community.github.io/mathlib4_docs/find/?pattern=${encodeURIComponent(node.name)}#doc`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View Docs
        </a>

        <button
          onClick={() => {
            navigator.clipboard.writeText(node.name);
          }}
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy Name
        </button>
      </div>
    </div>
  );
}

// Edge Information Sidebar Component
function EdgeInfoSidebar({ edge }: { edge: PlainMessage<LeanEdge> }) {
  return (
    <div className="space-y-6">
      {/* Source */}
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">
          Source
        </label>
        <p className="text-gray-900 font-mono text-sm break-all">
          {edge.source}
        </p>
      </div>

      {/* Target */}
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">
          Target
        </label>
        <p className="text-gray-900 font-mono text-sm break-all">
          {edge.target}
        </p>
      </div>

      {/* Edge Type */}
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">
          Relationship
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-gray-900 font-medium">
            {edge.edgeType || "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}
