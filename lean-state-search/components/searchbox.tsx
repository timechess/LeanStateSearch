"use client";

import { Card, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";

const formSchema = z.object({
  proofState: z
    .string()
    .min(1, "Proof state is required")
    .regex(/\⊢/, "Must contain ⊢"),
  revision: z.string().min(1, "Please select a revision"),
  resultNum: z.number().min(10).max(100).default(20),
});

export default function SearchBox(props: { revs: string[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proofState: "",
      revision: props.revs[props.revs.length - 1],
      resultNum: 20,
    },
  });

  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (query: string, results: number, rev: string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("query", query);
      params.set("results", String(results));
      params.set("rev", rev);
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleSearch(values.proofState, values.resultNum, values.revision);
  }

  const handleClear = () => {
    const resultNum = form.getValues("resultNum");
    form.reset();
    form.setValue("resultNum", resultNum);
    replace(`${pathname}`);
  };

  return (
    <Card className="p-8 lg:p-12 w-full space-y-8 border-0 shadow-none bg-transparent">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Search Query
            </CardTitle>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Enter your current proof state from Lean infoview. The special
              token{" "}
              <code className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono font-semibold border border-gray-300">
                ⊢
              </code>{" "}
              is required.
            </p>
          </div>

          {/* Proof State Input */}
          <FormField
            control={form.control}
            name="proofState"
            render={({ field }) => (
              <FormItem>
                <FormMessage className="text-lg ml-2 text-left text-red-600 font-medium" />
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Paste your proof state here..."
                    className="h-[240px] text-lg lg:text-xl font-mono leading-relaxed border-2 border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 rounded-lg resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Controls Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid lg:grid-cols-4 gap-6 items-center">
              {/* Clear Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="w-full lg:w-auto text-lg h-14 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear
              </Button>

              {/* Results Slider */}
              <FormField
                control={form.control}
                name="resultNum"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700 mb-3">
                        Number of Results:{" "}
                        <span className="text-gray-900 text-xl">
                          {field.value}
                        </span>
                      </p>
                      <FormControl>
                        <Slider
                          min={10}
                          max={100}
                          step={10}
                          defaultValue={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          title="Number of Results"
                          className="w-full"
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>10</span>
                        <span>100</span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Revision Select */}
              <FormField
                control={form.control}
                name="revision"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700 mb-3">
                        Revision
                      </p>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormMessage className="text-left ml-1 text-red-600" />
                        <FormControl>
                          <SelectTrigger className="w-full h-14 border-2 border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200">
                            {props.revs.length > 0 ? (
                              <SelectValue
                                placeholder={props.revs[props.revs.length - 1]}
                                defaultValue={props.revs[props.revs.length - 1]}
                              />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {props.revs.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="text-center">
            <Button
              type="submit"
              className="w-full lg:w-auto text-xl h-16 px-12 bg-gray-900 hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
            >
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search Theorems
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
