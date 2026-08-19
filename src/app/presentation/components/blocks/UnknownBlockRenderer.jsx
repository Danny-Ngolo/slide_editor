"use client";

import { useEffect } from "react";

const UnknownBlockRenderer = ({ block }) => {
  useEffect(() => {
    console.warn(
      `Presentation: unsupported block type "${block?.type}" (block id: ${block?.id}). Skipping its content.`,
    );
  }, [block?.type, block?.id]);

  return (
    <div className="presentation-unknown" role="note">
      This content type is not supported in the presentation view.
    </div>
  );
};

export default UnknownBlockRenderer;