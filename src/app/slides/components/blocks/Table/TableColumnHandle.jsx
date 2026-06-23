"use client";

import { Plus } from "lucide-react";
import React from "react";
import "./table.css";

const TableColumnHandle = ({ onClick }) => {
  return (
    <button className="table-column-handle" onClick={onClick}>
      <Plus size={14} />
    </button>
  );
};

export default TableColumnHandle;
