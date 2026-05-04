"use client";

import React, { useEffect, useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";
import EditorProvider from "./EditorContext";
import lessonService from "@/services/lessonService";

const SlideEditor = ({ lessonId }) => {
  const [isDataAlreadyFetched, setIsDataAlreadyFetched] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [slides, setSlides] = useState([]);
  const [activeSlideId, setActiveSlideId] = useState(slides[0]?.id);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const loadLesson = async () => {
      const lesson = await lessonService.getLesson(lessonId);

      if (lesson) {
        setCurrentLesson(lesson);
        setSlides(lesson.slides);
      }

      setIsDataAlreadyFetched(true);
    };

    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    if (!isDataAlreadyFetched) return;

    if (slides.length && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }

    const timeout = setTimeout(async () => {
      setIsSaving(true);

      await lessonService.saveLesson(lessonId, { slides });

      setIsSaving(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [slides]);

  const activeSlide = slides.find((slide) => slide.id === activeSlideId);

  return currentLesson ? (
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
      <span
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          border: "1px solid white",
          padding: "12px",
        }}
      >
        {isSaving ? "Saving..." : "Saved"}
      </span>
    </EditorProvider>
  ) : (
    <p>No Lesson is available!</p>
  );
};

export default SlideEditor;
