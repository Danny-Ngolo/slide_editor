import React from "react";

import MathSymbolToolbar from "./MathSymbolToolbar";
import { COLORS, RADIUS } from "../shared/styles";

const segmentedBtnStyle = (isActive) => ({
  padding: "4px 12px",
  border: "none",
  fontSize: "12px",
  cursor: "pointer",
  background: isActive ? COLORS.accent : "transparent",
  color: isActive ? "#ffffff" : COLORS.label,
  transition: "background 0.15s ease, color 0.15s ease",
});

const MathEditorShell = ({
  view,
  switchView,
  showToolbar,
  toolbarGroups,
  applyItem,
  children,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          border: `1px solid ${COLORS.fieldBorder}`,
          borderRadius: RADIUS.sm,
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => switchView("source")}
          aria-pressed={view === "source"}
          style={segmentedBtnStyle(view === "source")}
        >
          Source
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => switchView("slots")}
          aria-pressed={view === "slots"}
          style={segmentedBtnStyle(view === "slots")}
        >
          Visual
        </button>
      </div>
    </div>

    {showToolbar && (
      <MathSymbolToolbar groups={toolbarGroups} onInsert={applyItem} compact />
    )}

    {children}
  </div>
);

export default MathEditorShell;
