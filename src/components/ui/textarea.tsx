
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, errorMessage, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-400 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error ? "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-input hover:border-input/80",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-errormessage={error ? `${props.id}-error` : undefined}
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
Textarea.displayName = "Textarea"

export { Textarea }
