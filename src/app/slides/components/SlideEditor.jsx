"use client";

import React, { useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";

const SlideEditor = () => {
  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      title: "Slide 1",
      blocks: [],
    },
  ]);

  const [activeSlideId, setActiveSlideId] = useState(slides[0].id);

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      blocks: [],
    };

    setSlides((prev) => [...prev, newSlide]);
  };

  const addBlock = (slideId, type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      content: "",
      important: false,
    };

    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          blocks: [...slide.blocks, newBlock],
        };
      }

      return slide;
    });

    console.log("updatedSlides with new block", updatedSlides);

    setSlides(updatedSlides);
  };

  const updateBlock = (slideId, blockId, newContent) => {
    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedBlocks = slide.blocks.map((block) => {
          if (block.id === blockId)
            return {
              ...block,
              content: newContent,
            };

          return block;
        });

        return {
          ...slide,
          blocks: updatedBlocks,
        };
      }

      return slide;
    });

    console.log("updatedSlides after updating block", updatedSlides);

    setSlides(updatedSlides);
  };

  const toggleImportant = (slideId, blockId) => {
    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedBlocks = slide.blocks.map((block) => {
          if (block.id === blockId) {
            return { ...block, important: !block.important };
          }

          return block;
        });

        return { ...slide, blocks: updatedBlocks };
      }

      return slide;
    });

    setSlides(updatedSlides);
  };

  const activeSlide = slides.find((slide) => slide.id === activeSlideId);
  console.log("active slide", activeSlide);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SlidesSidebar
        slides={slides}
        activeSlideId={activeSlideId}
        setActiveSlideId={setActiveSlideId}
        addSlide={addSlide}
      />

      <SlideCanvas
        slide={activeSlide}
        addBlock={addBlock}
        updateBlock={updateBlock}
        toggleImportant={toggleImportant}
      />
    </div>
  );
};

export default SlideEditor;
