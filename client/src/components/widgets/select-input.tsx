import * as React from "react";

interface SelectInputProps extends React.ComponentProps<"select"> {
  hasError?: boolean;
  prefixElement?: React.ReactNode;
  options: { label: string; value: string | number }[];
}

function SelectInput({
  className = "",
  hasError = false,
  prefixElement,
  options,
  disabled,
  ...props
}: SelectInputProps) {
  const prefixRef = React.useRef<HTMLSpanElement>(null);
  const [prefixWidth, setPrefixWidth] = React.useState(0);

  React.useEffect(() => {
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.offsetWidth + 14); // +14px for padding/gap
    }
  }, [prefixElement]);

  return (
    <div className="relative w-full flex items-center">
      {/* Prefix Element (e.g., icon or text) */}
      {prefixElement && (
        <span
          ref={prefixRef}
          className="absolute left-3 bottom-1/5 flex items-center gap-1 pointer-events-none text-gray-500"
        >
          {prefixElement}
        </span>
      )}

      {/* Select */}
      <select
        disabled={disabled}
        style={{ paddingLeft: prefixElement ? `${prefixWidth}px` : undefined }}
        className={`
          w-full h-9 min-w-0 rounded-md px-3 py-1 text-base md:text-sm
          bg-transparent outline-none appearance-none
          border 
          ${hasError 
            ? "border-gray-300 focus-visible:ring-primary/30 focus:ring-4 focus:ring-blue-100" 
            : "border-gray-300 focus-visible:ring-primary/30 focus:ring-4 focus:ring-blue-100"
          }
          transition-all duration-200
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Dropdown Arrow */}
      <span className="absolute right-3 pointer-events-none text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>

      {/* Error Icon (only when hasError) */}
      {hasError && (
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

export { SelectInput };