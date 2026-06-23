"use client";

import { Plus } from "lucide-react";
import React from "react";
import "./table.css";

const TableRowHandle = ({ onClick }) => {
  return (
    <button className="table-row-handle" onClick={onClick}>
      <Plus size={14} />
    </button>
  );
};

export default TableRowHandle;
