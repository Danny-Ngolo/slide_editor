import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { withDefaults } from "./codeUtils";

export function useCode({ slideId, blockId }) {
  const { setSlides, setSlidesWithoutHistory } = useHistory();

  const updateField = useCallback(
    (field, value, { recordHistory = false } = {}) => {
      const update = recordHistory ? setSlides : setSlidesWithoutHistory;

      update((slides) =>
        slides.map((slide) =>
          slide.id !== slideId
            ? slide
            : {
                ...slide,
                blocks: slide.blocks.map((block) =>
                  block.id !== blockId
                    ? block
                    : {
                        ...block,
                        content: withDefaults({
                          ...block.content,
                          [field]: value,
                        }),
                      },
                ),
              },
        ),
      );
    },
    [slideId, blockId, setSlides, setSlidesWithoutHistory],
  );

  return { updateField };
}
