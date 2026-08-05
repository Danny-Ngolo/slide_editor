"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { EditorContent } from "@tiptap/react";
import InsertMenu from "../InsertMenu";
import { useEditorContext } from "../EditorContext";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";
import { useRichTextEditor } from "../../hooks/useRichTextEditor";
import { useSlashMenu } from "../../hooks/useSlashMenu";

const COLORS = {
  text: "#1f2328",
  fieldBg: "#f6f8fa",
  fieldBorder: "#d0d7de",
};

const RichTextField = ({ blockId, slideId, blockType, content, onChange }) => {
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
  const { updateEditorState, useInitEditor, updateEditorUI } =
    useRichTextEditor();
  const { handleDirectionKey, handleSlashSelect } = useSlashMenu();

  const closeSlashMenu = useCallback(
    () => setShowSlashMenu(false),
    [setShowSlashMenu],
  );

  const fieldContent = useMemo(
    () => content || { html: "" },
    [content],
  );

  const editor = useInitEditor({
    slideId,
    blockId,
    blockType,
    content: fieldContent,
    onContentChange: (newContent) => onChange(newContent),
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
    updateEditorUI(editor, fieldContent);
  }, [editor, fieldContent, updateEditorUI]);

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
        border: `1px solid ${COLORS.fieldBorder}`,
        borderRadius: "6px",
        padding: "4px 8px",
        minHeight: "60px",
        background: COLORS.fieldBg,
        color: COLORS.text,
      }}
    >
      <EditorContent editor={editor} />
      {showSlashMenu && slashMenuPosition && (
        <InsertMenu
          onSelect={(type, variant = undefined) => {
            handleSlashSelect(editor, slideId, slashRange, type, variant);
          }}
          onClose={closeSlashMenu}
        />
      )}
    </div>
  );
};

export default RichTextField;
