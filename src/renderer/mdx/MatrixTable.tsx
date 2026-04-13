import { useState } from "react";

interface MatrixRow {
  label: string;
  values: string[];
}

interface MatrixTableProps {
  columns: string[];
  rows: MatrixRow[];
}

export function MatrixTable({ columns, rows }: MatrixTableProps) {
  const [expanded, setExpanded] = useState(false);

  const table = (
    <table className="mdx-matrix-table">
      <thead>
        <tr>
          <th>레이어 \ 도메인</th>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th>{row.label}</th>
            {row.values.map((value, index) => (
              <td key={`${row.label}-${columns[index]}`}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="mdx-matrix-toolbar">
        <button
          type="button"
          className="mdx-matrix-btn"
          onClick={() => setExpanded(true)}
        >
          전체 화면으로 보기
        </button>
      </div>

      <div
        className="mdx-matrix-wrap"
        role="region"
        aria-label="레이어 도메인 매트릭스"
      >
        {table}
      </div>

      {expanded ? (
        <div className="mdx-matrix-overlay" role="dialog" aria-modal="true">
          <div className="mdx-matrix-overlay-head">
            <strong>레이어/도메인 매트릭스</strong>
            <button
              type="button"
              className="mdx-matrix-btn"
              onClick={() => setExpanded(false)}
            >
              닫기
            </button>
          </div>
          <div className="mdx-matrix-overlay-body">{table}</div>
        </div>
      ) : null}
    </>
  );
}
