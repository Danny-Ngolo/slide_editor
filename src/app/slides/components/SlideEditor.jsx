"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SlidesSidebar from "./SlidesSidebar";
import SlideCanvas from "./SlideCanvas";
import { useEditorContext } from "./EditorContext";
import lessonService from "@/services/lessonService";
import { Redo, Undo } from "lucide-react";
import { useSlides } from "../hooks/useSlides";
import { useHistory } from "../hooks/useHistory";
import { useEditorKeyboard } from "../hooks/useEditorKeyboard";

const SlideEditor = ({ lessonId }) => {
  const [isDataAlreadyFetched, setIsDataAlreadyFetched] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const { isUndoRedoRef } = useEditorContext();

  const {
    recordActiveSlideId,
    recordedActiveSlideId,
    initializeSlides,
    addSlide,
    deleteSlide,
  } = useSlides();
  const { setSlides, slidesHistory, undo, redo } = useHistory();
  const { handleKeyDown } = useEditorKeyboard();

  const slides = useMemo(() => slidesHistory?.present || [], [slidesHistory]);
  const [activeSlideId, setActiveSlideId] = useState(null);
  const effectiveActiveSlideId = activeSlideId ?? slides[0]?.id;
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const saveTimeoutRef = useRef(null);

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

  useEffect(() => {
    recordActiveSlideId(effectiveActiveSlideId);
  }, [effectiveActiveSlideId, recordActiveSlideId]);

  const activeSlide = slides.find(
    (slide) => slide.id === effectiveActiveSlideId,
  );

  return currentLesson ? (
    <div>
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
          activeSlideId={effectiveActiveSlideId}
          setActiveSlideId={setActiveSlideId}
          addSlide={addSlide}
          deleteSlide={deleteSlide}
        />

        <SlideCanvas slide={activeSlide} slides={slides} />
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
    </div>
  ) : (
    <p>No Lesson is available!</p>
  );
};

export default SlideEditor;
