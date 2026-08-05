"use client";

import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { useEditorContext } from "./EditorContext";
import { useSelection } from "../hooks/useSelection";
import { useClipboard } from "../hooks/useClipboard";
import { useSlides } from "../hooks/useSlides";
import { useLongPress, consumeLongPressFired } from "../hooks/useLongPress";
import SlideActions from "./SlideActions";
import EditableTitle from "./EditableTitle";
import { COLORS, RADIUS, SHADOWS } from "./blocks/shared/styles";

const Slide = ({ slide, activeSlideId, setActiveSlideId, deleteSlide }) => {
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const { selectedSlides, setSelectedSlides, setSelectedBlocks } =
    useEditorContext();
  const { isSlideSelected, toggleSlideSelection } = useSelection();
  const { copySlide, pasteSlide, duplicateSlide } = useClipboard();
  const { updateSlideTitle } = useSlides();

  const longPressHandlers = useLongPress({
    onLongPress: () => toggleSlideSelection(slide.id),
  });

  const handleClick = (e) => {
    if (consumeLongPressFired()) return;

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
        padding: "9px 12px",
        color: isActive ? COLORS.accentText : COLORS.text,
        background: isActive ? COLORS.accentSoft : COLORS.card,
        border: `1px solid ${isActive ? COLORS.accent : COLORS.border}`,
        borderRadius: RADIUS.lg,
        boxShadow: isSlideSelected(slide.id, selectedSlides)
          ? `0 0 0 2px ${COLORS.accent}`
          : SHADOWS.card,
        cursor: "pointer",
        position: "relative",
        fontWeight: isActive ? 600 : 400,
        fontSize: "13px",
      }}
      onClick={handleClick}
      {...longPressHandlers}
    >
      {isRenaming ? (
        <EditableTitle
          value={slide.title}
          autoFocus
          onChange={(t) => updateSlideTitle(slide.id, t)}
          onBlur={() => setIsRenaming(false)}
        />
      ) : (
        <span style={{ paddingRight: "22px", display: "block" }}>
          {slide.title}
        </span>
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowActions((prev) => !prev);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          right: "6px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          borderRadius: RADIUS.sm,
          cursor: "pointer",
          color: COLORS.placeholder,
        }}
      >
        <MoreVertical size={15} />
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
