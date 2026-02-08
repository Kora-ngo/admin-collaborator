import React from "react";

export interface TableColumn {
  key: string;
  label: string;
  visibleOn: "sm" | "md" | "lg" | "always";
  render?: (row: any, index: number) => React.ReactNode;
  hidden?: boolean | (() => boolean);
}

export interface TableProps {
  columns: (TableColumn | null)[]; // ← Allow null in array
  data: any[];
  className?: string;
  onRowSelect?: (row: any, isSelected: boolean) => void;
  page?: number;
  pageSize?: number;
}
const Table: React.FC<TableProps> = ({
  columns,
  data,
  className = "",
  page,
  pageSize,
}) => {

  // Filter out null columns and apply hidden logic
  const visibleColumns = columns
    .filter((col): col is TableColumn => col !== null) // ← Type guard to remove nulls
    .filter((col) =>
      typeof col.hidden === "function" ? !col.hidden() : !col.hidden
    );

  return (
    <div
      className={`relative overflow-x-auto sm:rounded-lg border border-gray-200 w-full ${className}`}
    >
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-gray-100 border-b border-gray-200">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold text-gray-900
                  ${
                    column.visibleOn === "sm"
                      ? "hidden sm:table-cell"
                      : column.visibleOn === "md"
                      ? "hidden md:table-cell"
                      : column.visibleOn === "lg"
                      ? "hidden lg:table-cell"
                      : ""
                  }
                `}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const globalIndex =
              ((page ?? 1) - 1) * (pageSize ?? data.length) + index + 1;

            return (
              <tr
                key={globalIndex}
                className={`
                  border-b border-gray-200
                  ${
                    row.status === "false" || row.review_status === "false"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-900"
                  }
                  hover:bg-gray-50 transition-all
                `}
              >
                {visibleColumns.map((column, colIndex) => (
                  <td
                    key={`${globalIndex}-${colIndex}`}
                    className={`px-4 py-3
                      ${
                        column.visibleOn === "sm"
                          ? "hidden sm:table-cell"
                          : column.visibleOn === "md"
                          ? "hidden md:table-cell"
                          : column.visibleOn === "lg"
                          ? "hidden lg:table-cell"
                          : ""
                      }
                    `}
                  >
                    {column.render
                      ? column.render(row, globalIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;