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
import { COLORS, RADIUS } from "./shared/styles";

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
          top: "10px",
          right: "10px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px",
          borderRadius: RADIUS.sm,
          cursor: "pointer",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.placeholder,
          boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
        }}
      >
        <MoreVertical size={15} />
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
          hideTransform={
            block.type === "exercise" || block.type === "quiz"
          }
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
      {block.type === "quiz" && (
        <QuizBlock slideId={slideId} block={block} />
      )}
    </div>
  );
};

export default BlockRenderer;
