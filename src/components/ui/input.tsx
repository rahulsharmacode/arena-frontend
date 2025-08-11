import * as React from "react";
import { cn } from "@/lib/utils";
import ErrorLabel from "@/components/ErrorLabel";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, ...props }, ref) => {
    return (
      <div className="flex relative z-0 flex-col gap-1">
        <div className="relative bg-white">
          {startIcon && (
            <div className="absolute top-[9px] left-[10px]">{startIcon}</div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute top-[9px] right-[10px]">{endIcon}</div>
          )}
        </div>

        {error && typeof error === "string" && <ErrorLabel message={error} />}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
