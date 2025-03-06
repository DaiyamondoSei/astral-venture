
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const formLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
  {
    variants: {
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive/90",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        contrast: "text-white font-semibold",
      },
    },
    defaultVariants: {
      required: false,
      variant: "default",
    },
  }
)

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
  VariantProps<typeof formLabelVariants> {
  optional?: boolean;
  htmlFor: string;
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ className, required, optional, variant, children, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(formLabelVariants({ required, variant }), className)}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-xs text-muted-foreground/70">(optional)</span>
      )}
    </LabelPrimitive.Root>
  )
})
FormLabel.displayName = "FormLabel"

export { FormLabel, formLabelVariants }
