import React, { useState } from "react";
import { COLORS, RADIUS } from "./blocks/shared/styles";

const ActionButton = ({
  disabled = false,
  isSubOption = false,
  icon: Icon = null,
  variant = "default",
  label,
  onClick,
}) => {
  const [isHover, setIsHover] = useState(false);
  const isDanger = variant === "danger";

  return (
    <button
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      disabled={disabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "none",
        borderRadius: RADIUS.md,
        padding: isSubOption ? "8px 10px 8px 18px" : "9px 12px",
        background:
          isHover && !disabled
            ? isDanger
              ? COLORS.dangerSoft
              : COLORS.accentSoft
            : "transparent",
        color: disabled
          ? COLORS.placeholder
          : isDanger
            ? COLORS.danger
            : COLORS.text,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: isSubOption ? "0.9em" : "inherit",
        textAlign: "left",
        transition: "background 0.15s ease",
      }}
      onClick={onClick}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
};

export default ActionButton;
