import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

export function useEditorSortable({
  id,
  type = null,
  slideId = null,
  blockId = null,
  data,
  disabled = false,
}) {
  const sortable = useSortable({
    id,
    data: data ?? { type, slideId, blockId },
    disabled,
  });

  return {
    ...sortable,
    style: {
      transform: CSS.Transform.toString(sortable.transform),
      transition: sortable.transition,
    },
  };
}