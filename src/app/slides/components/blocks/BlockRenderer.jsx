"use client";

import React, { useState } from "react";
import TextBlock from "./TextBlock";
import QuizBlock from "./QuizBlock";
import DividerBlock from "./DividerBlock";
import ImageBlock from "./ImageBlock";
import YoutubeBlock from "./YoutubeBlock";
import CalloutBlock from "./CalloutBlock";
import ExerciseBlock from "./ExerciseBlock";
import BlockActions from "../BlockActions";
import { MoreVertical } from "lucide-react";
import { useEditorContext } from "../EditorContext";
import { useSelection } from "../../hooks/useSelection";
import { useLongPress } from "../../hooks/useLongPress";
import { useSlides } from "../../hooks/useSlides";
import { useClipboard } from "../../hooks/useClipboard";
import TableBlock from "./Table/TableBlock";

const BlockRenderer = ({ block, slideId }) => {
  const [showActions, setShowActions] = useState(false);
  const { handleSelectBlock, isBlockSelected, toggleBlockSelection } =
    useSelection();
  const { selectedBlocks } = useEditorContext();
  const { deleteBlock, transformBlock, toggleImportant } = useSlides();

  const { copyBlock, pasteBlock, duplicateBlock } = useClipboard();

  const longPressHandlers = useLongPress({
    onLongPress: () => toggleBlockSelection(slideId, block.id),
  });

  return (
    <div
      onClick={(e) => {
        handleSelectBlock(e, slideId, block.id);
      }}
      {...longPressHandlers}
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: block.important ? "2px solid orange" : "1px solid #ccc",
        minHeight: "80px",
        width: "100%",
        position: "relative",
        boxShadow: isBlockSelected(slideId, block.id, selectedBlocks)
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
          onTransform={(option) => {
            transformBlock(slideId, block.id, block, option);
            setShowActions(false);
          }}
          setShowActions={setShowActions}
          important={block.important}
          hideTransform={block.type === "exercise"}
        />
      )}

      {block.type === "text" && <TextBlock block={block} slideId={slideId} />}
      {block.type === "table" && <TableBlock block={block} slideId={slideId} />}

      {block.type === "divider" && <DividerBlock />}
      {block.type === "image" && <ImageBlock block={block} slideId={slideId} />}
      {block.type === "youtube" && (
        <YoutubeBlock slideId={slideId} block={block} />
      )}
      {block.type === "callout" && (
        <CalloutBlock slideId={slideId} block={block} />
      )}
      {block.type === "exercise" && (
        <ExerciseBlock slideId={slideId} block={block} />
      )}
      {block.type === "quiz" && <QuizBlock />}
    </div>
  );
};

export default BlockRenderer;
