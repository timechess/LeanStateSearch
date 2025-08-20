import { searchTheorem, feedback } from "@/lib/grpc";
import { PlainMessage } from "@bufbuild/protobuf";
import { Theorem } from "@/lib/gen/state_search/v1/state_search_pb";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { codeToHtml } from "shiki";
import { GoToDocButton, LikeDislikeToggle } from "./button";

async function MathlibTheoremCard({
  theorem,
  query,
  id,
}: {
  theorem: PlainMessage<Theorem>;
  query: string;
  id: number;
}) {
  const highlightedCode = await codeToHtml(theorem.code, {
    lang: "lean4",
    theme: "light-plus",
  });
  const create = async (liked: boolean) => {
    "use server";
    await feedback({
      query,
      theoremId: theorem.id,
      relevant: liked,
      update: false,
      rank: id,
    });
  };
  const update = async (liked: boolean) => {
    "use server";
    await feedback({
      query,
      theoremId: theorem.id,
      relevant: liked,
      update: true,
      rank: id,
    });
  };

  return (
    <Card className="w-full p-6 lg:p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 rounded-lg bg-white mb-6">
      {/* Header with theorem name and revision */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 text-left">
            {theorem.name}
          </CardTitle>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
          {theorem.rev}
        </span>
      </div>

      {/* Code content */}
      <CardContent className="text-gray-800 leading-relaxed text-md text-left">
        <div
          className="w-full rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </CardContent>

      {/* Footer with actions */}
      <CardFooter className="flex justify-between mt-6 items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <GoToDocButton
            query={query}
            theorem_id={theorem.id}
            rank={id}
            theorem_name={theorem.name}
          />
          <a
            href={`/graph/${encodeURIComponent(theorem.name)}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
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
            Explore in Dependency Graph
          </a>
        </div>
        <LikeDislikeToggle
          create={create}
          update={update}
          theorem={theorem.name}
          query={query}
          theorem_id={theorem.id}
          id={id}
        />
      </CardFooter>
    </Card>
  );
}

export async function StateSearchResultTable({
  query,
  nresult,
  rev,
}: {
  query: string;
  nresult: number;
  rev: string;
}) {
  const data = (await searchTheorem({ query, nresult, rev })).results;
  return (
    <div className="w-full mx-auto space-y-6">
      {data.map((theorem, id) => (
        <MathlibTheoremCard
          key={theorem.id}
          theorem={theorem}
          query={query}
          id={id}
        />
      ))}
    </div>
  );
}
