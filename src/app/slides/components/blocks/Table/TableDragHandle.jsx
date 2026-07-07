"use client";

import "./table.css";

const TableDragHandle = ({ listeners, attributes }) => {
  return (
    <button
      className="table-drag-handle"
      {...listeners}
      {...attributes}
      type="button"
    >
      ⠿
    </button>
  );
};

export default TableDragHandle;
