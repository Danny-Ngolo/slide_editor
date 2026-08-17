"use client";

import React, { useEffect, useRef } from "react";
import {
  ClipboardPaste,
  Copy,
  CopyPlus,
  Star,
  Trash,
} from "lucide-react";
import ActionButton from "./ActionButton";
import { useEditorContext } from "./EditorContext";
import { transformOptions } from "../editor/transformBlockOptions";
import Select from "./blocks/shared/Select";
import { COLORS, LABEL_STYLE, menuStyle } from "./blocks/shared/styles";

const BlockActions = ({
  onDuplicate,
  onDelete,
  onToggleImportant,
  onCopyBlock,
  onPasteBlock,
  onTransform,
  important = false,
  setShowActions,
  hideTransform = false,
  slides = [],
  sourceSlideId,
  onMoveToSlide,
}) => {
  const { copiedBlock } = useEditorContext();
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

  const moveOptions = (slides || [])
    .filter((slide) => slide.id !== sourceSlideId)
    .map((slide) => ({
      value: slide.id,
      label: slide.title || "Untitled slide",
    }));

  return (
    <div
      ref={actionsRef}
      style={{
        ...menuStyle,
        width: "180px",
        marginTop: "8px",
        position: "absolute",
        top: "24px",
        left: "0",
        zIndex: 200,
      }}
    >
      <>
        <ActionButton
          icon={CopyPlus}
          label={"Duplicate"}
          onClick={onDuplicate}
        />
        <ActionButton icon={Copy} label={"Copy Block"} onClick={onCopyBlock} />
        <ActionButton
          disabled={!copiedBlock}
          icon={ClipboardPaste}
          label={"Paste below"}
          onClick={onPasteBlock}
        />
        <ActionButton
          icon={Star}
          label={important ? "Unmark important" : "Mark Important"}
          onClick={onToggleImportant}
        />
        <ActionButton
          icon={Trash}
          variant="danger"
          label={"Delete"}
          onClick={onDelete}
        />
      </>

      {!hideTransform && (
        <>
          <div
            style={{
              height: "1px",
              background: COLORS.border,
              margin: "6px 4px",
            }}
          />
          <div
            style={{
              ...LABEL_STYLE,
              margin: "0 0 4px 12px",
              paddingTop: "2px",
            }}
          >
            Turn into
          </div>
          {transformOptions.map((option, index) => (
            <ActionButton
              isSubOption={true}
              key={index}
              label={option.label}
              onClick={() => onTransform(option)}
            />
          ))}
        </>
      )}

      {moveOptions.length > 0 && (
        <>
          <div
            style={{
              height: "1px",
              background: COLORS.border,
              margin: "6px 4px",
            }}
          />
          <div
            style={{
              ...LABEL_STYLE,
              margin: "0 0 4px 12px",
              paddingTop: "2px",
            }}
          >
            Move to slide
          </div>
          <Select
            placeholder="Select a slide…"
            value={null}
            options={moveOptions}
            onChange={(targetSlideId) => onMoveToSlide(targetSlideId)}
            ariaLabel="Move block to slide"
            style={{ margin: "0 8px 6px", width: "164px" }}
          />
        </>
      )}
    </div>
  );
};

export default BlockActions;