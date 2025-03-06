
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  legendClassName?: string;
  description?: string;
}

const FormFieldset = React.forwardRef<HTMLFieldSetElement, FormFieldsetProps>(
  ({ className, children, legend, legendClassName, description, ...props }, ref) => {
    return (
      <fieldset
        className={cn("space-y-4", className)}
        ref={ref}
        {...props}
      >
        {legend && (
          <legend className={cn("text-base font-medium mb-2 text-foreground", legendClassName)}>
            {legend}
          </legend>
        )}
        {description && (
          <p className="text-sm text-muted-foreground -mt-1 mb-3">{description}</p>
        )}
        {children}
      </fieldset>
    )
  }
)
FormFieldset.displayName = "FormFieldset"

export { FormFieldset }
