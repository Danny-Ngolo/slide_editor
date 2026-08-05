"use client";

import InsertMenu from "../InsertMenu";
import React, { useCallback, useEffect } from "react";
import { EditorContent } from "@tiptap/react";

import { useEditorContext } from "../EditorContext";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";
import { useRichTextEditor } from "../../hooks/useRichTextEditor";
import { useSlashMenu } from "../../hooks/useSlashMenu";
import { cardStyle } from "./shared/styles";

const TextBlock = ({ block, slideId }) => {
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

  const editor = useInitEditor({
    slideId,
    blockId: block.id,
    content: block.content,
    blockType: block.type || "text",
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
    <div className="editor-card" style={cardStyle}>
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
  );
};

export default TextBlock;
