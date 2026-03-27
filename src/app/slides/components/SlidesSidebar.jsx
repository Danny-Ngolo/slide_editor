"use client";

import React from "react";

const SlidesSidebar = ({
  slides,
  activeSlideId,
  setActiveSlideId,
  addSlide,
}) => {
  return (
    <div
      style={{
        width: "250px",
        padding: "15px",
        borderRight: "1px solid #ccc",
      }}
    >
      <h3>Slides</h3>
      {slides.map((slide) => (
        <div
          key={slide.id}
          style={{
            marginBottom: "5px",
            padding: "10px",
            color: slide.id === activeSlideId ? "#fff" : "#111",
            background: slide.id === activeSlideId ? "#6a6afb" : "#bdbdfb",
          }}
          onClick={() => setActiveSlideId(slide.id)}
        >
          {slide.title}
        </div>
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
  );
};

export default SlidesSidebar;
