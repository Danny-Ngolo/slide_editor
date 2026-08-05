"use client";

import React, { useEffect, useRef } from "react";
import { blocks_groups, filterBlocks } from "../editor/blocks";
import { useEditorContext } from "./EditorContext";
import { COLORS, RADIUS, SHADOWS } from "./blocks/shared/styles";

const InsertMenu = ({ onSelect, onClose }) => {
  const { showSlashMenu, slashQuery, selectedBlockIndex, slashMenuPosition } =
    useEditorContext();

  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const prevIndexRef = useRef(null);
  let currentBlockIndex = 0;

  const filteredGroups = filterBlocks(blocks_groups, slashQuery);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef?.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    const prev = prevIndexRef.current;

    // don't apply scroll on the first render

    if (prev === null) {
      prevIndexRef.current = selectedBlockIndex;
      return;
    }

    // only scroll when the selectedBlockIndex changed

    if (prev !== selectedBlockIndex) {
      const el = itemRefs.current[selectedBlockIndex];

      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    prevIndexRef.current = selectedBlockIndex;
  }, [selectedBlockIndex]);

  useEffect(() => {
    if (showSlashMenu) {
      prevIndexRef.current = null;
    }
  }, [showSlashMenu]);

  return (
    <div
      ref={menuRef}
      className="rich-scroll"
      style={{
        position: "fixed",
        top: slashMenuPosition?.top,
        left: slashMenuPosition?.left,
        maxHeight: "280px",
        overflowY: "auto",
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        padding: "6px",
        width: "min(240px, calc(100vw - 24px))",
        boxShadow: SHADOWS.pop,
        zIndex: 1000,
      }}
    >
      {filteredGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: "6px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: COLORS.placeholder,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              margin: "6px 8px",
            }}
          >
            {group.title}
          </div>

          {group.items.map((item) => {
            const Icon = item.icon;
            const itemIndex = currentBlockIndex;
            const isSelected = currentBlockIndex === selectedBlockIndex;
            currentBlockIndex++;

            return (
              <div
                data-slash-item
                key={item.variant || item.type}
                ref={(el) => (itemRefs.current[itemIndex] = el)}
                onClick={() => {
                  onSelect(item.type, item.variant);
                  onClose();
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = COLORS.accentSoft)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = isSelected
                    ? COLORS.accentSoft
                    : "transparent")
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: RADIUS.md,
                  color: COLORS.text,
                  background: isSelected ? COLORS.accentSoft : "transparent",
                  transition: "background 0.12s ease",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    borderRadius: RADIUS.md,
                    background: isSelected ? COLORS.accent : COLORS.fieldBg,
                    color: isSelected ? "#fff" : COLORS.label,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: COLORS.text,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: COLORS.placeholder,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}

          <div
            style={{
              height: "1px",
              background: COLORS.border,
              margin: "6px 4px",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default InsertMenu;
