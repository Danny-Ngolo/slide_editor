"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PresentationNavigation = ({ currentIndex, total, onPrev, onNext }) => {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  return (
    <>
      <span className="presentation-counter" aria-live="polite">
        Slide {currentIndex + 1} of {total}
      </span>

      <button
        type="button"
        className="presentation-nav-button"
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous slide"
        title="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        className="presentation-nav-button"
        onClick={onNext}
        disabled={isLast}
        aria-label="Next slide"
        title="Next slide"
      >
        <ChevronRight size={20} />
      </button>
    </>
  );
};

export default PresentationNavigation;