import { searchTheorem } from "@/lib/grpc";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 检查必填参数是否存在
  const query = searchParams.get("query");
  const results = searchParams.get("results");
  const rev = searchParams.get("rev");

  // 如果必填参数缺失，返回提示 schema 的 JSON
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
      { status: 400 }
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
      { status: 400 }
    );
  }


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