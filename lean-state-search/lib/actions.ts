"use server";

import { click } from "./grpc";

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
