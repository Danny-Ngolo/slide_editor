import { useEffect } from "react";

import { navigatePlaceholder, analyzeLatex } from "./mathPlaceholder";
import {
  findRemovableEmptyTemplate,
  getSelectedTemplate,
  isStructuralPosition,
  rangeHasStructuralPosition,
} from "./mathEditorUtils";

export const useMathEditorKeyboard = ({
  elementRef,
  structureRef,
  placeholdersRef,
  previousLatexRef,
  viewRef,
  setPlaceholders,
  setCaret,
  onChangeRef,
  pendingCaretRef,
}) => {
  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const onKeyDown = (event) => {
      const map = placeholdersRef.current;
      const structure = structureRef.current;
      const caretPos = element.selectionStart ?? 0;
      const selectionEnd = element.selectionEnd ?? caretPos;

      if (event.key === "Escape") {
        if (map.length === 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        const ordered = [...map].sort((a, b) => a.from - b.from);

        const exitPosition = current
          ? current.to
          : (ordered[ordered.length - 1]?.to ?? caretPos);

        setPlaceholders([]);

        element.setSelectionRange(exitPosition, exitPosition);

        setCaret(exitPosition);

        return;
      }

      if (event.key === "Tab" && map.length > 0) {
        event.stopPropagation();

        const target = navigatePlaceholder(
          map,
          caretPos,
          event.shiftKey ? "prev" : "next",
        );

        if (target === null) {
          return;
        }

        const ordered = [...map].sort((a, b) => a.from - b.from);

        const currentIndex = ordered.findIndex(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        const targetIndex = ordered.findIndex(
          (placeholder) => placeholder.to === target,
        );

        const wrapping =
          currentIndex !== -1 &&
          targetIndex !== -1 &&
          (event.shiftKey
            ? targetIndex > currentIndex
            : targetIndex < currentIndex);

        if (wrapping) {
          event.preventDefault();
          event.stopPropagation();

          setPlaceholders([]);

          setCaret(caretPos);

          return;
        }

        event.preventDefault();
        event.stopPropagation();

        element.focus();
        element.setSelectionRange(target, target);

        setCaret(target);

        return;
      }

      if (event.key === "ArrowRight" && !event.shiftKey && map.length > 0) {
        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        if (current && caretPos >= current.to) {
          setPlaceholders([]);
        }

        return;
      }

      if (event.key === "ArrowLeft" && !event.shiftKey && map.length > 0) {
        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        if (current && caretPos <= current.from) {
          setPlaceholders([]);
        }

        return;
      }

      // Superscript: Ctrl+^ / Ctrl+Shift+6, or a bare `^` typed in visual mode
      const isSuperscriptKey = event.key === "^" || event.key === "6";
      const isSuperscriptShortcut =
        isSuperscriptKey && (event.ctrlKey || event.metaKey);
      const isBareSuperscript =
        event.key === "^" &&
        !event.ctrlKey &&
        !event.metaKey &&
        viewRef.current === "slots";

      if (isSuperscriptShortcut || isBareSuperscript) {
        event.preventDefault();
        event.stopPropagation();
        
        const currentLatex = previousLatexRef.current;
        // Get selected text
        const selectedText = currentLatex.slice(Math.min(caretPos, selectionEnd), Math.max(caretPos, selectionEnd));
        
        // Create a superscript template insertion
        // If text is selected, use it as the base, otherwise create empty base
        const base = selectedText || "x";
        const newLatex = currentLatex.slice(0, Math.min(caretPos, selectionEnd)) + 
                        `${base}^{}` + 
                        currentLatex.slice(Math.max(caretPos, selectionEnd));
        
        const nextAnalysis = analyzeLatex(newLatex);
        // Place cursor inside the braces for the superscript
        const nextCaret = Math.min(caretPos, selectionEnd) + base.length + 2; // After ^{
        
        previousLatexRef.current = newLatex;
        structureRef.current = nextAnalysis;
        setPlaceholders(nextAnalysis.placeholders);
        setCaret(nextCaret);
        pendingCaretRef.current = nextCaret;
        onChangeRef.current?.(newLatex);
        return;
      }
      
      // Subscript: Ctrl+_ / Ctrl+Shift+-, or a bare `_` typed in visual mode
      const isSubscriptKey = event.key === "_" || event.key === "-";
      const isSubscriptShortcut =
        isSubscriptKey && (event.ctrlKey || event.metaKey);
      const isBareSubscript =
        event.key === "_" &&
        !event.ctrlKey &&
        !event.metaKey &&
        viewRef.current === "slots";

      if (isSubscriptShortcut || isBareSubscript) {
        event.preventDefault();
        event.stopPropagation();
        
        const currentLatex = previousLatexRef.current;
        // Get selected text
        const selectedText = currentLatex.slice(Math.min(caretPos, selectionEnd), Math.max(caretPos, selectionEnd));
        
        // Create a subscript template insertion
        // If text is selected, use it as the base, otherwise create empty base
        const base = selectedText || "x";
        const newLatex = currentLatex.slice(0, Math.min(caretPos, selectionEnd)) + 
                        `${base}_{}` + 
                        currentLatex.slice(Math.max(caretPos, selectionEnd));
        
        const nextAnalysis = analyzeLatex(newLatex);
        // Place cursor inside the braces for the subscript
        const nextCaret = Math.min(caretPos, selectionEnd) + base.length + 2; // After _{
        
        previousLatexRef.current = newLatex;
        structureRef.current = nextAnalysis;
        setPlaceholders(nextAnalysis.placeholders);
        setCaret(nextCaret);
        pendingCaretRef.current = nextCaret;
        onChangeRef.current?.(newLatex);
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        const templates = structure.templates;

        if (templates.length > 0) {
          const removable = findRemovableEmptyTemplate(
            structure,
            caretPos,
            event.key === "Delete",
          );

          if (removable) {
            event.preventDefault();
            event.stopPropagation();

            const currentLatex = previousLatexRef.current;
            const cleanedLatex =
              currentLatex.slice(0, removable.from) +
              currentLatex.slice(removable.to);

            const nextAnalysis = analyzeLatex(cleanedLatex);
            const nextCaret = Math.min(removable.from, cleanedLatex.length);

            previousLatexRef.current = cleanedLatex;
            structureRef.current = nextAnalysis;

            setPlaceholders(nextAnalysis.placeholders);
            setCaret(nextCaret);

            pendingCaretRef.current = nextCaret;
            onChangeRef.current?.(cleanedLatex);

            return;
          }

          const hasSelection = selectionEnd !== caretPos;

          if (viewRef.current === "slots" && !hasSelection) {
            const selectedTemplate = getSelectedTemplate(
              structure,
              caretPos,
              event.key,
            );

            if (selectedTemplate) {
              event.preventDefault();
              event.stopPropagation();

              const currentLatex = previousLatexRef.current;
              const cleanedLatex =
                currentLatex.slice(0, selectedTemplate.from) +
                currentLatex.slice(selectedTemplate.to);

              const nextAnalysis = analyzeLatex(cleanedLatex);
              const nextCaret = Math.min(
                selectedTemplate.from,
                cleanedLatex.length,
              );

              previousLatexRef.current = cleanedLatex;
              structureRef.current = nextAnalysis;

              setPlaceholders(nextAnalysis.placeholders);
              setCaret(nextCaret);

              pendingCaretRef.current = nextCaret;
              onChangeRef.current?.(cleanedLatex, { recordHistory: true });

              return;
            }
          }

          const deleteFrom = hasSelection
            ? Math.min(caretPos, selectionEnd)
            : event.key === "Backspace"
              ? caretPos - 1
              : caretPos;

          const deleteTo = hasSelection
            ? Math.max(caretPos, selectionEnd)
            : deleteFrom + 1;

          if (rangeHasStructuralPosition(templates, deleteFrom, deleteTo)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }

        return;
      }
    };

    element.addEventListener("keydown", onKeyDown, true);

    return () => element.removeEventListener("keydown", onKeyDown, true);
  }, [
    elementRef,
    setCaret,
    setPlaceholders,
    onChangeRef,
    pendingCaretRef,
    placeholdersRef,
    previousLatexRef,
    structureRef,
    viewRef,
  ]);
};
