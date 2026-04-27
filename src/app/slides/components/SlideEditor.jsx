"use client";

import React, { useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";
import EditorProvider from "./EditorContext";

const SlideEditor = () => {
  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      title: "Slide 1",
      blocks: [],
    },
  ]);

  const [activeSlideId, setActiveSlideId] = useState(slides[0]?.id);

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      blocks: [],
    };

    setSlides((prev) => [...prev, newSlide]);
  };

  const deleteSlide = (slideId) => {
    if (slides.length === 1) return;

    if (confirm("Do you really want to delete this slide ?") && slideId) {
      setSlides((prev) => {
        return prev?.filter((slide) => slide.id !== slideId);
      });
    }
  };

  const addBlock = (slideId, type, index = null, initialContent = {}) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      content: initialContent,
      important: false,
    };

    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        let blocks = [...slide.blocks];

        if (index === null) {
          blocks.push(newBlock);
        } else {
          blocks.splice(index, 0, newBlock);
        }

        return {
          ...slide,
          blocks,
        };
      }

      return slide;
    });

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

    setSlides(updatedSlides);
  };

  const deleteBlock = (slideId, blockId) => {
    if (confirm("Do you really want to delete this block ?")) {
      setSlides((prev) => {
        return prev.map((slide) => {
          if (slide.id !== slideId) return slide;

          return {
            ...slide,
            blocks: slide.blocks.filter((b) => b.id !== blockId),
          };
        });
      });
    }
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

  return (
    <EditorProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <SlidesSidebar
          slides={slides}
          setSlides={setSlides}
          activeSlideId={activeSlideId}
          setActiveSlideId={setActiveSlideId}
          addSlide={addSlide}
          deleteSlide={deleteSlide}
        />

        <SlideCanvas
          slide={activeSlide}
          setSlides={setSlides}
          addBlock={addBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          toggleImportant={toggleImportant}
        />
      </div>
    </EditorProvider>
  );
};

export default SlideEditor;
