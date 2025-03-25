import { call, getAllRev, searchTheorem } from "@/lib/grpc";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get("query");
  const results = searchParams.get("results");
  const rev = searchParams.get("rev");
  const all_rev = (await getAllRev({})).revs;
  if (!query || !results || !rev) {
    return NextResponse.json(
      {
        error: "Missing required parameters",
        schema: {
          description: "The following parameters are required:",
          parameters: {
            query: {
              type: "string",
              description: "The search query string",
            },
            results: {
              type: "number",
              description: "The number of results to return",
            },
            rev: {
              type: "string",
              description: "The revision of the theorem database to use",
            },
          },
        },
      },
      { status: 400 },
    );
  }

  if (!query.includes("⊢")) {
    return NextResponse.json(
      {
        error: "Invalid parameter value",
        schema: {
          description: "The 'query' parameter must be a valid Lean proof state",
        },
      },
      { status: 400 },
    );
  }

  if (!all_rev.includes(rev)) {
    return NextResponse.json(
      {
        error: "Invalid parameter value",
        schema: {
          description:
            "Lean State Search does not support the specified revision",
        },
      },
      { status: 400 },
    );
  }

  const resultNum = Number.parseInt(results);
  if (isNaN(resultNum)) {
    return NextResponse.json(
      {
        error: "Invalid parameter value",
        schema: {
          description: "The 'results' parameter must be a valid number",
        },
      },
      { status: 400 },
    );
  }

  const searchResults = (
    await searchTheorem({
      query: query,
      nresult: resultNum,
      rev: rev,
    })
  ).results;
  await call({ callType: 1 });
  const apiResults = searchResults.map((result) => {
    {
      return {
        name: result.name,
        formal_type: result.formalType,
        module: result.module,
        rev: result.rev,
      };
    }
  });

  return NextResponse.json(apiResults);
}
