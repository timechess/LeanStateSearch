"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function SearchBox() {
  const [inputValue, setInputValue] = useState("");
  const pathname = usePathname();
  const { replace } = useRouter();
  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <Card className="p-8 w-[1200px] max-w-6xl space-y-4 mx-auto border-black">
      <div className="flex mx-4">
        <CardTitle className="text-left">Query</CardTitle>
        <span className="ml-4 mt-0.5">
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
        <Button onClick={() => handleSearch(inputValue)} className="w-1/4">
          Search
        </Button>
      </div>
    </Card>
  );
}
