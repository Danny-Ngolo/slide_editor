"use client";

import { Plus } from "lucide-react";
import React from "react";
import "./table.css";

const TableHandle = ({ onClick }) => {
  return (
    <button
      className="table-handle"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <Plus size={14} />
    </button>
  );
};

export default TableHandle;
