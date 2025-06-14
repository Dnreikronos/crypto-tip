import * as React from "react";

import { cn } from "../../lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "unstyled";
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  const base =
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
  const defaultStyle =
    "dark:bg-input/30 border-input border bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";
  const unstyled =
    "bg-transparent border-none shadow-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none";

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        base,
        variant === "unstyled" ? unstyled : defaultStyle,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
