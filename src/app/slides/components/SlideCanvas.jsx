"use client";

import React, { useState } from "react";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";

import BlockRenderer from "./blocks/BlockRenderer";
import EditorToolBar from "./EditorToolBar";
import InsertMenu from "./InsertMenu";
import InsertMenuBetween from "./InsertMenuBetween";
import SortableBlock from "./SortableBlock";

const SlideCanvas = ({
  slide,
  setSlides,
  addBlock,
  deleteBlock,
  updateBlock,
  toggleImportant,
}) => {
  if (!slide) return null;

  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [insertMenuPos, setInsertMenuPos] = useState(null);

  const handleClickAddBlock = (e) => {
    const clickY = e.clientY;
    const clickX = e.clientX;
    const menuHeight = 250;
    const menuWidth = 200;

    const spaceBelow = window.innerHeight - clickY;
    const spaceAbove = clickY;

    let top =
      spaceBelow < menuHeight && spaceAbove > menuHeight
        ? clickY - menuHeight
        : clickY + 8;
    let left =
      clickX + menuWidth > window.innerWidth
        ? window.innerWidth - menuWidth - 10
        : clickX;

    setInsertMenuPos({ top, left });

    setShowInsertMenu(true);
  };

  // NEW CODE START *******************************

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSlides((prev) => {
      return prev.map((slideItem) => {
        if (slideItem.id !== slide.id) return slideItem;

        const oldIndex = slideItem.blocks.findIndex((b) => b.id === active.id);
        const newIndex = slideItem.blocks.findIndex((b) => b.id === over.id);

        return {
          ...slideItem,
          blocks: arrayMove(slideItem.blocks, oldIndex, newIndex),
        };
      });
    });
  };

  // NEW CODE END ********************************

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={slide.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
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
                {slide.blocks.map((block, index) => {
                  return (
                    <div key={block.id}>
                      {index === 0 && (
                        <InsertMenuBetween
                          onInsert={(type) => addBlock(slide.id, type, 0)}
                        />
                      )}

                      <SortableBlock block={block}>
                        <BlockRenderer
                          block={block}
                          slideId={slide.id}
                          addBlock={addBlock}
                          updateBlock={updateBlock}
                          deleteBlock={deleteBlock}
                          toggleImportant={toggleImportant}
                        />
                      </SortableBlock>

                      {/* INSERT MENU AFTER EACH BLOCK */}

                      <InsertMenuBetween
                        onInsert={(type) => addBlock(slide.id, type, index + 1)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>This slide is empty. Blocks will appear here</p>
            )}

            <button
              onClick={handleClickAddBlock}
              style={{ marginTop: "20px", padding: "10px 15px" }}
            >
              + Add Block
            </button>

            {showInsertMenu && (
              <InsertMenu
                position={insertMenuPos}
                onSelect={(type, variant = undefined) => {
                  addBlock(slide.id, type, null, { variant });
                }}
                onClose={() => setShowInsertMenu(false)}
              />
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SlideCanvas;
