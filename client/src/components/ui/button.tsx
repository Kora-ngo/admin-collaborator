import * as React from "react";

// Simple tiny class merger (replacement for cn)
function clsx(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Spinner component (same as yours, just inline)
const Spinner = () => (
  <svg
    className="animate-spin size-4 text-current"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.59c0 27.61-22.39 50-50 50s-50-22.39-50-50 22.39-50 50-50 50 22.39 50 50Zm-90.92 0c0 22.6 18.32 40.92 40.92 40.92 22.6 0 40.92-18.32 40.92-40.92 0-22.6-18.32-40.92-40.92-40.92C27.4 9.67 9.08 27.99 9.08 50.59Z"
      fill="#E5E7EB"
    />
    <path
      d="M93.97 39.04a5.5 5.5 0 0 0-3.04-5.49 49.94 49.94 0 0 0-7.19-13.2c-3.97-5.23-9.03-9.48-14.84-12.42-5.81-2.94-12.28-4.59-18.9-4.77-6.62-.18-13.18 1.02-19.23 3.54-6.05 2.52-11.43 6.32-15.75 11.12-4.32 4.8-7.52 10.55-9.35 16.76-.66 2.37.73 4.85 3.15 5.49 2.42.64 4.91-.74 5.57-3.11 1.43-5.13 4.22-9.83 8.1-13.5 3.88-3.67 8.85-6.01 12.11-7.57 4.63-1.61 9.61-2.15 14.52-1.58 4.91.58 9.59 2.23 13.69 4.77 4.1 2.54 7.54 5.9 10.07 9.85a32.26 32.26 0 0 1 4.53 11.6c.4 2.42 2.66 4.06 5.09 3.42Z"
      fill="currentColor"
    />
  </svg>
);

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean; // kept for compatibility, but not used without Slot
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center h-10 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 aria-invalid:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

    const variants: Record<ButtonVariant, string> = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90",
      outline:
        "border border-border bg-background hover:bg-muted hover:text-accent-foreground",
      secondary:
        "bg-accent text-white hover:bg-accent/80",
      ghost:
        "bg-muted hover:bg-muted/70 hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes: Record<ButtonSize, string> = {
      default: "h-9 px-4 py-2 has-svg:px-3",
      sm: "h-8 px-3 text-xs rounded-md gap-1.5 has-svg:px-2.5",
      lg: "h-10 px-6 text-base rounded-md has-svg:px-4",
      icon: "size-9",
    };

    // Auto-detect if children contain an SVG
    const hasIcon = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === "svg"
    );

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          hasIcon && size !== "icon" && "px-3", // adaptive padding when icon is present
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner />}
        <span className={clsx("flex items-center gap-2", loading && "opacity-70")}>
          {loading ? "Please Wait..." : children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };