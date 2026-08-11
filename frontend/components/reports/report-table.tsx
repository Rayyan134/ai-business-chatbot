import type { ReactNode } from "react";

interface ReportTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface ReportTableProps<T> {
  columns: ReportTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}

export function ReportTable<T>({
  columns,
  rows,
  emptyMessage = "No records.",
}: ReportTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-foreground/20">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border-subtle last:border-b-0"
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`px-3 py-2.5 align-top ${column.className ?? ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
