"use client";

import React from "react";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import SortableSlide from "./SortableSlide";
import Slide from "./Slide";

const SlidesSidebar = ({
  slides,
  setSlides,
  activeSlideId,
  setActiveSlideId,
  addSlide,
  deleteSlide,
}) => {
  const handleSlideDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSlides((prevSlides) => {
      const oldIndex = prevSlides.findIndex((s) => s.id === active.id);
      const newIndex = prevSlides.findIndex((s) => s.id === over.id);

      return arrayMove(prevSlides, oldIndex, newIndex);
    });
  };

  return (
    <DndContext
      onDragEnd={handleSlideDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={slides.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            width: "250px",
            padding: "15px",
            borderRight: "1px solid #ccc",
          }}
        >
          <h3>Slides</h3>
          {slides.map((slide) => (
            <SortableSlide key={slide.id} slide={slide}>
              <Slide
                slide={slide}
                activeSlideId={activeSlideId}
                setActiveSlideId={setActiveSlideId}
                deleteSlide={deleteSlide}
              />
            </SortableSlide>
          ))}

          <button
            onClick={addSlide}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "8px",
            }}
          >
            + Add Slide
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SlidesSidebar;
