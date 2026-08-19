"use client";

import RichText from "../shared/RichText";

const TextBlockRenderer = ({ block }) => {
  return (
    <RichText className="presentation-rich" html={block?.content?.html} />
  );
};

export default TextBlockRenderer;