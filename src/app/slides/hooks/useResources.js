import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { createResource } from "./resourceUtils";

export function useResources({ slideId, blockId, field = "resources" }) {
  const { setSlides } = useHistory();

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
                        content: {
                          ...block.content,
                          [field]: updater(
                            Array.isArray(block.content?.[field])
                              ? block.content[field]
                              : [],
                          ),
                        },
                      },
                ),
              },
        ),
      ),
    [slideId, blockId, setSlides, field],
  );

  const addResource = useCallback(
    (type, data = {}) =>
      updateResources((resources) => [
        ...resources,
        createResource(type, data),
      ]),
    [updateResources],
  );

  const removeResource = useCallback(
    (resourceId) =>
      updateResources((resources) =>
        resources.filter((resource) => resource.id !== resourceId),
      ),
    [updateResources],
  );

  const updateResource = useCallback(
    (resourceId, patch) =>
      updateResources((resources) =>
        resources.map((resource) =>
          resource.id === resourceId ? { ...resource, ...patch } : resource,
        ),
      ),
    [updateResources],
  );

  const moveResource = useCallback(
    (resourceId, direction) =>
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
      }),
    [updateResources],
  );

  return {
    addResource,
    removeResource,
    updateResource,
    moveResource,
  };
}