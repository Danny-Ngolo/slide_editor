import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { withDefaults, createResource } from "./exerciseUtils";

export function useExercise({ slideId, blockId }) {
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

  const updateResources = useCallback(
    (updater) =>
      setSlides((slides) =>
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
                          resources: updater(
                            withDefaults(block.content).resources,
                          ),
                        }),
                      },
                ),
              },
        ),
      ),
    [slideId, blockId, setSlides],
  );

  const addResource = useCallback(
    (type, data = {}) => {
      updateResources((resources) => [
        ...resources,
        createResource(type, data),
      ]);
    },
    [updateResources],
  );

  const removeResource = useCallback(
    (resourceId) => {
      updateResources((resources) =>
        resources.filter((resource) => resource.id !== resourceId),
      );
    },
    [updateResources],
  );

  const updateResource = useCallback(
    (resourceId, patch) => {
      updateResources((resources) =>
        resources.map((resource) =>
          resource.id === resourceId ? { ...resource, ...patch } : resource,
        ),
      );
    },
    [updateResources],
  );

  const moveResource = useCallback(
    (resourceId, direction) => {
      updateResources((resources) => {
        const index = resources.findIndex(
          (resource) => resource.id === resourceId,
        );
        const target = index + direction;
        if (index === -1 || target < 0 || target >= resources.length) {
          return resources;
        }
        const next = [...resources];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    },
    [updateResources],
  );

  return {
    updateField,
    addResource,
    removeResource,
    updateResource,
    moveResource,
  };
}
