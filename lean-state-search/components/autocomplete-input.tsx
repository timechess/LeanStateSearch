"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAutocomplete } from "@/hooks/useAutocomplete";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSearch,
  placeholder = "Enter theorem name...",
  className = "",
  disabled = false,
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isLoading,
    error,
    showDropdown,
    selectedIndex,
    updateSuggestions,
    selectSuggestion,
    showDefaultSuggestions,
    hideDropdown,
    handleKeyDown: hookHandleKeyDown,
  } = useAutocomplete({
    minChars: 2,
    maxSuggestions: 10,
  });

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);

      if (newValue.trim()) {
        updateSuggestions(newValue);
      } else {
        hideDropdown();
      }
    },
    [onChange, updateSuggestions, hideDropdown],
  );

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (!inputValue.trim()) {
      showDefaultSuggestions();
    }
  }, [inputValue, showDefaultSuggestions]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay hiding dropdown to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      hideDropdown();
    }, 150);
  }, [hideDropdown]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      const selected = selectSuggestion(suggestion);
      setInputValue(selected);
      onChange(selected);
      onSearch(selected);
      hideDropdown();
      inputRef.current?.blur();
    },
    [selectSuggestion, onChange, onSearch, hideDropdown],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !showDropdown) {
        e.preventDefault();
        onSearch(inputValue.trim());
        return;
      }

      hookHandleKeyDown(e, handleSuggestionClick);
    },
    [
      showDropdown,
      inputValue,
      onSearch,
      handleSuggestionClick,
      hookHandleKeyDown,
    ],
  );

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  }, [inputValue, onSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        hideDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hideDropdown]);

  return (
    <div className="relative">
      {/* Input and Search Button */}
      <div className="flex items-center space-x-3 max-w-md">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm ${
              disabled ? "bg-gray-100 cursor-not-allowed" : ""
            } ${className}`}
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        <button
          onClick={handleSearchClick}
          disabled={!inputValue.trim() || disabled}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-4 h-4"
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
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error loading suggestions: {error}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3 py-2 cursor-pointer text-sm font-mono hover:bg-purple-50 transition-colors ${
                index === selectedIndex
                  ? "bg-purple-100 text-purple-900"
                  : "text-gray-900"
              }`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown &&
        inputValue.trim() &&
        suggestions.length === 0 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-3 py-2 text-sm text-gray-500">
              No matches found
            </div>
          </div>
        )}
    </div>
  );
}
