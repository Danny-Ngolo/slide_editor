"use client";

import { Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import InsertMenu from "./InsertMenu";
import { COLORS, RADIUS, SHADOWS } from "./blocks/shared/styles";

const InsertMenuBetween = ({ onInsert }) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const handleClose = useCallback(() => setShowInsertMenu(false), [setShowInsertMenu]);

  return (
    <div
      style={{
        position: "relative",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          background: COLORS.border,
        }}
      />
      <button
        onClick={() => {
          setShowInsertMenu((prev) => !prev);
        }}
        title="Insert block"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.pill,
          padding: "4px",
          cursor: "pointer",
          color: COLORS.accent,
          boxShadow: SHADOWS.card,
        }}
      >
        <Plus size={15} />
      </button>

      {showInsertMenu && (
        <InsertMenu
          onSelect={(type, variant = undefined) => {
            onInsert(type, variant);
            setShowInsertMenu(false);
          }}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default InsertMenuBetween;
