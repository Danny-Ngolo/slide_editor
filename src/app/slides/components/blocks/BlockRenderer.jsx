"use client";

import React from "react";
import TextBlock from "./TextBlock";
import QuizBlock from "./QuizBlock";
import DividerBlock from "./DividerBlock";
import ImageBlock from "./ImageBlock";
import YoutubeBlock from "./YoutubeBlock";
import CalloutBlock from "./CalloutBlock";

const BlockRenderer = ({
  block,
  slideId,
  addBlock,
  updateBlock,
  deleteBlock,
  toggleImportant,
}) => {
  if (block.type === "text") {
    return (
      <TextBlock
        block={block}
        slideId={slideId}
        addBlock={addBlock}
        updateBlock={updateBlock}
        deleteBlock={deleteBlock}
        toggleImportant={toggleImportant}
      />
    );
  }

  if (block.type === "divider") {
    return <DividerBlock />;
  }
  if (block.type === "image") {
    return (
      <ImageBlock
        block={block}
        slideId={slideId}
        updateBlock={updateBlock}
        deleteBlock={deleteBlock}
      />
    );
  }
  if (block.type === "youtube") {
    return (
      <YoutubeBlock
        slideId={slideId}
        block={block}
        updateBlock={updateBlock}
        deleteBlock={deleteBlock}
      />
    );
  }
  if (block.type === "callout") {
    return (
      <CalloutBlock
        slideId={slideId}
        block={block}
        updateBlock={updateBlock}
        deleteBlock={deleteBlock}
      />
    );
  }
  if (block.type === "quiz") {
    return <QuizBlock />;
  }

  return null;
};

export default BlockRenderer;
