import * as React from "react";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

interface TextareaProps extends React.ComponentProps<"textarea"> {
  hasError?: boolean;
  prefixElement?: React.ReactNode;
  rows?: number;
}

function Textarea({
  className,
  hasError = false,
  prefixElement,
  rows = 5,
  ...props
}: TextareaProps) {
  const prefixRef = React.useRef<HTMLSpanElement>(null);
  const [prefixWidth, setPrefixWidth] = React.useState(0);

  React.useEffect(() => {
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.offsetWidth + 14);
    }
  }, [prefixElement]);

  return (
    <div className="relative w-full flex items-start">
      {prefixElement && (
        <span
          ref={prefixRef}
          className="absolute top-3 left-3 flex items-center gap-1 pointer-events-none text-gray-500"
        >
          {prefixElement}
        </span>
      )}

      <textarea
        data-slot="textarea"
        style={{ paddingLeft: prefixElement ? `${prefixWidth}px` : undefined }}
        rows={rows}
        className={cn(
          "file:text-foreground selection:bg-primary selection:text-primary-foreground  border-input min-w-0 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none resize-y",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          hasError
            ? "border-red-500 border-2 focus:border-red-500 focus:ring-red-200"
            : "",
          className
        )}
        {...props}
      />

      {hasError && (
        <span className="absolute right-2 top-3 text-red-500 pointer-events-none">
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
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

export { Textarea };
