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
        borderRight: "1px solid ccc",
      }}
    >
      <h3>Slides</h3>
      {slides.map((slide) => (
        <div
          key={slide.id}
          style={{
            marginBottom: "5px",
            padding: "10px",
            background: slide.id === activeSlideId ? "#eee" : "#fff",
          }}
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
