"use client";

import { sanitizeHtml } from "./sanitize";

const RichText = ({ html = "", className }) => {
  const clean = sanitizeHtml(html);

  if (!clean) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichText;
