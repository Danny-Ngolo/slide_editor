"use client";

import React from "react";
import TextBlock from "./blocks/TextBlock";
import QuizBlock from "./blocks/QuizBlock";
import DividerBlock from "./blocks/DividerBlock";
import ImageBlock from "./blocks/ImageBlock";
import YoutubeBlock from "./YoutubeBlock";

const BlockRenderer = ({ block, slideId, updateBlock }) => {
  if (block.type === "text") {
    return (
      <TextBlock block={block} slideId={slideId} updateBlock={updateBlock} />
    );
  }

  if (block.type === "divider") {
    return <DividerBlock />;
  }
  if (block.type === "image") {
    return <ImageBlock />;
  }
  if (block.type === "youtube") {
    return <YoutubeBlock />;
  }
  if (block.type === "quiz") {
    return <QuizBlock />;
  }

  return null;
};

export default BlockRenderer;
