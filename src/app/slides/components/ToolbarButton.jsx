"use client";

import React from "react";

const ToolbarButton = ({ title, isActive, disabled = false, children, onClick }) => {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) e.currentTarget.style.background = "#eee";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? "#ddd" : "transparent";
      }}
      style={{
        border: "1px solid #ccc",
        padding: "8px",
        background: isActive ? "#ddd" : "transparent",
        color: disabled ? "#999" : "#111",
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
