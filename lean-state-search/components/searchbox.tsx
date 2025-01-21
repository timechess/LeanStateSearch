"use client";

import { useState } from "react";
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

export default function SearchBox(props: { revs: string[] }) {
  const [inputValue, setInputValue] = useState("");
  const [resultNum, setResultNum] = useState(20);
  const [rev, setRev] = useState("");
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

  const handleClear = () => {
    setInputValue("");
  };

  const handleResultNum = (value: number[]) => {
    setResultNum(value[0]);
  };

  const changeRev = (value: string) => {
    setRev(value);
  };
  return (
    <Card className="p-8 w-[1200px] max-w-6xl space-y-4 mx-auto border-black">
      <div className="flex mx-4">
        <CardTitle className="text-left mt-1">Query</CardTitle>
        <span className="ml-4">
          Your current proof state (You can copy it in VSCode)
        </span>
      </div>

      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your proof state"
        className="h-[200px] mt-4"
      />
      <div className="flex space-x-4 justify-between">
        <Button
          variant="outline"
          onClick={handleClear}
          className="w-1/4 border-black"
        >
          Clear
        </Button>
        <div className="text-left">
          <p className="mb-2">Number of Results: {resultNum}</p>
          <Slider
            defaultValue={[20]}
            max={100}
            step={10}
            onValueChange={handleResultNum}
            title="Number of Results"
            className="w-[360px]"
          />
        </div>
        <Select onValueChange={changeRev}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a revision" />
          </SelectTrigger>
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
        <Button
          onClick={() => handleSearch(inputValue, resultNum, rev)}
          className="w-1/4"
        >
          Search
        </Button>
      </div>
    </Card>
  );
}
