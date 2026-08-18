import { useEffect } from "react";
import { useEditorContext } from "../components/EditorContext";
import {
  CLIPBOARD_MIME,
  deserializeClipboard,
  normalizeClipboardText,
  readPersistedClipboard,
  serializeClipboard,
} from "../utils/clipboardFormat";
import { useClipboard } from "./useClipboard";

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
      // when a range of cells is currently selected. Also lets the table's own
      // paste handler fall back to its in-memory clipboard when the OS clipboard
      // holds no text at all.
      if (selectedCells.size > 0 && tablePasteHandlerRef.current) {
        const text = e.clipboardData?.getData("text/plain") || "";

        const coords = Array.from(selectedCells)
          .map((s) => s.split(",").map(Number))
          .filter((c) => Number.isInteger(c[0]) && Number.isInteger(c[1]));

        if (coords.length > 0) {
          const blockId =
            tableSelection.blockId ||
            e.target
              ?.closest?.("[data-block-id]")
              ?.getAttribute("data-block-id");

          if (!blockId) return;

          e.preventDefault();

          tablePasteHandlerRef.current({
            blockId,
            targetRow: Math.min(...coords.map((c) => c[0])),
            targetCol: Math.min(...coords.map((c) => c[1])),
            text,
          });

          return;
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
      // context, Safari), and in-memory state is lost on refresh. We keep a
      // local snapshot (persisted + in-memory) so copy -> refresh -> paste
      // still works. It is ONLY used when the OS clipboard holds no text, or
      // text that matches our snapshot — otherwise the clipboard holds external
      // content and must not be overridden with a stale internal copy.
      const osText = e.clipboardData?.getData("text/plain") || "";
      const normalizedOs = normalizeClipboardText(osText);

      const candidates = [];

      const saved = readPersistedClipboard();

      if (saved) {
        const data = deserializeClipboard(saved);

        if (data) {
          candidates.push({
            kind: data.kind,
            items: data.items,
            plain: serializeClipboard(data.kind, data.items).plain,
          });
        }
      }

      if (copiedBlocks.length) {
        candidates.push({
          kind: "block",
          items: copiedBlocks,
          plain: serializeClipboard("block", copiedBlocks).plain,
        });
      }

      if (copiedSlides.length) {
        candidates.push({
          kind: "slide",
          items: copiedSlides,
          plain: serializeClipboard("slide", copiedSlides).plain,
        });
      }

      const match = candidates.find(
        (c) => !osText || normalizedOs === normalizeClipboardText(c.plain),
      );

      if (match) {
        e.preventDefault();

        if (match.kind === "block") {
          pasteBlocksFrom(match.items);
        } else if (match.kind === "slide") {
          pasteSlidesFrom(match.items);
        }
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