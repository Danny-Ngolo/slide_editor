"use client";

import React from "react";
import { Copy, Trash, ClipboardPaste, Plus, X } from "lucide-react";
import { useEditorContext } from "./EditorContext";
import { useClipboard } from "../hooks/useClipboard";

const BUTTON_STYLE = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 12px",
  background: "#3b3b3b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  cursor: "pointer",
};

const SelectionActionsBar = () => {
  const {
    selectedBlocks,
    setSelectedBlocks,
    selectedSlides,
    setSelectedSlides,
    copiedBlocks,
    copiedSlides,
  } = useEditorContext();

  const {
    copySelectedBlocks,
    pasteBlocks,
    duplicateSelectedBlocks,
    deleteSelectedBlocks,
    copySelectedSlides,
    pasteSlides,
    duplicateSelectedSlides,
    deleteSelectedSlides,
  } = useClipboard();

  const count = selectedBlocks.length + selectedSlides.length;

  if (count < 2) return null;

  const isBlocks = selectedBlocks.length > 0;

  const canPaste = isBlocks ? copiedBlocks.length > 0 : copiedSlides.length > 0;

  const handleCopy = () =>
    isBlocks ? copySelectedBlocks() : copySelectedSlides();

  const handlePaste = () => (isBlocks ? pasteBlocks() : pasteSlides());

  const handleDuplicate = () =>
    isBlocks ? duplicateSelectedBlocks() : duplicateSelectedSlides();

  const handleDelete = () =>
    isBlocks ? deleteSelectedBlocks() : deleteSelectedSlides();

  const clearSelection = () => {
    setSelectedBlocks([]);
    setSelectedSlides([]);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#222",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        zIndex: 2000,
      }}
    >
      <span
        style={{ fontSize: "13px", fontWeight: "bold", marginRight: "4px" }}
      >
        {count} selected
      </span>

      <button type="button" onClick={handleCopy} style={BUTTON_STYLE}>
        <Copy size={15} /> Copy
      </button>
      <button
        type="button"
        onClick={handleDuplicate}
        style={BUTTON_STYLE}
      >
        <Plus size={15} /> Duplicate
      </button>
      <button
        type="button"
        onClick={handlePaste}
        disabled={!canPaste}
        style={{
          ...BUTTON_STYLE,
          opacity: canPaste ? 1 : 0.4,
          cursor: canPaste ? "pointer" : "not-allowed",
        }}
      >
        <ClipboardPaste size={15} /> Paste
      </button>
      <button type="button" onClick={handleDelete} style={BUTTON_STYLE}>
        <Trash size={15} /> Delete
      </button>

      <button
        type="button"
        onClick={clearSelection}
        title="Clear selection"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          background: "transparent",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default SelectionActionsBar;
