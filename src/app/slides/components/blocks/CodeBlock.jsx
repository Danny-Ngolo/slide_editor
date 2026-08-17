"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { withDefaults } from "../../hooks/codeUtils";
import { useCode } from "../../hooks/useCode";
import CodeEditor from "./code/CodeEditor";
import { LANGUAGE_OPTIONS } from "./code/languages";
import { copyToClipboard } from "./code/clipboard";
import Select from "./shared/Select";
import { COLORS, INPUT_STYLE, ghostIconButtonStyle } from "./shared/styles";

const CodeBlock = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const { updateField } = useCode({ slideId, blockId: block.id });
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const handleCopy = async (e) => {
    e.stopPropagation();

    if (!content.code) return;

    const ok = await copyToClipboard(content.code);

    if (!ok) return;

    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      style={{
        background: COLORS.card,
        color: COLORS.text,
        padding: "12px 14px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: COLORS.placeholder,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          Code
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={handleCopy}
            onMouseDown={stop}
            disabled={!content.code}
            title={copied ? "Copied!" : "Copy code"}
            aria-label="Copy code"
            style={{
              ...ghostIconButtonStyle,
              color: copied ? COLORS.success : COLORS.placeholder,
              cursor: content.code ? "pointer" : "default",
              opacity: content.code ? 1 : 0.5,
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <Select
            value={content.language}
            options={LANGUAGE_OPTIONS}
            onChange={(v) => updateField("language", v, { recordHistory: true })}
            ariaLabel="Code language"
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <CodeEditor
        code={content.code}
        language={content.language}
        onChange={(code) => updateField("code", code)}
        placeholder="Start typing or paste your code..."
      />
    </div>
  );
};

export default CodeBlock;
