"use client";

import InsertMenu from "../InsertMenu";
import React, { useEffect } from "react";
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

  const { updateEditorState, initEditor, updateEditorUI, handleClickOutside } =
    useRichTextEditor();

  const { handleDirectionKey, handleSlashSelect } = useSlashMenu();

  const variant = block.content?.variant || "definition";
  const config = calloutTypes[variant];

  const editor = initEditor({
    slideId,
    blockId: block.id,
    content: block.content,
  });

  useEffect(() => {
    if (!editor) return;

    const editorHandler = () => updateEditorState(editor);
    editor.on("selectionUpdate", editorHandler);

    return () => {
      editor.off("selectionUpdate", editorHandler);
    };
  }, [editor]);

  useEffect(() => {
    updateEditorUI(editor, block?.content);
  }, [editor, block.content]);

  useEffect(() => {
    const filteredBlocks = filterBlocks(blocks_groups, slashQuery);
    const filtered = flattenBlocks(filteredBlocks);

    setFilteredItems(filtered);
  }, [showSlashMenu, slashQuery]);

  useEffect(() => {
    document.addEventListener("keydown", handleDirectionKey);

    return () => {
      document.removeEventListener("keydown", handleDirectionKey);
    };
  }, [showSlashMenu, filteredItems, selectedBlockIndex]);

  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: "50px",
        padding: "12px",
        borderRadius: "8px",
        margin: "10px 0",
        ...config.style,
        position: "relative",
        color: "black",
      }}
    >
      <div>
        <span>{config.icon}</span>

        {/* TYPE SELECTOR */}
        <select
          value={variant}
          onChange={(e) => {
            updateBlock(slideId, block.id, {
              ...block.content,
              variant: e.target.value,
            });
          }}
        >
          {Object.keys(calloutTypes).map((key) => {
            return (
              <option key={key} value={key}>
                {calloutTypes[key].label}
              </option>
            );
          })}
        </select>
      </div>

      <EditorContent editor={editor} />

      {showSlashMenu && slashMenuPosition && (
        <div>
          <InsertMenu
            onSelect={(type, variant = undefined) => {
              handleSlashSelect(editor, slideId, slashRange, type, variant);
            }}
            onClose={() => setShowSlashMenu(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CalloutBlock;
