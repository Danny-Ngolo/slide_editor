"use client";

import React, { useState } from "react";
import { COLORS, LABEL_STYLE } from "./styles";

export const Accordion = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "16px" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          ...LABEL_STYLE,
          marginBottom: 0,
        }}
      >
        <span>{open ? "▾" : "▸"}</span>
        {label}
      </button>
      {open && <div style={{ marginTop: "6px" }}>{children}</div>}
    </div>
  );
};