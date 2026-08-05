import { useEditorContext } from "../components/EditorContext";
import { consumeLongPressFired } from "./useLongPress";

export function useSelection() {
  const { setSelectedBlock, setSelectedBlocks, setSelectedSlides } =
    useEditorContext();

  const handleSelectBlock = (e, slideId, blockId) => {
    e.stopPropagation();

    if (consumeLongPressFired()) return;

    setSelectedSlides([]);

    // set multiple selectedBlocks with ctrlKey

    if (e.ctrlKey) {
      setSelectedBlocks((prev) => {
        const exists = prev.some(
          (block) => block.slideId === slideId && block.blockId === blockId,
        );

        if (exists) {
          return prev.filter(
            (block) =>
              !(block.slideId === slideId && block.blockId === blockId),
          );
        }

        return [...prev, { slideId, blockId }];
      });

      return;
    } else {
      // Set the single selectedBlock for it is used in other staffs

      setSelectedBlock({
        slideId,
        blockId,
      });
      setSelectedBlocks([{ slideId, blockId }]);
    }
  };

  const isBlockSelected = (slideId, blockId, selectedBlocks) => {
    return selectedBlocks.some(
      (b) => b.slideId === slideId && b.blockId === blockId,
    );
  };

  const isSlideSelected = (slideId, selectedSlides) => {
    return selectedSlides.includes(slideId);
  };

  const toggleBlockSelection = (slideId, blockId) => {
    setSelectedSlides([]);

    setSelectedBlocks((prev) => {
      const exists = prev.some(
        (block) => block.slideId === slideId && block.blockId === blockId,
      );

      if (exists) {
        return prev.filter(
          (block) => !(block.slideId === slideId && block.blockId === blockId),
        );
      }

      return [...prev, { slideId, blockId }];
    });
  };

  const toggleSlideSelection = (slideId) => {
    setSelectedBlocks([]);

    setSelectedSlides((prev) => {
      if (prev.includes(slideId)) {
        return prev.filter((id) => id !== slideId);
      }

      return [...prev, slideId];
    });
  };

  return {
    handleSelectBlock,
    isBlockSelected,
    isSlideSelected,
    toggleBlockSelection,
    toggleSlideSelection,
  };
}
