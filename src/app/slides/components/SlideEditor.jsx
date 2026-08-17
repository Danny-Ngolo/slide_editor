"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";
import { useEditorContext } from "./EditorContext";
import SelectionActionsBar from "./SelectionActionsBar";
import lessonService from "@/services/lessonService";
import { useSlides } from "../hooks/useSlides";
import { useHistory } from "../hooks/useHistory";
import { useEditorKeyboard } from "../hooks/useEditorKeyboard";
import {
  AlertCircle,
  Check,
  Loader2,
  PanelLeft,
  PanelRight,
  Save as SaveIcon,
} from "lucide-react";
import { COLORS, RADIUS, SHADOWS } from "./blocks/shared/styles";

const SlideEditor = ({ lessonId }) => {
  const [isDataAlreadyFetched, setIsDataAlreadyFetched] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const { isUndoRedoRef } = useEditorContext();

  const {
    activeSlideId,
    setActiveSlideId,
    effectiveActiveSlideId,
    initializeSlides,
    addSlide,
    deleteSlide,
  } = useSlides();
  const { setSlides, slidesHistory } = useHistory();
  const { handleKeyDown } = useEditorKeyboard();

  const slides = useMemo(() => slidesHistory?.present || [], [slidesHistory]);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const saveTimeoutRef = useRef(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleSave = useCallback(async () => {
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
  }, [slides, lessonId]);

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await handleSave();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Auto-hide the sidebar on narrow screens (still reopenable via the toggle).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => {
      if (mq.matches) setSidebarVisible(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
  }, [lessonId, initializeSlides]);

  useEffect(() => {
    if (!isDataAlreadyFetched) return;

    if (isUndoRedoRef.current === true) {
      isUndoRedoRef.current = false;

      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      handleSave();
    }, 2000);

    return () => clearTimeout(saveTimeoutRef);
  }, [slides, handleSave, isDataAlreadyFetched, isUndoRedoRef]);

  const activeSlide = slides.find(
    (slide) => slide.id === effectiveActiveSlideId,
  );

  return currentLesson ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          height: "48px",
          padding: "0 12px",
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.surfaceAlt,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setSidebarVisible((v) => !v)}
          aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
          title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            background: COLORS.card,
            color: COLORS.text,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
          }}
        >
          {sidebarVisible ? <PanelLeft size={16} /> : <PanelRight size={16} />}
        </button>

        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: COLORS.label,
            letterSpacing: "0.2px",
          }}
        >
          Slide Editor
        </span>
      </header>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {sidebarVisible && (
          <SlidesSidebar
            slides={slides}
            setSlides={setSlides}
            activeSlideId={effectiveActiveSlideId}
            setActiveSlideId={setActiveSlideId}
            addSlide={addSlide}
            deleteSlide={deleteSlide}
          />
        )}

        <SlideCanvas slide={activeSlide} slides={slides} />
      </div>
      <SelectionActionsBar />
      <button
        onClick={handleManualSave}
        style={{
          position: "fixed",
          bottom: "clamp(16px, 4vw, 30px)",
          right: "clamp(16px, 4vw, 30px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "none",
          padding: "12px 20px",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#fff",
          cursor: "pointer",
          boxShadow: SHADOWS.float,
          background:
            saveStatus === "error"
              ? COLORS.danger
              : saveStatus === "saved"
                ? COLORS.success
                : saveStatus === "saving"
                  ? COLORS.warn
                  : COLORS.accent,
        }}
      >
        {saveStatus === "saving" ? (
          <Loader2 size={18} className="spin" />
        ) : saveStatus === "saved" ? (
          <Check size={18} />
        ) : saveStatus === "error" ? (
          <AlertCircle size={18} />
        ) : (
          <SaveIcon size={18} />
        )}
        {saveStatus === "saving"
          ? "Saving"
          : saveStatus === "saved"
            ? "Saved"
            : saveStatus === "error"
              ? "Error"
              : "Save"}
      </button>
    </div>
  ) : (
    <p>No Lesson is available!</p>
  );
};

export default SlideEditor;
