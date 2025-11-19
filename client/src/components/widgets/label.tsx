import * as React from "react";

// Tiny class merger (you can reuse the one from the Button if you want)
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  asteriskClassName?: string;
  children?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      required = true,
      asteriskClassName,
      children,
      htmlFor,
      ...props
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          // Base styles - matches shadcn exactly
          "flex items-center gap-1.5 text-sm font-bold leading-none select-none",
          // Disabled states (group + peer)
          "group-data-[disabled=true]/field:opacity-50 group-data-[disabled=true]/field:pointer-events-none",
          "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
        //   "cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            aria-hidden="true"
            className={cn(
              "text-primary font-bold", // primary color for asterisk
              asteriskClassName
            )}
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };