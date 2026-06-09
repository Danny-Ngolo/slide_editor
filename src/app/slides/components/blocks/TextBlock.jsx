"use client";

// JUST REALIZED ANOTHER ISSUE THAT IN THE TEXTBOX CLICKING ENTER DOESN'T NO ANYTHING...

import InsertMenu from "../InsertMenu";
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import { useEditorContext } from "../EditorContext";
import {
  blocks_groups,
  filterBlocks,
  flattenBlocks,
} from "../../editor/blocks";

const TextBlock = ({
  block,
  slideId,
  addBlock,
  updateBlock,
  isUndoRedo,
  editorToolbarRef,
}) => {
  const { setActiveEditor, setEditorState, editorContainerRef } =
    useEditorContext();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashMenuPosition, setSlashMenuPosition] = useState(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);
  const [slashRange, setSlashRange] = useState(null);

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
    content: block.content.html || "",
    onFocus({ editor }) {
      setActiveEditor(editor);

      updateEditorState(editor);
    },
    onUpdate({ editor }) {
      if (!editor) return;

      // check firts if the pressed key matchs / to show the slashMenu, if not: update the

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

      const textBefore = editor.state.doc.textBetween(0, selection.from, " ");

      const matchQuery = textBefore.match(/\/(\w*)$/);

      if (matchQuery) {
        const coords = editor.view.coordsAtPos(selection.from);

        if (matchQuery && matchQuery?.length) {
          const from = selection.from - matchQuery[0].length;

          setSlashRange({
            from,
            to: selection.from,
          });

          setSlashQuery(matchQuery[1]);
          setShowSlashMenu(true);
        }

        setSlashMenuPosition({
          top: coords.bottom + window.scrollY + 5,
          left: coords.left + window.scrollX,
        });

        setShowSlashMenu(true);
        setSelectedBlockIndex(0);
      }

      const newContent = {
        html: editor.getHTML(),
      };

      updateBlock(slideId, block.id, newContent, { recordHistory: false });
      updateEditorState(editor);
    },
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Enter") {
          const { state } = view;

          const textBefore = state.doc.textBetween(
            0,
            state.selection.from,
            " ",
          );

          const matchQuery = textBefore.match(/\/(\w*)$/);

          if (matchQuery) {
            const selectedItem = filteredItems[selectedBlockIndex];

            if (selectedItem) {
              handleSlashSelect(selectedItem.type, selectedItem.variant);
            }
          }

          return true;
        }
        // else {
        //   return false;
        // }
      },
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
    if (!editor) return;

    const blockHtml = block?.content?.html;
    const currentHtml = editor.getHTML();

    if (blockHtml !== currentHtml) {
      editor.commands.setContent(block.content.html);
    }
  }, [editor, block.content]);

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
        setSelectedBlockIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedBlockIndex((prev) => (prev + 1) % itemsCount);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSlashMenu(false);
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [showSlashMenu, filteredItems, selectedBlockIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideEditor = editorContainerRef.current?.contains(e.target);
      const insideToolbar = editorToolbarRef.current?.contains(e.target);

      if (insideEditor || insideToolbar) {
        return;
      }

      setActiveEditor(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSlashSelect = (type, variant = undefined) => {
    if (!editor || !slashRange) return;

    // delete "/query"
    editor.chain().focus().deleteRange(slashRange).run();

    // insert new block
    addBlock(slideId, type, null, { variant });

    setShowSlashMenu(false);
    setSlashRange(null);
  };

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
            query={slashQuery}
            position={slashMenuPosition}
            selectedBlockIndex={selectedBlockIndex}
            showSlashMenu={showSlashMenu}
            onSelect={(type, variant = undefined) => {
              handleSlashSelect(type, variant);
            }}
            onClose={() => setShowSlashMenu(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TextBlock;
