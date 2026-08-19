"use client";

import RichText from "../shared/RichText";

const TableBlockRenderer = ({ block }) => {
  const content = block?.content || {};
  const rows = Array.isArray(content.rows) ? content.rows : [];

  const headerRowIndex = content.headerRow ?? block?.headerRow ?? null;
  const headerColumnIndex =
    content.headerColumn ?? block?.headerColumn ?? null;
  const columnWidths = content.columnWidths ?? block?.columnWidths ?? [];
  const rowHeights = content.rowHeights ?? block?.rowHeights ?? [];

  if (rows.length === 0) {
    return (
      <div className="presentation-unknown" role="note">
        This table is empty.
      </div>
    );
  }

  const renderRow = (row, rowIndex) => {
    const isHeaderRow = rowIndex === headerRowIndex;
    let colIndex = 0;

    return (
      <tr key={row?.id || `row-${rowIndex}`}>
        {row.cells.map((cell, slotIndex) => {
          const colspan = Math.max(1, Number(cell?.colspan) || 1);

          if (cell?.hidden) {
            colIndex += colspan;
            return null;
          }

          const rowspan = Math.max(1, Number(cell?.rowspan) || 1);
          const colIndexStart = colIndex;
          colIndex += colspan;

          const isHeaderColumn = colIndexStart === headerColumnIndex;
          const Tag = isHeaderRow || isHeaderColumn ? "th" : "td";
          const scope = isHeaderRow ? "col" : isHeaderColumn ? "row" : undefined;

          const align =
            cell?.align === "center" || cell?.align === "right"
              ? cell.align
              : "left";

          const cellWidth =
            colspan === 1
              ? columnWidths[colIndexStart] ?? cell?.width
              : null;
          const cellHeight = rowHeights[rowIndex] ?? null;
          const background = cell?.background || null;

          const cellStyle = {
            textAlign: align,
            width: cellWidth ? `${cellWidth}px` : undefined,
            minHeight: cellHeight ? `${cellHeight}px` : undefined,
            background: background || undefined,
          };

          return (
            <Tag
              key={cell?.id || `${rowIndex}-${slotIndex}`}
              colSpan={colspan > 1 ? colspan : undefined}
              rowSpan={rowspan > 1 ? rowspan : undefined}
              scope={scope}
              style={cellStyle}
            >
              <RichText className="presentation-rich" html={cell?.html} />
            </Tag>
          );
        })}
      </tr>
    );
  };

  const useThead = headerRowIndex === 0 && rows.length > 0;
  const bodyRows = useThead ? rows.slice(1) : rows;

  return (
    <div className="presentation-table-wrap">
      <table className="presentation-table">
        {useThead && <thead>{renderRow(rows[0], 0)}</thead>}

        <tbody>
          {bodyRows.map((row, index) =>
            renderRow(row, useThead ? index + 1 : index),
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlockRenderer;