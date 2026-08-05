"use client";

import React from "react";
import { COLORS, RADIUS } from "./blocks/shared/styles";

const ToolbarButton = ({
  title,
  isActive,
  disabled = false,
  children,
  onClick,
}) => {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) e.currentTarget.style.background = COLORS.surfaceAlt;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? COLORS.accentSoft : "transparent";
      }}
      style={{
        border: `1px solid ${isActive ? COLORS.accentBorder : COLORS.border}`,
        padding: "7px",
        background: isActive ? COLORS.accentSoft : "transparent",
        color: disabled ? COLORS.placeholder : isActive ? COLORS.accentText : COLORS.text,
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: RADIUS.md,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
