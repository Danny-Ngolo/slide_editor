import { GripVertical } from "lucide-react";
import { useEditorSortable } from "../hooks/dnd/useEditorSortable";
import { dragHandleStyle } from "./blocks/shared/styles";

export default function SortableBlock({ slideId, block, children }) {
  const { attributes, listeners, setNodeRef, style } = useEditorSortable({
    id: `block-${block.id}`,
    type: "block",
    slideId,
    blockId: block.id,
  });

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        title="Drag to reorder"
        style={{ ...dragHandleStyle, width: "fit-content", padding: "3px 6px" }}
      >
        <GripVertical size={16} />
      </div>

      {children}
    </div>
  );
}