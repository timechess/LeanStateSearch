import { searchTheorem } from "@/lib/grpc";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") ?? "";
  const resultNum = Number.parseInt(searchParams.get("results") ?? "20");
  const rev = searchParams.get("rev") ?? "v4.16.0";
  const searchResults = (
    await searchTheorem({
      query: query,
      nresult: resultNum,
      rerank: false,
      rev: rev,
    })
  ).results;
  return NextResponse.json(searchResults);
}
