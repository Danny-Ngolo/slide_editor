"use client";

import React, { memo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const DEFAULT_OPTIONS = {
  throwOnError: false,
};

const hasParseError = (html) => html.includes("katex-error");

const MathRenderer = ({
  latex = "",
  mode = "display",
  className,
  options = {},
  fallback = null,
}) => {
  const displayMode = mode === "display";

  const renderOptions = {
    displayMode,
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const source = latex == null ? "" : String(latex);

  const html = katex.renderToString(source, renderOptions);

  const errored = hasParseError(html);

  const [lastValid, setLastValid] = useState(fallback ?? "");

  const [seenSource, setSeenSource] = useState(null);

  if (seenSource !== source) {
    setSeenSource(source);

    if (!errored) {
      setLastValid(source);
    }
  }

  const resolvedLatex = errored ? lastValid : source;

  const resolvedHtml =
    resolvedLatex === source
      ? html
      : katex.renderToString(resolvedLatex, renderOptions);

  return (
    <span
      className={className}
      role="img"
      aria-label={
        resolvedLatex
          ? `Mathematical expression: ${resolvedLatex}`
          : "Empty mathematical expression"
      }
      dangerouslySetInnerHTML={{ __html: resolvedHtml }}
    />
  );
};

export default memo(MathRenderer);