import * as React from "react";

// Tiny cn replacement (you can reuse this across your app)
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Optional: Simple error icon as component
const ErrorIcon = () => (
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
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  prefixElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError = false, prefixElement, ...props }, ref) => {
    const prefixRef = React.useRef<HTMLSpanElement>(null);
    const [prefixWidth, setPrefixWidth] = React.useState(0);

    React.useEffect(() => {
      if (prefixRef.current) {
        // +16px for some breathing room
        setPrefixWidth(prefixRef.current.offsetWidth + 16);
      }
    }, [prefixElement]);

    return (
      <div className="relative w-full flex items-center">
        {/* Prefix (icon or text) */}
        {prefixElement && (
          <span
            ref={prefixRef}
            className="pointer-events-none absolute left-3 flex items-center text-muted-foreground"
            aria-hidden="true"
          >
            {prefixElement}
          </span>
        )}

        {/* Main input */}
        <input
          ref={ref}
          type={type}
          style={{
            paddingLeft: prefixElement ? `${prefixWidth}px` : undefined,
            paddingRight: hasError ? "2.5rem" : undefined,
          }}
          className={cn(
            // Base styles
            "flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "selection:bg-primary selection:text-primary-foreground",
            "transition-all duration-150",

            // Focus states
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20",
            "dark:focus-visible:ring-primary/30",

            // Error states
            hasError &&
              "border-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/30 pr-10",

            // Normal state
            !hasError && "focus-visible:border-primary/50",

            className
          )}
          {...props}
        />

        {/* Error icon */}
        {hasError && (
          <div className="pointer-events-none absolute right-2.5 text-destructive">
            <ErrorIcon />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };