"use client";

import React, { useState } from "react";
import { Toggle } from "./ui/toggle";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type LikeDislikeToggleProps = {
  create?: (like: boolean) => void;
  update?: (like: boolean) => void;
};

const LikeDislikeToggle: React.FC<LikeDislikeToggleProps> = ({
  create,
  update,
}) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

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

  return (
    <div className="flex space-x-4">
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

export default LikeDislikeToggle;
