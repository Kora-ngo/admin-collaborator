import React from "react";

interface RowItem {
  leftText: string | React.ReactNode;
  rightText: string | React.ReactNode;
  leftSubText?: string;
  rightSubText?: string;
}

interface ListRowProps {
  leftTitle?: string;
  rightTitle?: string;
  rows: RowItem[];
  bgColor?: boolean;
  className?: string;
}

const ListRow: React.FC<ListRowProps> = ({
  leftTitle,
  rightTitle,
  rows,
  bgColor = false,
  className = "",
}) => {
  return (
    <div
      className={`border border-gray-300 rounded-lg ${
        bgColor ? "bg-gray-100" : ""
      } ${className}`}
    >
      {/* Titles */}
      {(leftTitle || rightTitle) && (
        <div className="flex justify-between px-4 py-3 mb-1 rounded-t-lg bg-muted">
          <p className="text-sm font-semibold text-black">{leftTitle}</p>
          <p className="text-sm font-semibold text-black">{rightTitle}</p>
        </div>
      )}

      {/* Dynamic Responsive Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row md:justify-between 
                     px-4 py-2 gap-1 border-b border-gray-300 last:border-b-0"
        >
          {/* Left side */}
          <div className="flex-1">
            <div className="text-sm text-gray-500 font-semibold">
              {row.leftText}
            </div>
            {row.leftSubText && (
              <p className="text-xs text-gray-400">{row.leftSubText}</p>
            )}
          </div>

          {/* Right side */}
          <div className="text-left md:text-right flex-1">
            <div className="text-sm text-gray-900 font-semibold">
              {row.rightText}
            </div>
            {row.rightSubText && (
              <p className="text-xs text-gray-400">{row.rightSubText}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListRow;
