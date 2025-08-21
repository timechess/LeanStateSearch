"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AutocompleteInput } from "./autocomplete-input";

interface SearchFormProps {
  initialValue: string;
}

export function SearchForm({ initialValue }: SearchFormProps) {
  const [inputName, setInputName] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/graph/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleInputChange = (value: string) => {
    setInputName(value);
  };

  return (
    <AutocompleteInput
      value={inputName}
      onChange={handleInputChange}
      onSearch={handleSearch}
      placeholder="Enter theorem name..."
    />
  );
}
