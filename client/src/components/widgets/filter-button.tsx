import * as React from "react";

const filterIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

const closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

type FilterToggleButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  openText?: string;  // optional text when open
  closedText?: string; // optional text when closed
};

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
  isOpen,
  onToggle,
  className = "",
  openText = "Filter",
  closedText = "Filter",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3  border rounded-md transition-colors
        ${isOpen ? "bg-gray-400 text-white border-gray-400" : "bg-white text-gray-700 border-gray-300"}
        hover:${isOpen ? "bg-gray-600" : "bg-gray-50"} focus:outline-none
        ${className}`}
    >
      {isOpen ? closeIcon : filterIcon}
      <span className="font-medium text-sm">{isOpen ? openText : closedText}</span>
    </button>
  );
};
