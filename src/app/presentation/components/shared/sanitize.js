import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "s",
    "u",
    "mark",
    "sub",
    "sup",
    "code",
    "pre",
    "blockquote",
    "hr",
    "ul",
    "ol",
    "li",
    "a",
    "span",
    "div",
    "label",
    "input",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "class",
    "style",
    "data-type",
    "data-color",
    "type",
    "checked",
    "title",
  ],
  ALLOW_DATA_ATTR: true,
};

export const sanitizeHtml = (html) => {
  if (!html) return "";
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
};
