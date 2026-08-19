"use client";

import { withDefaults } from "../../../slides/hooks/mathUtils";
import MathRenderer from "../../../slides/components/blocks/math/MathRenderer";

const MathBlockRenderer = ({ block }) => {
  const content = withDefaults(block?.content);
  const expressions = Array.isArray(content.expressions)
    ? content.expressions
    : [];

  const hasContent = expressions.some(
    (expression) => expression?.latex && expression.latex.trim().length > 0,
  );

  return (
    <section>
      {content.title ? (
        <h2 className="presentation-activity-title">{content.title}</h2>
      ) : null}

      {expressions.length === 0 || !hasContent ? (
        <p className="presentation-math-empty">No mathematical content.</p>
      ) : (
        expressions.map((expression) => {
          const latex = expression?.latex;

          if (!latex || latex.trim().length === 0) return null;

          const display = expression.mode === "display";

          return (
            <div
              key={expression.id}
              className={
                display ? "presentation-math-display" : "presentation-math-inline"
              }
            >
              <MathRenderer latex={latex} mode={expression.mode} />
            </div>
          );
        })
      )}
    </section>
  );
};

export default MathBlockRenderer;