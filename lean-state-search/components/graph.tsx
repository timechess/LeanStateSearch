"use client";

import { LeanEdge, LeanNode } from "@/lib/gen/state_search/v1/state_search_pb";
import { PlainMessage } from "@bufbuild/protobuf";
import dynamic from "next/dynamic";
import { Markdown } from "./markdown";

const GraphCanvas = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  { ssr: false }
);

// Academic color scheme for different node types - distinct and professional
const color_map = {
  "Theorem": "#1e40af",      // Blue - primary mathematical objects
  "Definition": "#059669",   // Green - foundational definitions
  "Structure": "#7c3aed",    // Purple - structural elements
  "Inductive": "#dc2626",    // Red - inductive types
  "default": "#6b7280",      // Gray - default for unknown types
};

// Edge color scheme based on weight/relationship type
const getEdgeColor = (weight: number) => {
  if (weight === 0) {
    return "#d1d5db";  // Light gray for weak/no relationship
  } else if (weight === 1) {
    return "#9ca3af";  // Medium gray for moderate relationship
  } else {
    return "#6b7280";  // Darker gray for strong relationship
  }
};

export default function Graph({ nodes, edges }: { nodes: PlainMessage<LeanNode>[], edges: PlainMessage<LeanEdge>[] }) {
  const graph_nodes = nodes.map((node) => ({
    id: node.name,
    label: node.name,
    fill: color_map[node.constCategory as keyof typeof color_map] || color_map.default,
    data: node,
  }));

  const graph_edges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    fill: getEdgeColor(edge.weight),
    data: edge,
  }));

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-center text-center">
          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Tip:</span> Right-click on any node to view detailed information, or right-click on edges to see relationship details.
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full relative">
        {graph_nodes.length > 0 && graph_edges.length > 0 ? (
          <>
            {/* Instructions */}


            {/* Graph Canvas */}
            <div className="w-full h-[800px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <GraphCanvas
                nodes={graph_nodes}
                edges={graph_edges}
                aggregateEdges={true}
                contextMenu={({ data, onClose }) => {
                  if (!data) return null;

                  // Check if it's a node or edge
                  const isNode = 'name' in data.data;
                  const isEdge = 'source' in data.data && 'target' in data.data;

                  if (isNode) {
                    const node = data.data as PlainMessage<LeanNode>;
                    console.log('Node clicked:', node);

                    return (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[28rem] max-w-3xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Node Information</h3>
                          <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Node Details */}
                        <div className="space-y-3">
                          {/* Name */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                            <p className="text-gray-900 font-mono text-sm break-all">{node.name}</p>
                          </div>

                          {/* Category */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Type</label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color_map[node.constCategory as keyof typeof color_map] || color_map.default }}
                              ></div>
                              <span className="text-gray-900 font-medium capitalize">{node.constCategory || 'Unknown'}</span>
                            </div>
                          </div>

                          {/* Module */}
                          {node.module && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 block mb-1">Module</label>
                              <p className="text-gray-900 font-mono text-sm break-all">{node.module}</p>
                            </div>
                          )}
                        </div>

                        {/* Doc String */}
                        {node.docString && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-500 block mb-2">Doc String</label>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                              <Markdown content={node.docString} />
                            </div>
                          </div>
                        )}

                        {/* Informal Name */}
                        {node.informalName && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-500 block mb-2">Informal Name</label>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                              <Markdown content={node.informalName} />
                            </div>
                          </div>
                        )}

                        {/* Informal Statement */}
                        {node.informalStatement && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-500 block mb-2">Informal Statement</label>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                              <Markdown content={node.informalStatement} />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-200">
                          <a
                            href={`/graph/${encodeURIComponent(node.name)}`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            View Graph
                          </a>

                          <a
                            href={`https://leanprover-community.github.io/mathlib4_docs/find/?pattern=${encodeURIComponent(node.name)}#doc`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Docs
                          </a>

                          <button
                            onClick={() => {
                              // Copy node name to clipboard
                              navigator.clipboard.writeText(node.name);
                              onClose();
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Name
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (isEdge) {
                    const edge = data.data as PlainMessage<LeanEdge>;
                    console.log('Edge clicked:', edge);

                    return (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80 max-w-96">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Edge Information</h3>
                          <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Edge Details */}
                        <div className="space-y-3">
                          {/* Source */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Source</label>
                            <p className="text-gray-900 font-mono text-sm break-all">{edge.source}</p>
                          </div>

                          {/* Target */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Target</label>
                            <p className="text-gray-900 font-mono text-sm break-all">{edge.target}</p>
                          </div>

                          {/* Weight */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Relationship</label>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {edge.weight === 0 ? (
                                  <span className="text-gray-900 font-medium">
                                    typeDeps
                                  </span>
                                ) : (
                                  <span className="text-gray-900 font-medium">
                                    bodyDeps
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No dependency data available</p>
              <p className="text-gray-400 text-sm mt-1">This theorem has no recorded dependencies</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}