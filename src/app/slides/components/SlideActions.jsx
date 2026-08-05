"use client";

import React, { useEffect, useRef } from "react";
import { ClipboardPaste, Copy, Pencil, Trash, CopyPlus } from "lucide-react";
import ActionButton from "./ActionButton";
import { useEditorContext } from "./EditorContext";
import { menuStyle } from "./blocks/shared/styles";

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
        ...menuStyle,
        width: "170px",
        marginTop: "8px",
        position: "absolute",
        top: "24px",
        left: "0",
        zIndex: 200,
      }}
    >
      <ActionButton
        icon={Pencil}
        label={"Rename"}
        onClick={onRename}
      />
      <ActionButton
        icon={CopyPlus}
        label={"Duplicate"}
        onClick={onDuplicate}
      />
      <ActionButton icon={Copy} label={"Copy Slide"} onClick={onCopySlide} />
      <ActionButton
        disabled={copiedSlides.length === 0}
        icon={ClipboardPaste}
        label={"Paste after"}
        onClick={onPasteSlide}
      />
      <ActionButton
        icon={Trash}
        variant="danger"
        label={"Delete"}
        onClick={onDelete}
      />
    </div>
  );
};

export default SlideActions;
