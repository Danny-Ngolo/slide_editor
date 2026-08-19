"use client";

import { useEffect, useRef, useState } from "react";
import "highlight.js/styles/github.css";
import { highlightCode } from "../../../slides/components/blocks/code/codeHighlight";
import { LANGUAGE_OPTIONS } from "../../../slides/components/blocks/code/languages";
import { withDefaults } from "../../../slides/hooks/codeUtils";

const CodeBlockRenderer = ({ block }) => {
  const content = withDefaults(block?.content);
  const { code, language } = content;
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  const langOption = LANGUAGE_OPTIONS.find((option) => option.value === language);
  const langLabel = langOption
    ? langOption.label
    : language
      ? language
      : "Plain text";

  const highlighted = highlightCode(code, language);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!code) {
    return (
      <div className="presentation-unknown" role="note">
        This code block is empty.
      </div>
    );
  }

  return (
    <div className="presentation-code">
      <div className="presentation-code-header">
        <span className="presentation-code-lang">{langLabel}</span>

        <button
          type="button"
          className="presentation-code-copy"
          onClick={handleCopy}
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre>
        <code
          className="hljs"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};

export default CodeBlockRenderer;