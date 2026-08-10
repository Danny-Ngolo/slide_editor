"use client";

import React, { memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const DEFAULT_OPTIONS = {
  throwOnError: false,
};

const MathRenderer = ({ latex = "", mode = "display", className, options = {} }) => {
  const displayMode = mode === "display";

  const html = katex.renderToString(latex, {
    displayMode,
    ...DEFAULT_OPTIONS,
    ...options,
  });

  return (
    <span
      className={className}
      role="img"
      aria-label={latex ? `Mathematical expression: ${latex}` : "Empty mathematical expression"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default memo(MathRenderer);