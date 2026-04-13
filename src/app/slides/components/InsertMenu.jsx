"use client";

import React, { useEffect, useRef } from "react";
import { blocks_groups, filterBlocks } from "../editor/blocks";

const InsertMenu = ({ onSelect, onClose, query = "", selectedBlockIndex = 0 }) => {
  const menuRef = useRef(null);
  let currentBlockIndex = 0;

  const filteredGroups = filterBlocks(blocks_groups, query);

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
  }, []);

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: "40px",
        left: "0",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px",
        width: "220px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 100,
      }}
    >
      {filteredGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: "10px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#666",
              marginBottom: "6px",
            }}
          >
            {group.title}
          </div>

          {group.items.map((item) => {
            const Icon = item.icon;
            const isSelected = currentBlockIndex === selectedBlockIndex;
            currentBlockIndex++;

            return (
              <div
                data-slash-item
                key={item.type}
                onClick={() => {
                  onSelect(item.type);
                  onClose();
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#eee")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#111",
                  background: isSelected ? "#eee" : "transparent"
                }}
              >
                <Icon size={18} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #d1d1d1",
              margin: "8px 0",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default InsertMenu;
