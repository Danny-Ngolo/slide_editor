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
import { useSlides } from "../hooks/useSlides";
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
    </div>
  );
};

export default BlockActions;