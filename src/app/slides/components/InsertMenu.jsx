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

const InsertMenu = ({ onSelect, onClose, query = "" }) => {
  const menuRef = useRef(null);

  const groups = [
    {
      title: "Basic",
      items: [
        { type: "text", label: "Text", desc: "Write content", icon: Type },
        {
          type: "divider",
          label: "Divider",
          desc: "Separate sections",
          icon: Minus,
        },
      ],
    },
    {
      title: "Media",
      items: [
        {
          type: "image",
          label: "Image",
          desc: "Upload or display image",
          icon: Image,
        },
        { type: "video", label: "Video", desc: "Embed video", icon: Video },
      ],
    },
    {
      title: "Education",
      items: [
        {
          type: "definition",
          label: "Definition",
          desc: "Explain a concept",
          icon: BookOpen,
        },
        {
          type: "example",
          label: "Example",
          desc: "Show an example",
          icon: Lightbulb,
        },
        {
          type: "exercise",
          label: "Exercise",
          desc: "Practice activity",
          icon: Brain,
        },
      ],
    },
  ];

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        return item.label
          ? item.label
              .toLowerCase()
              .includes(query ? query.toString().toLowerCase() : "")
          : null;
      }),
    }))
    .filter((group) => group.items.length > 0);

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

            return (
              <div
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
