"use client";

import React from "react";
import { INPUT_STYLE } from "./styles";

export const TimeInput = ({ value, onChange }) => {
  const commit = (e) => {
    const next = e.target.value === "" ? null : Number(e.target.value);
    if ((value ?? null) !== next) onChange(next);
  };

  return (
    <input
      type="number"
      min="0"
      placeholder="--"
      defaultValue={value ?? ""}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      style={{ ...INPUT_STYLE, width: "70px" }}
    />
  );
};