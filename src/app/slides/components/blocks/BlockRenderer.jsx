"use client";

import React from "react";
import TextBlock from "./TextBlock";
import QuizBlock from "./QuizBlock";
import DividerBlock from "./DividerBlock";
import ImageBlock from "./ImageBlock";
import YoutubeBlock from "./YoutubeBlock";

const BlockRenderer = ({
  block,
  slideId,
  addBlock,
  updateBlock,
  toggleImportant,
}) => {
  if (block.type === "text") {
    return (
      <TextBlock
        block={block}
        slideId={slideId}
        addBlock={addBlock}
        updateBlock={updateBlock}
        toggleImportant={toggleImportant}
      />
    );
  }

  if (block.type === "divider") {
    return <DividerBlock />;
  }
  if (block.type === "image") {
    return (
      <ImageBlock block={block} slideId={slideId} updateBlock={updateBlock} />
    );
  }
  if (block.type === "youtube") {
    return (
      <YoutubeBlock slideId={slideId} block={block} updateBlock={updateBlock} />
    );
  }
  if (block.type === "quiz") {
    return <QuizBlock />;
  }

  return null;
};

export default BlockRenderer;
