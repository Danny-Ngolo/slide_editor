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
  background: "rgba(255, 255, 255, 0.08)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
  transition: "background 0.15s ease",
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
        background: "rgba(17, 24, 39, 0.92)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "12px",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        zIndex: 2000,
        maxWidth: "calc(100vw - 32px)",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <span
        style={{ fontSize: "13px", fontWeight: "bold", marginRight: "4px" }}
      >
        {count} selected
      </span>

      <button
        type="button"
        onClick={handleCopy}
        style={BUTTON_STYLE}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
      >
        <Copy size={15} /> Copy
      </button>
      <button
        type="button"
        onClick={handleDuplicate}
        style={BUTTON_STYLE}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
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
      <button
        type="button"
        onClick={handleDelete}
        style={{ ...BUTTON_STYLE, background: "rgba(220, 38, 38, 0.25)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.45)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.25)")}
      >
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
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default SelectionActionsBar;
