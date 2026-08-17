"use client";

import React from "react";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import SortableSlide from "./SortableSlide";
import Slide from "./Slide";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  LABEL_STYLE,
  primaryButtonStyle,
} from "../components/blocks/shared/styles";

const SlidesSidebar = ({
  slides,
  activeSlideId,
  setActiveSlideId,
  addSlide,
  deleteSlide,
  activeDragType,
}) => {
  return (
    <SortableContext
      items={slides.map((s) => `slide-${s.id}`)}
      strategy={verticalListSortingStrategy}
    >
        <div
          style={{
            width: "clamp(160px, 24vw, 260px)",
            flexShrink: 0,
            padding: "14px 12px",
            borderRight: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceAlt,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 2px",
            }}
          >
            <div style={{ ...LABEL_STYLE, marginBottom: 0 }}>Slides</div>
            <span
              style={{
                fontSize: "11px",
                color: COLORS.placeholder,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.pill,
                padding: "2px 8px",
              }}
            >
              {slides.length}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {slides.map((slide) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                disabled={activeDragType === "block"}
              >
                <Slide
                  slide={slide}
                  activeSlideId={activeSlideId}
                  setActiveSlideId={setActiveSlideId}
                  deleteSlide={deleteSlide}
                />
              </SortableSlide>
            ))}
          </div>

          <button
            onClick={addSlide}
            style={{
              ...primaryButtonStyle,
              width: "100%",
              marginTop: "auto",
            }}
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>
      </SortableContext>
  );
};

export default SlidesSidebar;
