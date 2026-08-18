"use client";

import "./table.css";

const TableDragHandle = ({ listeners, attributes }) => {
  return (
    <button
      className="table-drag-handle"
      {...listeners}
      {...attributes}
      onClick={(e) => e.stopPropagation()}
      type="button"
    >
      ⠿
    </button>
  );
};

export default TableDragHandle;
