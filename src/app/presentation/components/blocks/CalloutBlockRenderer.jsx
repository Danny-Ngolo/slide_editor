"use client";

import calloutTypes from "../../../slides/editor/calloutTypes";
import RichText from "../shared/RichText";

const CalloutBlockRenderer = ({ block }) => {
  const variant = block?.content?.variant || "definition";
  const config = calloutTypes[variant] || calloutTypes.definition;
  const html = block?.content?.html;

  return (
    <div
      className="presentation-callout"
      style={{ border: `1px solid ${config.border}`, background: config.bg }}
    >
      <div
        className="presentation-callout-accent"
        style={{ background: config.accent }}
      />

      <div className="presentation-callout-body">
        <div className="presentation-callout-header">
          <span
            className="presentation-callout-icon"
            style={{
              background: config.bg,
              border: `1px solid ${config.border}`,
            }}
          >
            {config.icon}
          </span>

          <span
            className="presentation-callout-label"
            style={{ color: config.headerColor }}
          >
            {config.label}
          </span>
        </div>

        {html ? (
          <RichText className="presentation-rich" html={html} />
        ) : null}
      </div>
    </div>
  );
};

export default CalloutBlockRenderer;