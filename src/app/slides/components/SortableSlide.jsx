import { GripVertical } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { useEditorSortable } from "../hooks/dnd/useEditorSortable";
import { COLORS, RADIUS, dragHandleStyle } from "./blocks/shared/styles";

export default function SortableSlide({ slide, children, disabled = false }) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    style,
    isOver: isSortableOver,
  } = useEditorSortable({
    id: `slide-${slide.id}`,
    type: "slide",
    slideId: slide.id,
    disabled,
  });

  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: `slide-droppable-${slide.id}`,
    data: { type: "slide", slideId: slide.id },
    disabled: !disabled,
  });

  const isOver = disabled ? isDroppableOver : isSortableOver;

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={{
        ...style,
        position: "relative",
      }}
      {...attributes}
    >
      <div
        {...listeners}
        title="Drag to reorder"
        style={{ ...dragHandleStyle, width: "fit-content", padding: "2px 4px" }}
      >
        <GripVertical size={14} />
      </div>

      {children}

      {disabled && isOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS.md,
            background: "rgba(0, 0, 0, 0.05)",
            boxShadow: `inset 0 0 0 2px ${COLORS.accent}`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
