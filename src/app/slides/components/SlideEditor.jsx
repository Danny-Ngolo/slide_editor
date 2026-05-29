"use client";

import React, { useEffect, useRef, useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";
import EditorProvider from "./EditorContext";
import lessonService from "@/services/lessonService";
import { Redo, Undo } from "lucide-react";

const SlideEditor = ({ lessonId }) => {
  const [isDataAlreadyFetched, setIsDataAlreadyFetched] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [slidesHistory, setSlidesHistory] = useState({
    past: [],
    present: [],
    future: [],
  });
  const slides = slidesHistory?.present || [];

  const MAX_HISTORY = 50;

  const setSlides = (value) => {
    setSlidesHistory((prev) => {
      const newSlides =
        typeof value === "function" ? value(prev.present) : value;

      // Avoid duplication of history or unnecessary updates

      if (JSON.stringify(prev.present) === JSON.stringify(newSlides)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present].slice(MAX_HISTORY), // takes the 50 newest updates,
        present: newSlides,
        future: [], // clear redo stack
      };
    });
  };
  const isUndoRedo = useRef(false);

  const [activeSlideId, setActiveSlideId] = useState(slides[0]?.id);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const saveTimeoutRef = useRef(null);

  const initializeSlides = (slides) => {
    setSlidesHistory((prev) => ({
      past: [],
      present: slides,
      future: [],
    }));
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      blocks: [],
    };

    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (slideId) => {
    if (slides.length === 1) return;

    if (confirm("Do you really want to delete this slide ?") && slideId) {
      setSlides(slides.filter((slide) => slide.id !== slideId));
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
      setSlides(
        slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          return {
            ...slide,
            blocks: slide.blocks.filter((b) => b.id !== blockId),
          };
        }),
      );
    }
  };

  const duplicateBlock = (slideId, blockId) => {
    setSlides((prevSlides) => {
      return prevSlides.map((slide) => {
        if (slide.id !== slideId) return slide;

        const blockIndex = slide.blocks.findIndex(
          (block) => block.id === blockId,
        );

        if (blockIndex === -1) return slide;

        const blockToDuplicate = slide.blocks[blockIndex];

        console.log("block to duplicate", blockToDuplicate);

        const duplicatedBlock = {
          ...structuredClone(blockToDuplicate),
          id: Date.now(),
        };

        const updatedBlocks = [...slide.blocks];

        updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock);

        return {
          ...slide,
          blocks: updatedBlocks,
        };
      });
    });
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

  const handleSave = async () => {
    try {
      setSaveStatus("saving");

      await lessonService.saveLesson(lessonId, { slides });

      setSaveStatus("saved");

      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await handleSave();
  };

  const undo = () => {
    isUndoRedo.current = true;

    setSlidesHistory((prev) => {
      if (prev.past.length === 0) return prev;

      // the last set in past goes to present and the present set goes to the future

      const previous = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const redo = () => {
    isUndoRedo.current = true;

    setSlidesHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: prev.future.slice(1),
      };
    });
  };

  useEffect(() => {
    const loadLesson = async () => {
      const lesson = await lessonService.getLesson(lessonId);

      if (lesson) {
        setCurrentLesson(lesson);
        initializeSlides(lesson.slides);
      }

      setIsDataAlreadyFetched(true);
    };

    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    if (!isDataAlreadyFetched) return;

    console.log("checking slides...", slides);

    // initialize the active slideId so that we don't get empty at the start

    if (slides.length && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }

    if (isUndoRedo.current === true) {
      isUndoRedo.current = false;

      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      handleSave();
    }, 2500);

    return () => clearTimeout(saveTimeoutRef);
  }, [slides]);

  const activeSlide = slides.find((slide) => slide.id === activeSlideId);

  return currentLesson ? (
    <EditorProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "280px",
            zIndex: 200,
          }}
        >
          <button onClick={undo} disabled={slidesHistory.past.length === 0}>
            <Undo size={16} /> Undo
          </button>
          <button onClick={redo} disabled={slidesHistory.future.length === 0}>
            <Redo size={16} /> Redo
          </button>
        </div>
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
          slides={slides}
          setSlides={setSlides}
          addBlock={addBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          duplicateBlock={duplicateBlock}
          toggleImportant={toggleImportant}
        />
      </div>
      <button
        onClick={handleManualSave}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          border: "1px solid white",
          padding: "12px",
        }}
      >
        {saveStatus === "saving"
          ? "Saving"
          : saveStatus === "saved"
            ? "Saved"
            : saveStatus === "error"
              ? "Error"
              : "Save"}
      </button>
    </EditorProvider>
  ) : (
    <p>No Lesson is available!</p>
  );
};

export default SlideEditor;
