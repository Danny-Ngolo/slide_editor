import { useState } from "react";
import { useEditorContext } from "../components/EditorContext";
import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";

export function useSlides() {
  const { setSlides, slidesHistory, setSlidesWithoutHistory } = useHistory();
  const { setSlidesHistory, recordedActiveSlideId, setRecordedActiveSlideId } =
    useEditorContext();
  const slides = slidesHistory.present;

  const initializeSlides = (slides) => {
    setSlidesHistory((prev) => ({
      past: [],
      present: slides,
      future: [],
    }));
  };

  const addSlide = () => {
    const newSlide = {
      id: generateId(),
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

  const recordActiveSlideId = (newActiveSlideId) => {
    setRecordedActiveSlideId(newActiveSlideId);
  };

  const addBlock = (slideId, type, index = null, initialContent) => {
    console.log("adding a block...");

    const newBlock = {
      id: generateId(),
      type: type,
      content: initialContent || {},
      important: false,
    };

    if (type === "callout" || (type === "text" && !newBlock.content.html)) {
      newBlock.content.html = "<p></p>";
    }

    console.log("newBlock", newBlock);

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

  const updateBlock = (slideId, blockId, newContent, options = {}) => {
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

    const { recordHistory } = options;

    if (recordHistory) {
      setSlides(updatedSlides);
    } else {
      setSlidesWithoutHistory(updatedSlides);
    }
  };

  const replaceBlock = (slideId, blockId, newBlock) => {
    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedBlocks = slide.blocks.map((block) => {
          if (block.id === blockId) return newBlock;

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

  const transformBlock = (slideId, blockId, block, target) => {
    const transformed = {
      ...block,
      type: target.type,
      content: {
        html: block.content.html,
      },
    };

    if (target.variant) {
      transformed.content.variant = target.variant;
    }

    replaceBlock(slideId, blockId, transformed);
  };

  const deleteBlock = (slideId, blockId) => {
    console.log("deleting block...");

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

  return {
    recordedActiveSlideId,
    recordActiveSlideId,
    initializeSlides,
    addSlide,
    deleteSlide,
    addBlock,
    updateBlock,
    deleteBlock,
    toggleImportant,
    transformBlock,
    replaceBlock,
  };
}
