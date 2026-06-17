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

  const variant = block.content?.variant || "definition";
  const config = calloutTypes[variant];

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

  // const [text, setText] = useState(block.content?.text || "");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        // width: "100%",
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

      {/* TEXT */}
      {/* <textarea
        placeholder="Write something important..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          updateBlock(slideId, block.id, {
            ...block.content,
            text: e.target.value,
          });
        }}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          marginTop: "8px",
          resize: "none",
          color: "#333",
        }}
      /> */}

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

export default CalloutBlock;
