import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { dragHandleStyle } from "./blocks/shared/styles";

export default function SortableSlide({ slide, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        title="Drag to reorder"
        style={{ ...dragHandleStyle, width: "fit-content", padding: "2px 4px" }}
      >
        <GripVertical size={14} />
      </div>

      {children}
    </div>
  );
}
