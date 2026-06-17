import React, { useState } from "react";

const ActionButton = ({
  disabled = false,
  isSubOption = false,
  label,
  onClick,
}) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <button
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      disabled={disabled}
      style={{
        width: "100%",
        border: "none",
        borderBottom: "1px solid #335",
        padding: "15px",
        background: isHover ? "#e7e7ff" : "transparent",
        color: "black",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: isSubOption ? "0.9em" : "inherit",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ActionButton;
