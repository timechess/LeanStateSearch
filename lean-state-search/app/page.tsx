import { AboutPage } from "@/components/about";
import { StateSearchResultTable } from "@/components/search-result";
import SearchBox from "@/components/searchbox";
import { call, getAllRev } from "@/lib/grpc";

export default async function StateSearchSearchPage(props: {
  searchParams?: Promise<{
    query?: string;
    results?: string;
    rev?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const query = searchParams?.query;
  const results = Number.parseInt(searchParams?.results ?? "20");
  const rev = searchParams?.rev;
  const all_revs = (await getAllRev({})).revs;
  if (query) {
    await call({ callType: 0, query });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
              Lean State Search
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
              Search Mathlib Theorems with Proof States
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <SearchBox revs={all_revs} />
          </div>
        </div>

        {/* Results or About Section */}
        <div className="min-h-[400px]">
          {query ? (
            <div className="space-y-6">
              {/* Results Table */}
              <StateSearchResultTable
                query={query}
                nresult={results}
                rev={rev ?? all_revs[all_revs.length - 1]}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <AboutPage />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Developed by the AI4Math team at Renmin University of China
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Powered by Next.js and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
