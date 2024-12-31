import { StateSearchResultTable } from "@/components/search-result";
import SearchBox from "@/components/searchbox";
import { redirect } from "next/navigation";

export default async function StateSearchSearchPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {

  const query = searchParams?.query;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r">
      <main className="flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-extrabold text-gray-800 drop-shadow-lg">
          Lean State Search
        </h1>
        <p className="mt-4 text-2xl text-gray-700 max-w-xl">
          Search Mathlib Theorem with Proof States
        </p>

        <div className="mx-auto py-10">
          <SearchBox />
          {query ? (
            <div className="w-full mx-auto items-center mt-4">
              <StateSearchResultTable
                query={query}
                nresult={20}
                rerank={true}
                rev="v4.10.0"
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}