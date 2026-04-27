"use client";

import { Trash } from "lucide-react";
import calloutTypes from "../../editor/calloutTypes";
import React, { useState } from "react";

const CalloutBlock = ({ block, updateBlock, deleteBlock, slideId }) => {
  const [text, setText] = useState(block.content?.text || "");
  const [showActions, setShowActions] = useState(false);

  const variant = block.content?.variant || "definition";
  const config = calloutTypes[variant];

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "8px",
        margin: "10px 0",
        ...config.style,
        position: "relative",
      }}
    >
      {showActions && (
        <button
          onClick={() => deleteBlock(slideId, block.id)}
          style={{
            marginLeft: "15px",
            position: "absolute",
            top: "8px",
            right: "8px",
          }}
        >
          <Trash size={14} />
        </button>
      )}

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

      {/* TEXT */}
      <textarea
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
      />
    </div>
  );
};

export default CalloutBlock;
