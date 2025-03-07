
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Define the shape of the property documentation
interface PropDocumentation {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: string;
}

// Define the card variants
type CardVariant = 'default' | 'outline' | 'transparent' | 'glass';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  clickable?: boolean;
  padded?: boolean;
  bordered?: boolean;
  elevated?: boolean;
  className?: string;
  glassOpacity?: number;
  glassBlur?: number;
  children: React.ReactNode;
}

/**
 * Card component that can be styled with different variants
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hoverable = false,
      clickable = false,
      padded = true,
      bordered = true,
      elevated = false,
      glassOpacity = 0.2,
      glassBlur = 8,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Base classes that are always applied
    const baseClasses = cn(
      'rounded-lg transition-all duration-200',
      padded && 'p-4',
      bordered && 'border',
      clickable && 'cursor-pointer',
      elevated && 'shadow-md'
    );

    // Variant-specific classes
    const variantClasses = {
      default: cn(
        'bg-card text-card-foreground border-quantum-700/20',
        hoverable && 'hover:border-quantum-500/50 hover:bg-card/90'
      ),
      outline: cn(
        'bg-transparent border-quantum-700/20',
        hoverable && 'hover:border-quantum-500/50 hover:bg-quantum-900/10'
      ),
      transparent: cn(
        'bg-transparent border-transparent',
        hoverable && 'hover:bg-quantum-900/10'
      ),
      glass: cn(
        `bg-white/5 backdrop-blur-${glassBlur}px border-white/10`,
        hoverable && 'hover:bg-white/10 hover:border-white/20'
      ),
    };

    // Combine all classes
    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Documentation for the Card component properties
const cardPropDocumentation: PropDocumentation[] = [
  {
    name: 'variant',
    type: 'default | outline | transparent | glass',
    description: 'The visual style variant of the card',
    defaultValue: 'default'
  },
  {
    name: 'hoverable',
    type: 'boolean',
    description: 'Adds hover effects to the card',
    defaultValue: 'false'
  },
  {
    name: 'clickable',
    type: 'boolean',
    description: 'Adds a pointer cursor on hover',
    defaultValue: 'false'
  },
  {
    name: 'padded',
    type: 'boolean',
    description: 'Adds padding inside the card',
    defaultValue: 'true'
  },
  {
    name: 'bordered',
    type: 'boolean',
    description: 'Adds a border around the card',
    defaultValue: 'true'
  },
  {
    name: 'elevated',
    type: 'boolean',
    description: 'Adds a shadow to the card',
    defaultValue: 'false'
  },
  {
    name: 'glassOpacity',
    type: 'number',
    description: 'Opacity level for glass variant (0-1)',
    defaultValue: '0.2'
  },
  {
    name: 'glassBlur',
    type: 'number',
    description: 'Blur level in pixels for glass variant',
    defaultValue: '8'
  }
];

// Card subcomponents
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-2 flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center mt-4 pt-2 border-t border-quantum-700/20', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardPropDocumentation,
};
