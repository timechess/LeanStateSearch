import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNodeSuggestions } from "@/lib/actions";

interface UseAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  maxSuggestions?: number;
}

export function useAutocomplete(options: UseAutocompleteOptions = {}) {
  const { debounceMs = 300, minChars = 2, maxSuggestions = 10 } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("leanStateSearch_recentSearches");
    if (stored) {
      try {
        const recent = JSON.parse(stored);
        setRecentSearches(Array.isArray(recent) ? recent : []);
      } catch (e) {
        console.warn("Failed to parse recent searches from localStorage");
      }
    }
  }, []);

  // Update suggestions based on input with debouncing
  const updateSuggestions = useCallback(
    async (input: string) => {
      if (!input || input.length < minChars) {
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        return;
      }

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for debounced API call
      debounceTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetchNodeSuggestions(input, maxSuggestions);
          const newSuggestions = response.suggestions || [];
          setSuggestions(newSuggestions);
          setShowDropdown(newSuggestions.length > 0);
          setSelectedIndex(-1);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch suggestions",
          );
          setSuggestions([]);
          setShowDropdown(false);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    },
    [minChars, maxSuggestions, debounceMs],
  );

  // Add to recent searches
  const addToRecentSearches = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const newRecent = [trimmed, ...filtered].slice(0, 10); // Keep last 10

      // Save to localStorage
      try {
        localStorage.setItem(
          "leanStateSearch_recentSearches",
          JSON.stringify(newRecent),
        );
      } catch (e) {
        console.warn("Failed to save recent searches to localStorage");
      }

      return newRecent;
    });
  }, []);

  // Get suggestions for empty input (recent searches)
  const showDefaultSuggestions = useCallback(() => {
    setSuggestions(recentSearches);
    setShowDropdown(recentSearches.length > 0);
    setSelectedIndex(-1);
  }, [recentSearches]);

  // Hide dropdown
  const hideDropdown = useCallback(() => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, []);

  // Select a suggestion
  const selectSuggestion = useCallback(
    (value: string) => {
      addToRecentSearches(value);
      hideDropdown();
      return value;
    },
    [addToRecentSearches, hideDropdown],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, onSelect?: (value: string) => void) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            const selected = suggestions[selectedIndex];
            selectSuggestion(selected);
            onSelect?.(selected);
          }
          break;
        case "Escape":
          hideDropdown();
          break;
      }
    },
    [suggestions, selectedIndex, selectSuggestion, hideDropdown],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    suggestions,
    isLoading,
    error,
    showDropdown,
    selectedIndex,
    recentSearches,

    // Actions
    updateSuggestions,
    selectSuggestion,
    showDefaultSuggestions,
    hideDropdown,
    handleKeyDown,
    addToRecentSearches,
  };
}
