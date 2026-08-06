"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS, INPUT_STYLE, RADIUS, SHADOWS } from "./styles";

// Replaces native <select> dropdowns: the browser's option list is OS-styled
// (dark, full-width) and cannot be themed. This renders a custom trigger styled
// like INPUT_STYLE and a white, shadowed option menu matching the ActionMenu look.
const Select = ({ value, options, onChange, style, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected = useMemo(
    () => options?.find((o) => o.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "inline-flex" }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          ...INPUT_STYLE,
          ...style,
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={14}
          style={{
            flexShrink: 0,
            transition: "transform 0.15s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "100%",
            zIndex: 1000,
            background: COLORS.card,
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            boxShadow: SHADOWS.pop,
            padding: "4px",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {options?.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                border: "none",
                borderRadius: RADIUS.sm,
                background:
                  option.value === value ? COLORS.accentSoft : "transparent",
                color: COLORS.text,
                fontSize: "12px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.background = COLORS.surfaceAlt;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  option.value === value ? COLORS.accentSoft : "transparent";
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
