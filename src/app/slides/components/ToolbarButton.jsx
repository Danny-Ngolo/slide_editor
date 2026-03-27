"use client";

import React, { useEffect } from "react";

const ToolbarButton = ({ title, isActive, children, onClick }) => {
  useEffect(() => {
    console.log(title, "is", isActive);
  }, [isActive]);

  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "#eee";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? "#ddd" : "transparent";
      }}
      style={{
        border: "1px solid #ccc",
        padding: "8px",
        background: isActive ? "#ddd" : "transparent",
        color: "#111",
      }}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
