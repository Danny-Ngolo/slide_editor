"use client";

import React from "react";
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
  const items = [
    { type: "text", label: "Text", icon: Type },
    { type: "image", label: "Image", icon: Image },
    { type: "video", label: "Video", icon: Video },
    { type: "definition", label: "Definition", icon: BookOpen },
    { type: "example", label: "Example", icon: Lightbulb },
    { type: "exercise", label: "Exercise", icon: Brain },
    { type: "divider", label: "Divider", icon: Minus },
  ];

  return (
    <div
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
      {items.map((item) => {
        const Icon = item.icon;
        console.log("item", item);

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
