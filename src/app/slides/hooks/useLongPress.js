import { useEffect, useRef } from "react";
import { useEditorContext } from "../components/EditorContext";

const DEFAULT_DURATION = 450;
const MOVE_THRESHOLD = 10;
const FLAG_EXPIRE_MS = 500;

let suppressNextClick = false;
let expireTimer = null;

const clearExpireTimer = () => {
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
};

const scheduleFlagExpiry = () => {
  clearExpireTimer();
  expireTimer = setTimeout(() => {
    suppressNextClick = false;
    expireTimer = null;
  }, FLAG_EXPIRE_MS);
};

export const markLongPressFired = () => {
  suppressNextClick = true;
  scheduleFlagExpiry();
};

export const consumeLongPressFired = () => {
  const fired = suppressNextClick;
  suppressNextClick = false;
  clearExpireTimer();
  return fired;
};

export function useLongPress({
  onLongPress,
  duration = DEFAULT_DURATION,
  allowInsideEditable = false,
}) {
  const { activeEditor } = useEditorContext();
  const timerRef = useRef(null);
  const startPosRef = useRef(null);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  const start = (e) => {
    if (timerRef.current) return;

    const target = e.target;
    const insideFormControl = target?.closest?.("input, textarea, select");
    if (insideFormControl) return;

    // Long-presses inside a table cell are always handed to the cell's own
    // native text-selection — never to block selection.
    if (target?.closest?.(".table-cell-inner")) return;

    const insideEditable = target?.closest?.('[contenteditable="true"]');
    if (!allowInsideEditable && insideEditable && activeEditor) return;

    startPosRef.current = { x: e.clientX, y: e.clientY };

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      markLongPressFired();
      onLongPressRef.current?.(e);
    }, duration);
  };

  const move = (e) => {
    if (!timerRef.current || !startPosRef.current) return;

    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);

    if (dx + dy > MOVE_THRESHOLD) {
      cancel();
    }
  };

  const cancel = () => {
    startPosRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearExpireTimer();

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: cancel,
    onPointerCancel: cancel,
  };
}

export default useLongPress;
