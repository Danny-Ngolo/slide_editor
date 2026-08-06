"use client";

import React, { useCallback, useEffect, useState } from "react";

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
import { useEditorContext } from "./EditorContext";
import { useSlides } from "../hooks/useSlides";
import { useHistory } from "../hooks/useHistory";
import { computeFixedMenuPosition } from "../utils/menuPosition";
import TableActionMenu from "./blocks/Table/TableActionMenu";
import EditableTitle from "./EditableTitle";

const SlideCanvas = ({ slide, slides }) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [insertMenuPos, setInsertMenuPos] = useState(null);
  const closeInsertMenu = useCallback(() => setShowInsertMenu(false), [setShowInsertMenu]);
  const {
    setSelectedBlock,
    editorToolBarRef,
    tableMenu,
    setTableMenu,
    // tableRef,
    tableMenuRef,
    setTableSelection,
  } = useEditorContext();
  const { addBlock, updateSlideTitle } = useSlides();
  const { setSlides } = useHistory();

  const handleClickAddBlock = (e) => {
    const clickY = e.clientY;
    const clickX = e.clientX;

    setInsertMenuPos(
      computeFixedMenuPosition({
        anchorTop: clickY,
        anchorLeft: clickX,
        menuWidth: 220,
        menuHeight: 250,
      }),
    );

    setShowInsertMenu(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSlides(
      slides.map((slideItem) => {
        if (slideItem.id !== slide.id) return slideItem;

        const oldIndex = slideItem.blocks.findIndex((b) => b.id === active.id);
        const newIndex = slideItem.blocks.findIndex((b) => b.id === over.id);

        return {
          ...slideItem,
          blocks: arrayMove(slideItem.blocks, oldIndex, newIndex),
        };
      }),
    );
  };

  if (!slide) return null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={slide.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            padding: "clamp(12px, 3vw, 40px)",
            flex: "1",
            minWidth: 0,
            height: "100%",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <div
            onClick={() =>
              setSelectedBlock({
                slideId: null,
                blockId: null,
              })
            }
            style={{
              maxWidth: "min(800px, 100%)",
              margin: "auto",
              padding: "clamp(16px, 4vw, 30px)",
              border: "1px solid #e2e5ea",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#1f2328",
              colorScheme: "light",
            }}
          >
            <EditorToolBar useRef={editorToolBarRef} />

            <EditableTitle
              value={slide.title}
              onChange={(t) => updateSlideTitle(slide.id, t)}
              style={{
                fontSize: "clamp(1.4em, 5vw, 2em)",
                fontWeight: "bold",
                margin: "0 0 0.5em",
                display: "block",
                color: "#1f2328",
              }}
            />

            {/* BLOCKS */}

            {slide.blocks.length ? (
              <div>
                {slide.blocks.map((block, index) => {
                  return (
                    <div key={block.id}>
                      {index === 0 && (
                        <InsertMenuBetween
                          onInsert={(type, variant = undefined) =>
                            addBlock(slide.id, type, 0, { variant })
                          }
                        />
                      )}

                      <SortableBlock block={block}>
                        <BlockRenderer
                          block={block}
                          slideId={slide.id}
                          slides={slides}
                        />
                      </SortableBlock>

                      {/* INSERT MENU AFTER EACH BLOCK */}

                      <InsertMenuBetween
                        onInsert={(type, variant = undefined) =>
                          addBlock(slide.id, type, index + 1, {
                            variant,
                          })
                        }
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
                onClose={closeInsertMenu}
              />
            )}

            {/* Render the tableMenu */}
            {tableMenu && (
              // <div ref={tableMenuRef}>
              <TableActionMenu
                tableMenu={tableMenu}
                // slideId={slideId}
                // blockId={block.id}
                closeMenu={() => setTableMenu(null)}
              />
              // </div>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SlideCanvas;
