"use client";

import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useEditorContext } from "./EditorContext";
import { useSelection } from "../hooks/useSelection";
import { useClipboard } from "../hooks/useClipboard";
import { useSlides } from "../hooks/useSlides";
import SlideActions from "./SlideActions";
import EditableTitle from "./EditableTitle";

const Slide = ({ slide, activeSlideId, setActiveSlideId, deleteSlide }) => {
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const { selectedSlides, setSelectedSlides, setSelectedBlocks } =
    useEditorContext();
  const { isSlideSelected } = useSelection();
  const { copySlide, pasteSlide, duplicateSlide } = useClipboard();
  const { updateSlideTitle } = useSlides();

  const handleClick = (e) => {
    setActiveSlideId(slide.id);
    setSelectedBlocks([]);

    if (e.ctrlKey) {
      setSelectedSlides((prev) => {
        const exists = prev.includes(slide.id);

        if (exists) {
          return prev.filter((id) => id !== slide.id);
        }

        return [...prev, slide.id];
      });
    } else {
      setSelectedSlides([slide.id]);
    }
  };

  const isActive = slide.id === activeSlideId;

  return (
    <div
      style={{
        marginBottom: "5px",
        padding: "10px",
        color: isActive ? "#fff" : "#111",
        background: isActive ? "#6a6afb" : "#9898ff",
        boxShadow: isSlideSelected(slide.id, selectedSlides)
          ? "0 0 0 2px #fff"
          : "none",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={handleClick}
    >
      {isRenaming ? (
        <EditableTitle
          value={slide.title}
          autoFocus
          onChange={(t) => updateSlideTitle(slide.id, t)}
          onBlur={() => setIsRenaming(false)}
        />
      ) : (
        slide.title
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowActions((prev) => !prev);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "10px",
          right: "5px",
          zIndex: 1000,
          fontSize: "18px",
          cursor: "pointer",
          background: "#222",
          color: "white",
          textShadow: "1px 2px 3px black",
          borderRadius: "2px",
        }}
      >
        <MoreVertical size={18} />
      </div>

      {showActions && (
        <SlideActions
          onRename={() => {
            setIsRenaming(true);
            setShowActions(false);
          }}
          onDuplicate={() => {
            duplicateSlide(slide.id);
            setShowActions(false);
          }}
          onCopySlide={() => {
            copySlide(slide.id);
            setShowActions(false);
          }}
          onPasteSlide={() => {
            pasteSlide(slide.id);
            setShowActions(false);
          }}
          onDelete={() => {
            deleteSlide(slide.id);
            setShowActions(false);
          }}
          setShowActions={setShowActions}
        />
      )}
    </div>
  );
};

export default Slide;
