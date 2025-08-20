"use client";

import React, { useState } from "react";
import { Toggle } from "./ui/toggle";
import { ThumbsDown, ThumbsUp, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { copyTheorem, goToDoc } from "@/lib/actions";

type LikeDislikeToggleProps = {
  create?: (like: boolean) => void;
  update?: (like: boolean) => void;
  theorem?: string;
  query: string;
  theorem_id: string;
  id: number;
};

export const LikeDislikeToggle: React.FC<LikeDislikeToggleProps> = ({
  create,
  update,
  theorem,
  query,
  theorem_id,
  id,
}) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const handleLike = () => {
    if (!liked && !disliked) {
      setLiked(true);
      setDisliked(false);
      create && create(true);
    } else if (!liked && disliked) {
      setLiked(true);
      setDisliked(false);
      update && update(true);
    }
  };

  const handleDislike = () => {
    if (!disliked && !liked) {
      setDisliked(true);
      setLiked(false);
      create && create(false);
    } else if (!disliked && liked) {
      setDisliked(true);
      setLiked(false);
      update && update(false);
    }
  };

  const handleCopy = () => {
    copyTheorem(query, theorem_id, id);
    navigator.clipboard.writeText(theorem ? theorem : "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="flex space-x-4">
      <Button
        onClick={handleCopy}
        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700"
        variant="ghost"
      >
        {isCopied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </Button>
      <Toggle
        pressed={liked}
        onPressedChange={handleLike}
        className={`flex items-center px-4 py-2 ${
          liked
            ? "bg-green-500 text-white border-2 border-black"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        <ThumbsUp className="w-5 h-5" />
      </Toggle>
      <Toggle
        pressed={disliked}
        onPressedChange={handleDislike}
        className={`flex items-center px-4 py-2 ${
          disliked
            ? "bg-red-500 text-white border-2 border-black"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        <ThumbsDown className="w-5 h-5" />
      </Toggle>
    </div>
  );
};

export const GoToDocButton: React.FC<{
  query: string;
  theorem_id: string;
  rank: number;
  theorem_name: string;
}> = ({ query, theorem_id, rank, theorem_name }) => {
  return (
    <a
      href={`https://leanprover-community.github.io/mathlib4_docs/find/?pattern=${theorem_name}#doc`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
      onClick={() => {
        goToDoc(query, theorem_id, rank);
      }}
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
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      Go to Doc
    </a>
  );
};
