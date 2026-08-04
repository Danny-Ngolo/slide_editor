"use client";

import React, { useEffect, useRef, useState } from "react";

const EditableTitle = ({
  value,
  onChange,
  onBlur,
  autoFocus = false,
  style,
}) => {
  const [editingValue, setEditingValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditingValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const commit = () => {
    const next = editingValue.trim();

    if (next && next !== value) {
      onChange(next);
    } else {
      setEditingValue(value);
    }
  };

  const handleBlur = () => {
    commit();
    onBlur?.();
  };

  return (
    <input
      ref={inputRef}
      value={editingValue}
      onChange={(e) => setEditingValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        e.stopPropagation();

        if (e.key === "Enter") {
          e.preventDefault();
          inputRef.current?.blur();
        }

        if (e.key === "Escape") {
          e.preventDefault();
          setEditingValue(value);
          inputRef.current?.blur();
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "transparent",
        border: "none",
        outline: "none",
        font: "inherit",
        color: "inherit",
        width: "100%",
        ...style,
      }}
    />
  );
};

export default EditableTitle;
