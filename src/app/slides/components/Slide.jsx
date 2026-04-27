"use client";

import { Trash } from "lucide-react";
import React, { useState } from "react";

const Slide = ({ slide, activeSlideId, setActiveSlideId, deleteSlide }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      // key={slide.id}
      style={{
        marginBottom: "5px",
        padding: "10px",
        color: slide.id === activeSlideId ? "#fff" : "#111",
        background: slide.id === activeSlideId ? "#6a6afb" : "#bdbdfb",
      }}
      onClick={() => setActiveSlideId(slide.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {slide.title}

      {showActions && (
        <button
          onClick={() => deleteSlide(slide.id)}
          style={{ transition: "all 0.15s" }}
        >
          <Trash size={14} /> Delete
        </button>
      )}
    </div>
  );
};

export default Slide;
