import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";

export function useTable() {
  const { setSlidesWithoutHistory } = useHistory();

  const createTableBlock = () => {
    const tableBlock = {
      id: generateId(),
      type: "table",
      content: {
        rows: [
          [
            {
              id: generateId(),
              html: "<p></p>",
            },
            {
              id: generateId(),
              html: "<p></p>",
            },
          ],
          [
            {
              id: generateId(),
              html: "<p></p>",
            },
            {
              id: generateId(),
              html: "<p></p>",
            },
          ],
        ],
      },
    };

    return tableBlock;
  };

  const updateCell = (slideId, blockId, rowIndex, columnIndex, newContent) => {
    setSlidesWithoutHistory((slides) =>
      slides.map((slide) => {
        if (slide.id !== slideId) return slide;

        return {
          ...slide,

          blocks: slide.blocks.map((block) => {
            if (block.id !== blockId) return block;

            const rows = [...block.content.rows];

            rows[rowIndex] = [...rows[rowIndex]];

            rows[rowIndex][columnIndex] = {
              ...rows[rowIndex][columnIndex],
              ...newContent,
            };

            return {
              ...block,
              content: {
                ...block.content,
                rows,
              },
            };
          }),
        };
      }),
    );
  };

  return { createTableBlock, updateCell };
}
