"use client";

import InsertMenu from "../InsertMenu";
import React, { useCallback, useEffect } from "react";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";
import { useSlashMenu } from "../../hooks/useSlashMenu";

import calloutTypes from "../../editor/calloutTypes";

import { useSlides } from "../../hooks/useSlides";
import { useRichTextEditor } from "../../hooks/useRichTextEditor";
import { EditorContent } from "@tiptap/react";
import { useEditorContext } from "../EditorContext";
import Select from "./shared/Select";
import { COLORS, RADIUS } from "./shared/styles";

const CalloutBlock = ({ block, slideId }) => {
  const { updateBlock } = useSlides();

  const {
    showSlashMenu,
    setShowSlashMenu,
    slashQuery,
    slashRange,
    selectedBlockIndex,
    slashMenuPosition,
    filteredItems,
    setFilteredItems,
  } = useEditorContext();

  const { updateEditorState, useInitEditor, updateEditorUI } = useRichTextEditor();

  const { handleDirectionKey, handleSlashSelect } = useSlashMenu();

  const closeSlashMenu = useCallback(
    () => setShowSlashMenu(false),
    [setShowSlashMenu],
  );

  const variant = block.content?.variant || "definition";
  const config = calloutTypes[variant];

  const editor = useInitEditor({
    slideId,
    blockId: block.id,
    content: block.content,
    blockType: block.type || "callout",
  });

  useEffect(() => {
    if (!editor) return;

    const editorHandler = () => updateEditorState(editor);
    editor.on("selectionUpdate", editorHandler);

    return () => {
      editor.off("selectionUpdate", editorHandler);
    };
  }, [editor, updateEditorState]);

  useEffect(() => {
    updateEditorUI(editor, block?.content);
  }, [editor, block.content, updateEditorUI]);

  useEffect(() => {
    const filteredBlocks = filterBlocks(blocks_groups, slashQuery);
    const filtered = flattenBlocks(filteredBlocks);

    setFilteredItems(filtered);
  }, [showSlashMenu, slashQuery, setFilteredItems]);

  useEffect(() => {
    document.addEventListener("keydown", handleDirectionKey);

    return () => {
      document.removeEventListener("keydown", handleDirectionKey);
    };
  }, [showSlashMenu, filteredItems, selectedBlockIndex, handleDirectionKey]);

  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        margin: "10px 0",
        borderRadius: "10px",
        border: `1px solid ${config.border}`,
        background: config.bg,
        color: COLORS.text,
        overflow: "hidden",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: "4px",
          flexShrink: 0,
          background: config.accent,
          alignSelf: "stretch",
        }}
      />

      <div style={{ flex: 1, minWidth: 0, padding: "10px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: config.bg,
              border: `1px solid ${config.border}`,
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            {config.icon}
          </span>

          <span
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: config.headerColor,
            }}
          >
            {config.label}
          </span>

          {/* TYPE SELECTOR */}
          <Select
            value={variant}
            options={Object.keys(calloutTypes).map((key) => ({
              value: key,
              label: calloutTypes[key].label,
            }))}
            onChange={(v) => {
              updateBlock(slideId, block.id, {
                ...block.content,
                variant: v,
              });
            }}
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              borderRadius: RADIUS.md,
            }}
          />
        </div>

        <EditorContent editor={editor} />

        {showSlashMenu && slashMenuPosition && (
          <div>
            <InsertMenu
              onSelect={(type, variant = undefined) => {
                handleSlashSelect(editor, slideId, slashRange, type, variant);
              }}
              onClose={closeSlashMenu}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalloutBlock;
