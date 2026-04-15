"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import InsertMenu from "./InsertMenu";

const InsertMenuBetween = ({ onInsert }) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.querySelector("button").style.opacity = 1)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.querySelector("button").style.opacity = 0)
      }
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "2px",
          background: "#ddd",
        }}
      />
      <button
        onClick={() => setShowInsertMenu((prev) => !prev)}
        style={{
          position: "relative",
          zIndex: 1,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "50%",
          padding: "4px",
          cursor: "pointer",
          opacity: 0,
          transition: "0.2s",
        }}
      >
        <Plus size={14} color="black" />
      </button>

      {showInsertMenu && (
        <InsertMenu
          onSelect={(type) => {
            onInsert(type);
            setShowInsertMenu(false);
          }}
          onClose={() => setShowInsertMenu(false)}
        />
      )}
    </div>
  );
};

export default InsertMenuBetween;
