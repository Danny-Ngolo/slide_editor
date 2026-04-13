"use client";

import InsertMenu from "../InsertMenu";
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import { useEditorContext } from "../EditorContext";
import { blocks_groups, filterBlocks, flattenBlocks } from "../../editor/blocks";

const TextBlock = ({
  block,
  slideId,
  addBlock,
  updateBlock,
  toggleImportant,
}) => {
  const { setActiveEditor, setEditorState } = useEditorContext();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashMenuPosition, setSlashMenuPosition] = useState(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);

  const getEditorState = (editor) => {
    if (!editor) return {};

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      blockquote: editor.isActive("blockquote"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      highlight: editor.isActive("highlight"),
      underline: editor.isActive("underline"),
    };
  };

  const updateEditorState = (editor) => {
    setEditorState(getEditorState(editor));
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight],
    immediatelyRender: false,
    content: block.content || "<p></p>",
    onFocus({ editor }) {
      setActiveEditor(editor);

      updateEditorState(editor);
    },

    onUpdate({ editor }) {
      if (!editor) return;

      const text = editor.getText();
      const selection = editor.state.selection;

      if (!text.includes("/")) {
        setShowSlashMenu(false);
      }

      const lastChar = text?.slice(-1);

      if (lastChar === "/") {
        setShowSlashMenu(true);
        setSlashQuery("");
      }

      const matchQuery = text.match(/\/(\w*)$/);

      if (matchQuery) {
        const coords = editor.view.coordsAtPos(selection.from);

        if (matchQuery?.length) setSlashQuery(matchQuery[1]);

        setSlashMenuPosition({
          top: coords.bottom + window.scrollY + 5,
          left: coords.left + window.scrollX,
        });

        setShowSlashMenu(true);
        setSelectedBlockIndex(0);
      }

      updateBlock(slideId, block.id, editor.getHTML());
      updateEditorState(editor);
    },
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
    const filteredBlocks = filterBlocks(blocks_groups, slashQuery);
    const filtered = flattenBlocks(filteredBlocks);

    setFilteredItems(filtered);
  }, [showSlashMenu, slashQuery]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!showSlashMenu) return;

      const itemsCount = filteredItems.length;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedBlockIndex(prev => (prev - 1 + itemsCount) % itemsCount);
      };
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedBlockIndex(prev => (prev + 1) % itemsCount)
      };
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      };
      if (e.key === 'Enter') {

        const selectedItem = filteredItems[selectedBlockIndex];

        if (selectedItem) {
          handleSlashSelect(selectedItem.type)
        };
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    }
  }, [showSlashMenu, filteredItems, selectedBlockIndex]);

  if (!editor) return null;

  const handleSlashSelect = (type) => {
    if (!editor) return;

    // delete "/query"
    editor
      .chain()
      .focus()
      .deleteRange({
        from: editor.state.selection.from - slashQuery.length - 1,
        to: editor.state.selection.from,
      })
      .run();

    // insert new block
    addBlock(slideId, type);

    setShowSlashMenu(false);
  };

  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: block.important ? "2px solid orange" : "1px solid #ccc",
        minHeight: "80px",
        position: "relative",
      }}
    >
      <button onClick={() => toggleImportant(slideId, block.id)}>
        {block.important ? "⭐ Important" : "Mark Important"}
      </button>

      <EditorContent editor={editor} />

      {showSlashMenu && slashMenuPosition && (
        <div
          style={{
            position: "absolute",
            bottom: slashMenuPosition.top,
            left: slashMenuPosition.left,
            zIndex: 1000,
          }}
        >
          <InsertMenu
            query={slashQuery}
            position={slashMenuPosition}
            selectedBlockIndex={selectedBlockIndex}
            onSelect={(type) => {
              handleSlashSelect(type);
            }}
            onClose={() => setShowSlashMenu(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TextBlock;
