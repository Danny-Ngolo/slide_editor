export const CLIPBOARD_MIME = "application/x-slide-editor+json";

const CLIPBOARD_VERSION = 1;

export function htmlToPlainText(html = "") {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function blockToPlainText(block) {
  switch (block.type) {
    case "divider":
      return "---";

    case "code":
      return block.content?.code ?? "";

    case "image":
    case "youtube":
      return block.content?.url ?? "";

    case "table": {
      const rows = block.content?.rows ?? [];

      return rows
        .map((row) =>
          (row.cells ?? [])
            .map((cell) => htmlToPlainText(cell?.html))
            .join("\t"),
        )
        .join("\n");
    }

    default:
      return htmlToPlainText(block.content?.html);
  }
}

export function blocksToPlainText(blocks = []) {
  return blocks.map(blockToPlainText).filter(Boolean).join("\n");
}

export function serializeClipboard(kind, items) {
  const plain =
    kind === "slide"
      ? (items ?? [])
          .map((slide) =>
            [slide?.title, blocksToPlainText(slide?.blocks)]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n\n")
      : blocksToPlainText(items);

  return {
    json: JSON.stringify({ version: CLIPBOARD_VERSION, kind, items }),
    plain,
  };
}

export function deserializeClipboard(json) {
  try {
    const data = JSON.parse(json);

    if (
      !data ||
      data.version !== CLIPBOARD_VERSION ||
      !data.kind ||
      !Array.isArray(data.items)
    ) {
      return null;
    }

    return { kind: data.kind, items: data.items };
  } catch {
    return null;
  }
}

export function parseTsvToGrid(text) {
  const grid = [];

  text.split(/\r?\n/).forEach((row) => {
    if (row.trim() === "") return;
    grid.push(row.split("\t"));
  });

  return grid;
}

export function textToCellHtml(text) {
  if (!text) return "<p></p>";

  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<p>${escaped}</p>`;
}

// The OS clipboard can only carry the custom MIME type reliably in secure
// contexts / modern browsers. Persisting the serialized payload in localStorage
// guarantees copy -> refresh -> paste works in every environment.
export const CLIPBOARD_STORAGE_KEY = "slide-editor:clipboard";

export function persistClipboard(json) {
  try {
    localStorage.setItem(CLIPBOARD_STORAGE_KEY, json);
  } catch {
    // Ignore (e.g. storage disabled).
  }
}

export function readPersistedClipboard() {
  try {
    return localStorage.getItem(CLIPBOARD_STORAGE_KEY);
  } catch {
    return null;
  }
}
