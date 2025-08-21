"use server";

import {
  click,
  getDependencyNodesAndEdges,
  getDependentNodesAndEdges,
} from "./grpc";

export async function copyTheorem(
  query: string,
  theorem_id: string,
  rank: number,
) {
  await click({
    query,
    theoremId: theorem_id,
    rank,
  });
}

export async function goToDoc(query: string, theorem_id: string, rank: number) {
  await click({
    query,
    theoremId: theorem_id,
    rank,
  });
}

export async function fetchDependencyData(name: string) {
  return await getDependencyNodesAndEdges({ name });
}

export async function fetchDependentData(name: string) {
  return await getDependentNodesAndEdges({ name });
}
