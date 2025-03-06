
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-400 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error ? "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-input hover:border-input/80",
            "md:text-sm",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-errormessage={error ? `${props.id}-error` : undefined}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <div 
            id={`${props.id}-error`}
            className="text-destructive text-sm mt-1 font-medium animate-fade-in"
            role="alert"
          >
            {errorMessage}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
