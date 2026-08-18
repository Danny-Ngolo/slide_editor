import { CLIPBOARD_MIME } from "./clipboardFormat";

function execCommandCopy(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    console.warn("[osClipboard] execCommand copy failed:", err);
    return false;
  }
}

export function writeOsText(text) {
  if (typeof navigator === "undefined" || !text) return false;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    const result = navigator.clipboard.writeText(text);

    if (result && typeof result.catch === "function") {
      result.catch(() => {
        console.warn(
          "[osClipboard] navigator.clipboard.writeText failed, using execCommand fallback",
        );
        execCommandCopy(text);
      });
    }

    return true;
  }

  return execCommandCopy(text);
}

export function writeOsClipboardData({ json, plain }) {
  if (typeof navigator === "undefined" || !json) return false;

  if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
    try {
      const item = new ClipboardItem({
        [CLIPBOARD_MIME]: new Blob([json], { type: CLIPBOARD_MIME }),
        "text/plain": new Blob([plain || ""], { type: "text/plain" }),
      });

      const result = navigator.clipboard.write([item]);

      if (result && typeof result.catch === "function") {
        result.catch(() => {
          console.warn(
            "[osClipboard] navigator.clipboard.write failed, falling back to text/plain",
          );
          writeOsText(plain);
        });
      }

      return true;
    } catch (err) {
      console.warn("[osClipboard] navigator.clipboard.write threw:", err);
    }
  }

  return writeOsText(plain);
}