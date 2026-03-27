"use client";

import React, { useState } from "react";
import BlockSelector from "./BlockSelector";
import BlockRenderer from "./blocks/BlockRenderer";
import EditorToolBar from "./EditorToolBar";
import InsertMenu from "./InsertMenu";

const SlideCanvas = ({ slide, addBlock, updateBlock, toggleImportant }) => {
  if (!slide) return null;

  const [showInsertMenu, setShowInsertMenu] = useState(false);

  return (
    <div style={{ padding: "40px", flex: "1", position: "relative" }}>
      <div
        styles={{
          maxWidth: "800px",
          margin: "auto",
          padding: "30px",
          border: "1px solid #ccc",
        }}
      >
        <EditorToolBar />

        <h2>{slide.title}</h2>

        {/* BLOCKS */}

        {slide.blocks.length ? (
          <div>
            {slide.blocks.map((block) => {
              return (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  slideId={slide.id}
                  updateBlock={updateBlock}
                  toggleImportant={toggleImportant}
                />
              );
            })}
          </div>
        ) : (
          <p>This slide is empty. Blocks will appear here</p>
        )}

        <button
          onClick={() => setShowInsertMenu(true)}
          style={{ marginTop: "20px", padding: "10px 15px" }}
        >
          + Add Block
        </button>

        {showInsertMenu && (
          <InsertMenu
            onSelect={(type) => {
              addBlock(slide.id, type);
            }}
            onClose={() => setShowInsertMenu(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SlideCanvas;
