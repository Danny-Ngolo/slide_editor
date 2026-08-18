import { useEffect } from "react";
import { useEditorContext } from "../components/EditorContext";
import {
  CLIPBOARD_MIME,
  deserializeClipboard,
  readPersistedClipboard,
  serializeClipboard,
} from "../utils/clipboardFormat";
import { useClipboard } from "./useClipboard";

const normalizeClipboardText = (s) => (s || "").replace(/\r\n/g, "\n").trim();

export function useEditorPaste() {
  const {
    selectedBlocks,
    selectedSlides,
    copiedBlocks,
    copiedSlides,
    selectedCells,
    tableSelection,
    tablePasteHandlerRef,
  } = useEditorContext();
  const {
    pasteBlocksFrom,
    pasteSlidesFrom,
    getSelectedCopyData,
    copySelectedBlocks,
    copySelectedSlides,
  } = useClipboard();

  useEffect(() => {
    const isEditableTarget = (e) => {
      const target = e.target;

      if (target?.closest?.("input, textarea, select, [contenteditable]")) {
        return true;
      }

      if (target?.closest?.("[data-code-editor]")) {
        return true;
      }

      return false;
    };

    const onCopy = (e) => {
      if (isEditableTarget(e)) return;

      if (!selectedBlocks.length && !selectedSlides.length) return;

      e.preventDefault();

      const data = getSelectedCopyData();

      if (!data) return;

      if (e.clipboardData) {
        const { json, plain } = serializeClipboard(data.kind, data.items);

        e.clipboardData.setData(CLIPBOARD_MIME, json);
        e.clipboardData.setData("text/plain", plain);
      }

      if (data.kind === "block") {
        copySelectedBlocks();
      } else {
        copySelectedSlides();
      }
    };

    const onPaste = (e) => {
      // Import OS clipboard table text (e.g. copied from Excel) as a cell grid
      // when a range of cells is currently selected.
      if (selectedCells.size > 0 && tablePasteHandlerRef.current) {
        const text = e.clipboardData?.getData("text/plain");

        if (text) {
          const coords = Array.from(selectedCells)
            .map((s) => s.split(",").map(Number))
            .filter((c) => Number.isInteger(c[0]) && Number.isInteger(c[1]));

          if (coords.length > 0) {
            e.preventDefault();

            tablePasteHandlerRef.current({
              blockId: tableSelection.blockId,
              targetRow: Math.min(...coords.map((c) => c[0])),
              targetCol: Math.min(...coords.map((c) => c[1])),
              text,
            });

            return;
          }
        }
      }

      if (isEditableTarget(e)) return;

      const raw = e.clipboardData?.getData(CLIPBOARD_MIME);

      if (raw) {
        const data = deserializeClipboard(raw);

        if (data) {
          e.preventDefault();

          if (data.kind === "block") {
            pasteBlocksFrom(data.items);
          } else if (data.kind === "slide") {
            pasteSlidesFrom(data.items);
          }

          return;
        }
      }

      // The OS clipboard may not carry our custom MIME type (non-secure
      // context, Safari). Fall back to the persisted copy so copy -> refresh
      // -> paste still works. We only use it when the OS clipboard holds no
      // text, or text that matches our own copy (so we never override content
      // copied elsewhere). Both sides are normalized because the OS clipboard
      // may rewrite line endings (CRLF) or append a trailing newline.
      const saved = readPersistedClipboard();

      if (saved) {
        const data = deserializeClipboard(saved);

        if (data) {
          const osText = e.clipboardData?.getData("text/plain") || "";
          const persistedPlain = serializeClipboard(data.kind, data.items).plain;

          if (
            !osText ||
            normalizeClipboardText(osText) ===
              normalizeClipboardText(persistedPlain)
          ) {
            e.preventDefault();

            if (data.kind === "block") {
              pasteBlocksFrom(data.items);
            } else if (data.kind === "slide") {
              pasteSlidesFrom(data.items);
            }

            return;
          }
        }
      }

      if (selectedBlocks.length) {
        e.preventDefault();
        pasteBlocksFrom(copiedBlocks);
        return;
      }

      if (selectedSlides.length) {
        e.preventDefault();
        pasteSlidesFrom(copiedSlides);
      }
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [
    pasteBlocksFrom,
    pasteSlidesFrom,
    getSelectedCopyData,
    copySelectedBlocks,
    copySelectedSlides,
    copiedBlocks,
    copiedSlides,
    selectedBlocks.length,
    selectedSlides.length,
    selectedCells,
    tableSelection.blockId,
    tablePasteHandlerRef,
  ]);
}