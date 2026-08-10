"use client";

import React from "react";
import MathRenderer from "./MathRenderer";
import { getTemplate } from "./mathTemplates";
import { placeholderResolve } from "./mathPlaceholder";
import { COLORS, RADIUS } from "../shared/styles";

// Data-driven symbol/template toolbar (§16.2). It renders whatever `groups`
// contain; adding a symbol/template is a data change, never JSX. Buttons call
// `onInsert(item)` which the parent funnels through the insertion engine.

// Show a KaTeX preview for templates or the raw token for symbols.
// Templates prefer their explicit `preview` skeleton (visible, distinct glyphs
// such as n/d for a fraction); the placeholder-resolved skeleton is the fallback
// for templates that carry concrete LaTeX (e.g. the quadratic formula).
const itemPreviewLatex = (item) => {
  if (item.type === "symbol") return item.latex;
  const tpl = item.templateId ? getTemplate(item.templateId) : null;
  if (!tpl) return "";
  if (tpl.preview) return tpl.preview;
  return placeholderResolve(tpl.latex, tpl.placeholders ?? []).text;
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "30px",
  minHeight: "28px",
  padding: "2px 6px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: RADIUS.sm,
  background: COLORS.inputBg,
  color: COLORS.text,
  cursor: "pointer",
  transition: "background 0.15s ease, border-color 0.15s ease",
};

const MathSymbolToolbar = ({ groups = [], onInsert, compact = false }) => {
  if (!groups.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "6px 8px",
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.md,
        background: COLORS.surfaceAlt,
      }}
    >
      {groups.map((group) => (
        <div key={group.id}>
          {!compact && (
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: COLORS.label,
                marginBottom: "4px",
              }}
            >
              {group.label}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.description ?? item.keywords?.join(", ") ?? item.label}
                aria-label={item.label}
                onClick={() => onInsert?.(item)}
                style={buttonStyle}
                onMouseDown={(e) => e.preventDefault()}
              >
                {item.type === "template" ? (
                  <span style={{ display: "inline-flex", fontSize: "13px", lineHeight: 1 }}>
                    <MathRenderer latex={itemPreviewLatex(item)} mode="inline" />
                  </span>
                ) : (
                  <span style={{ fontSize: "15px", lineHeight: 1 }}>{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MathSymbolToolbar;