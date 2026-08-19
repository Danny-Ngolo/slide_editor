"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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

const PresentationShell = ({ slides }) => {
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
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      if (isInteractiveTarget(e.target)) return;

      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  if (total === 0) {
    return (
      <div className="presentation">
        <div className="presentation-content">
          <p className="presentation-empty">No slides available.</p>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(currentSlideIndex, total - 1);
  const currentSlide = slides[safeIndex];

  return (
    <div className="presentation">
      <header className="presentation-header">
        <h1 className="presentation-title">
          {currentSlide.title || "Untitled Slide"}
        </h1>

        <PresentationNavigation
          currentIndex={safeIndex}
          total={total}
          onPrev={goPrev}
          onNext={goNext}
        />
      </header>

      <div className="presentation-content" ref={contentRef}>
        <SlideRenderer key={currentSlide.id} slide={currentSlide} />
      </div>
    </div>
  );
};

export default PresentationShell;