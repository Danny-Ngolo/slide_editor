"use client";

import React, { useEffect, useRef } from "react";
import ActionButton from "./ActionButton";
import { useEditorContext } from "./EditorContext";
import { transformOptions } from "../editor/transformBlockOptions";
import { useSlides } from "../hooks/useSlides";

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
      <>
        <ActionButton label={"Duplicate"} onClick={onDuplicate} />
        <ActionButton label={"Copy Block"} onClick={onCopyBlock} />
        <ActionButton
          disabled={!copiedBlock}
          label={"Paste below"}
          onClick={onPasteBlock}
        />
        <ActionButton
          label={important ? "Unmark important" : "Mark Important"}
          onClick={onToggleImportant}
        />
        <ActionButton label={"Delete"} onClick={onDelete} />
      </>

      <hr />
      {!hideTransform && (
        <>
          <p style={{ textAlign: "center", fontSize: "inherit" }}>Turn into</p>
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
