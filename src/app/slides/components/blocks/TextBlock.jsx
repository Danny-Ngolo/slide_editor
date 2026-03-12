"use client";

import React from "react";

const TextBlock = ({ block, slideId, updateBlock, toggleImportant }) => {
  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: block.important ? "2px solid orange" : "1px solid #ccc",
      }}
    >
      <button onClick={() => toggleImportant(slideId, block.id)}>
        {block.important ? "⭐ Important" : "Mark Important"}
      </button>

      <textarea
        key={block.id}
        value={block.content}
        placeholder="Write something..."
        onChange={(e) => updateBlock(slideId, block.id, e.target.value)}
        style={{
          width: "100%",
          minHeight: "80px",
          padding: "10px",
        }}
      />
    </div>
  );
};

export default TextBlock;
