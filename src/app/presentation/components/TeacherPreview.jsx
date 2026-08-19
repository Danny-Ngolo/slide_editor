"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import SlideRenderer from "./SlideRenderer";
import PresentationNavigation from "./PresentationNavigation";
import "../presentation.css";

const isInteractiveTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

const TeacherPreview = ({ slides, lessonTitle, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const contentRef = useRef(null);

  const total = slides.length;

  const goPrev = useCallback(() => {
    setCurrentSlideIndex((index) => Math.max(0, index - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlideIndex((index) => Math.min(total - 1, index + 1));
  }, [total]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      if (isInteractiveTarget(e.target)) return;

      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, onClose]);

  const safeIndex = Math.min(currentSlideIndex, Math.max(total - 1, 0));
  const currentSlide = slides[safeIndex];

  return (
    <div className="presentation-preview-overlay">
      <div className="presentation">
        <header className="presentation-header">
          <span className="presentation-preview-badge">Preview</span>

          <h1 className="presentation-title">
            {lessonTitle || "Untitled Lesson"}
          </h1>

          {total > 0 && (
            <PresentationNavigation
              currentIndex={safeIndex}
              total={total}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}

          <button
            type="button"
            className="presentation-nav-button"
            onClick={onClose}
            aria-label="Exit preview"
            title="Exit preview"
          >
            <X size={20} />
          </button>
        </header>

        <div className="presentation-content" ref={contentRef}>
          {total === 0 ? (
            <p className="presentation-empty">No slides available.</p>
          ) : (
            <SlideRenderer key={currentSlide?.id ?? safeIndex} slide={currentSlide} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPreview;
