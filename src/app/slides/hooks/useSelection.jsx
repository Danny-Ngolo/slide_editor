import { useEditorContext } from "../components/EditorContext";

export function useSelection() {
  const { setSelectedBlock, setSelectedBlocks } = useEditorContext();

  const handleSelectBlock = (e, slideId, blockId) => {
    e.stopPropagation();

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

  return { handleSelectBlock, isBlockSelected };
}
