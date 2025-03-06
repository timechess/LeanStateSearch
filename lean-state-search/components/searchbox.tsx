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
      revision: props.revs[0],
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
    replace(`${pathname}`)
  };

  return (
    <Card className="p-8 w-full space-y-16 border-black">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex mx-4">
            <CardTitle className="text-left mt-1 text-2xl">Query</CardTitle>
            <span className="ml-4 mt-2 text-xl">
              Your current proof state (You can copy it in VSCode. Must contain
              ⊢.)
            </span>
          </div>

          <FormField
            control={form.control}
            name="proofState"
            render={({ field }) => (
              <FormItem>
                <FormMessage className="text-xl ml-1 text-left" />
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter your proof state"
                    className="h-[200px] mt-4 text-2xl"
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

          <div className="flex space-x-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="w-1/4 text-xl h-12 border-black"
            >
              Clear
            </Button>

            <FormField
              control={form.control}
              name="resultNum"
              render={({ field }) => (
                <FormItem className="w-[360px]">
                  <p className="mb-2">Number of Results: {field.value}</p>
                  <FormControl>
                    <Slider
                      min={10}
                      max={100}
                      step={10}
                      defaultValue={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      title="Number of Results"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revision"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormMessage className="text-left ml-1" />
                    <FormControl>
                      <SelectTrigger className="w-64 h-12">
                        <SelectValue placeholder={props.revs[0]} defaultValue={props.revs[0]} />
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
                </FormItem>
              )}
            />

            <Button type="submit" className="w-1/4 text-xl h-12">
              Search
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
