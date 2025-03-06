
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:pointer-events-none active:scale-[0.98] transition-all duration-200 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        quantum: "bg-gradient-to-r from-quantum-500 to-quantum-600 text-white hover:from-quantum-600 hover:to-quantum-700",
        astral: "bg-gradient-to-r from-astral-500 to-astral-600 text-white hover:from-astral-600 hover:to-astral-700",
        ethereal: "bg-gradient-to-r from-ethereal-500 to-ethereal-600 text-white hover:from-ethereal-600 hover:to-ethereal-700",
        glass: "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    asChild = false, 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <React.Fragment>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {typeof children === 'string' ? 'Loading...' : children}
          </React.Fragment>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
