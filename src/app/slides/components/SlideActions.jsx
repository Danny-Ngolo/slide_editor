"use client";

import React, { useEffect, useRef } from "react";
import ActionButton from "./ActionButton";
import { useEditorContext } from "./EditorContext";

const SlideActions = ({
  onDuplicate,
  onCopySlide,
  onPasteSlide,
  onDelete,
  onRename,
  setShowActions,
}) => {
  const { copiedSlides } = useEditorContext();
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false);
      }

      return;
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowActions]);

  return (
    <div
      ref={actionsRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "150px",
        marginTop: "8px",
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "white",
        color: "black",
        boxShadow: "2px 4px 8px #00000080",
        zIndex: 200,
      }}
    >
      <ActionButton label={"Rename"} onClick={onRename} />
      <ActionButton label={"Duplicate"} onClick={onDuplicate} />
      <ActionButton label={"Copy Slide"} onClick={onCopySlide} />
      <ActionButton
        disabled={copiedSlides.length === 0}
        label={"Paste after"}
        onClick={onPasteSlide}
      />
      <ActionButton label={"Delete"} onClick={onDelete} />
    </div>
  );
};

export default SlideActions;
