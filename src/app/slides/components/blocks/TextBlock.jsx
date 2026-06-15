"use client";

import InsertMenu from "../InsertMenu";
import React, { useEffect } from "react";
import { EditorContent } from "@tiptap/react";

import { useEditorContext } from "../EditorContext";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";
import { useRichTextEditor } from "../../hooks/useRichTextEditor";
import { useSlashMenu } from "../../hooks/useSlashMenu";

const TextBlock = ({ block, slideId }) => {
  const {
    editorContainerRef,
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

  const editor = initEditor(slideId, block.id, block.content);

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  return (
    <div style={{ color: "white", background: "black" }}>
      <EditorContent
        ref={editorContainerRef}
        style={{ height: "100%", background: "red" }}
        editor={editor}
      />

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

export default TextBlock;
