import { useEditorContext } from "../components/EditorContext";

export function useHistory() {
  const { slidesHistory, setSlidesHistory } = useEditorContext();

  const setSlides = (value) => {
    const MAX_HISTORY = 50;

    setSlidesHistory((prev) => {
      const newSlides =
        typeof value === "function" ? value(prev.present) : value;

      // Avoid duplication of history or unnecessary updates

      if (JSON.stringify(prev.present) === JSON.stringify(newSlides)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present].slice(-MAX_HISTORY), // takes the 50 newest updates,
        present: newSlides,
        future: [], // clear redo stack
      };
    });
  };

  const setSlidesWithoutHistory = (value) => {
    setSlidesHistory((prev) => ({
      ...prev,
      present: typeof value === "function" ? value(prev.present) : value,
    }));
  };

  const undo = (isUndoRedo) => {
    isUndoRedo.current = true;

    setSlidesHistory((prev) => {
      if (prev?.past?.length === 0) return prev;

      // the last set in past goes to present and the present set goes to the future

      const previous = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const redo = (isUndoRedo) => {
    isUndoRedo.current = true;

    setSlidesHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: prev.future.slice(1),
      };
    });
  };

  return { setSlides, slidesHistory, setSlidesWithoutHistory, undo, redo };
}
