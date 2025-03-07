
import React from 'react';
import { cn } from '@/lib/utils';
import { documentComponent } from '@/utils/componentDocs';

/**
 * Card component props interface
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant style for the card */
  variant?: 'default' | 'glass' | 'outline' | 'interactive';
  /** Whether the card should have a floating appearance */
  floating?: boolean;
  /** Whether the card has a hoverable effect */
  hoverable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Card Header component props
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to center the content */
  centered?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Header content */
  children: React.ReactNode;
}

/**
 * Card Title component props
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Title size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Title content */
  children: React.ReactNode;
  /** HTML element to render as (default: h3) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Card Content component props
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Card Footer component props
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Footer content */
  children: React.ReactNode;
}

/**
 * A flexible card component for displaying content in a contained area
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', floating = false, hoverable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          {
            'bg-card text-card-foreground shadow': variant === 'default',
            'bg-black/20 backdrop-blur-md border border-white/10': variant === 'glass',
            'border border-border': variant === 'outline',
            'bg-card text-card-foreground shadow hover:shadow-lg transition-shadow cursor-pointer': variant === 'interactive',
            'shadow-lg': floating,
            'hover:shadow-md transition-shadow': hoverable,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * Card Header component for containing title and description
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ centered = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-6 pb-3',
        { 'text-center': centered },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

/**
 * Card Title component
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ size = 'md', className, as: Component = 'h3', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'font-semibold leading-none tracking-tight',
        {
          'text-lg': size === 'sm',
          'text-2xl': size === 'md',
          'text-3xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

/**
 * Card Content component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
);

/**
 * Card Footer component
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0 flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  )
);

// Add displayNames for better debugging
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

// Document the Card component
documentComponent(Card as any, {
  displayName: 'Card',
  description: 'A flexible card component for displaying content in a contained area',
  category: 'Layout',
  props: {
    variant: {
      type: '"default" | "glass" | "outline" | "interactive"',
      description: 'Style variant for the card',
      defaultValue: 'default'
    },
    floating: {
      type: 'boolean',
      description: 'Whether the card should have a floating appearance',
      defaultValue: 'false'
    },
    hoverable: {
      type: 'boolean',
      description: 'Whether the card has a hoverable effect',
      defaultValue: 'false'
    },
    className: {
      type: 'string',
      description: 'Additional CSS classes to apply'
    },
    children: {
      type: 'React.ReactNode',
      description: 'Card content',
      required: true
    }
  },
  examples: [
    {
      title: 'Basic Card',
      description: 'A simple card with a title and content',
      code: `
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here...
  </CardContent>
</Card>
      `
    },
    {
      title: 'Glass Card',
      description: 'A card with a glassmorphic effect',
      code: `
<Card variant="glass">
  <CardHeader>
    <CardTitle>Glass Card</CardTitle>
  </CardHeader>
  <CardContent>
    This card has a glass effect.
  </CardContent>
</Card>
      `
    }
  ]
});

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
