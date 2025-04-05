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
    <Card className="w-full p-6 space-y-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 rounded-lg bg-white mb-4">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <CardTitle className="text-xl font-semibold text-black text-left inline-block">
          {theorem.name}
        </CardTitle>
        <span className="text-sm text-gray-500 inline-block">
          {theorem.rev}
        </span>
      </div>
      <CardContent className="text-black leading-relaxed text-md text-left">
        <pre
          className="w-full rounded px-4 pt-4"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </CardContent>
      <CardFooter className="flex justify-between mt-4 items-center">
        <GoToDocButton
          query={query}
          theorem_id={theorem.id}
          rank={id}
          theorem_name={theorem.name}
        />
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
    <div className="w-full mx-auto mt-4">
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
