"use client";

import React, { useEffect, useState } from "react";
import TextBlock from "./TextBlock";
import QuizBlock from "./QuizBlock";
import DividerBlock from "./DividerBlock";
import ImageBlock from "./ImageBlock";
import YoutubeBlock from "./YoutubeBlock";
import CalloutBlock from "./CalloutBlock";
import BlockActions from "../BlockActions";
import { MoreVertical } from "lucide-react";
import { useEditorContext } from "../EditorContext";

// *********** FIX THE ISSELECTEDBLOCK FOR ONE AND MANY SELECTED BLOCKS AND THE ONCLICK AT THE BLOCK

const BlockRenderer = ({
  block,
  slideId,
  addBlock,
  updateBlock,
  deleteBlock,
  duplicateBlock,
  toggleImportant,
  copyBlock,
  pasteBlock,
  copiedBlock,
  isUndoRedo,
  editorToolbarRef,
  setSlidesWithoutHistory,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { handleSelectBlock, isBlockSelected } = useEditorContext();

  return (
    <div
      onClick={(e) => {
        handleSelectBlock(e, slideId, block.id);
      }}
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: block.important ? "2px solid orange" : "1px solid #ccc",
        minHeight: "80px",
        position: "relative",
        boxShadow: isBlockSelected(slideId, block.id)
          ? "0 0 0 2px #fff"
          : "none",
      }}
    >
      <div
        onClick={() => setShowActions((prev) => !prev)}
        style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          zIndex: 1000,
          fontSize: "18px",
          cursor: "pointer",
          background: "#222",
          color: "white",
          textShadow: "1px 2px 3px black",
          borderRadius: "2px",
        }}
      >
        <MoreVertical size={18} />
      </div>

      {showActions && (
        <BlockActions
          onDelete={() => {
            deleteBlock(slideId, block.id);
            setShowActions(false);
          }}
          onDuplicate={() => {
            (duplicateBlock(slideId, block.id), setShowActions(false));
          }}
          onToggleImportant={() => {
            (toggleImportant(slideId, block.id), setShowActions(false));
          }}
          onCopyBlock={() => {
            copyBlock(slideId, block.id);
            setShowActions(false);
          }}
          onPasteBlock={() => {
            pasteBlock(slideId, block.id);
            setShowActions(false);
          }}
          setShowActions={setShowActions}
          important={block.important}
          copiedBlock={copiedBlock}
        />
      )}

      {block.type === "text" && (
        <TextBlock
          block={block}
          slideId={slideId}
          addBlock={addBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          toggleImportant={toggleImportant}
          isUndoRedo={isUndoRedo}
          editorToolbarRef={editorToolbarRef}
          setSlidesWithoutHistory={setSlidesWithoutHistory}
        />
      )}

      {block.type === "divider" && <DividerBlock />}
      {block.type === "image" && (
        <ImageBlock
          block={block}
          slideId={slideId}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
        />
      )}
      {block.type === "youtube" && (
        <YoutubeBlock
          slideId={slideId}
          block={block}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
        />
      )}
      {block.type === "callout" && (
        <CalloutBlock
          slideId={slideId}
          block={block}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
        />
      )}
      {block.type === "quiz" && <QuizBlock />}
    </div>
  );
};

export default BlockRenderer;
