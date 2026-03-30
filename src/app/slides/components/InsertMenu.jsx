"use client";

import React, { useEffect, useRef } from "react";
import {
  Type,
  Image,
  Video,
  BookOpen,
  Brain,
  Lightbulb,
  Minus,
} from "lucide-react";

const InsertMenu = ({ onSelect, onClose }) => {
  const menuRef = useRef(null);

  const items = [
    { type: "text", label: "Text", icon: Type },
    { type: "image", label: "Image", icon: Image },
    { type: "video", label: "Video", icon: Video },
    { type: "definition", label: "Definition", icon: BookOpen },
    { type: "example", label: "Example", icon: Lightbulb },
    { type: "exercise", label: "Exercise", icon: Brain },
    { type: "divider", label: "Divider", icon: Minus },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef?.current.contains(e.target)) {
        onClose()
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      };
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    }
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
        zIndex: 100
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.type}
            onClick={() => {
              onSelect(item.type);
              onClose();
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
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
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default InsertMenu;
