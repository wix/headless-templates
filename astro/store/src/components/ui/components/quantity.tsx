import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Quantity as QuantityPrimitive } from '@wix/headless-components/react';

/**
 * Root component for quantity selection functionality.
 * Provides context for quantity increment, decrement, input, and reset components.
 *
 * @component
 * @example
 * ```tsx
 * <Quantity>
 *   <div className="flex items-center border border-brand-light rounded-lg">
 *     <QuantityDecrement className="px-3 py-2 hover:bg-surface-primary transition-colors">
 *       -
 *     </QuantityDecrement>
 *     <QuantityInput className="px-4 py-2 text-content-primary border-x border-brand-light min-w-[3rem] text-center" />
 *     <QuantityIncrement className="px-3 py-2 hover:bg-surface-primary transition-colors">
 *       +
 *     </QuantityIncrement>
 *   </div>
 * </Quantity>
 * ```
 */
export const Quantity = QuantityPrimitive.Root;

// Quantity Decrement Component
const quantityDecrementVariants = cva(
  'hover:bg-surface-primary transition-colors',
  {
    variants: {
      variant: {
        default: 'px-3 py-1',
        button: '', // For asChild usage with Button
      },
      size: {
        default: 'px-3 py-1',
        sm: 'px-2 py-1',
        lg: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface QuantityDecrementProps
  extends VariantProps<typeof quantityDecrementVariants> {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Button component that decreases the quantity value when clicked.
 * Must be used within a Quantity component.
 *
 * @component
 * @example
 * ```tsx
 * <Quantity>
 *   <div className="flex items-center">
 *     <QuantityDecrement variant="default" size="sm">
 *       -
 *     </QuantityDecrement>
 *     <QuantityInput />
 *     <QuantityIncrement>+</QuantityIncrement>
 *   </div>
 * </Quantity>
 * ```
 */
export const QuantityDecrement = React.forwardRef<any, QuantityDecrementProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    return (
      <QuantityPrimitive.Decrement
        {...props}
        ref={ref}
        className={cn(quantityDecrementVariants({ variant, size }), className)}
      >
        {children}
      </QuantityPrimitive.Decrement>
    );
  }
);

QuantityDecrement.displayName = 'QuantityDecrement';

// Quantity Input Component
const quantityInputVariants = cva(
  'text-center border-x focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        default: 'border-brand-light focus:ring-brand-primary',
        primary:
          'border-brand-light focus:ring-brand-primary bg-surface-primary text-content-primary',
      },
      size: {
        default: 'w-16 py-1',
        sm: 'w-12 py-1 text-sm',
        lg: 'w-20 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface QuantityInputProps
  extends VariantProps<typeof quantityInputVariants> {
  className?: string;
  [key: string]: any;
}

/**
 * Input component for manually entering quantity values.
 * Must be used within a Quantity component.
 *
 * @component
 * @example
 * ```tsx
 * <Quantity>
 *   <div className="flex items-center border rounded">
 *     <QuantityDecrement>-</QuantityDecrement>
 *     <QuantityInput variant="primary" size="lg" />
 *     <QuantityIncrement>+</QuantityIncrement>
 *   </div>
 * </Quantity>
 * ```
 */
export const QuantityInput = React.forwardRef<any, QuantityInputProps>(
  ({ variant, size, className, ...props }, ref) => {
    return (
      <QuantityPrimitive.Input
        {...props}
        ref={ref}
        className={cn(quantityInputVariants({ variant, size }), className)}
      />
    );
  }
);

QuantityInput.displayName = 'QuantityInput';

// Quantity Increment Component
const quantityIncrementVariants = cva(
  'hover:bg-surface-primary transition-colors',
  {
    variants: {
      variant: {
        default: 'px-3 py-1',
        button: '', // For asChild usage with Button
      },
      size: {
        default: 'px-3 py-1',
        sm: 'px-2 py-1',
        lg: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface QuantityIncrementProps
  extends VariantProps<typeof quantityIncrementVariants> {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Button component that increases the quantity value when clicked.
 * Must be used within a Quantity component.
 *
 * @component
 * @example
 * ```tsx
 * <Quantity>
 *   <div className="flex items-center">
 *     <QuantityDecrement>-</QuantityDecrement>
 *     <QuantityInput />
 *     <QuantityIncrement size="lg" variant="button">
 *       +
 *     </QuantityIncrement>
 *   </div>
 * </Quantity>
 * ```
 */
export const QuantityIncrement = React.forwardRef<any, QuantityIncrementProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    return (
      <QuantityPrimitive.Increment
        {...props}
        ref={ref}
        className={cn(quantityIncrementVariants({ variant, size }), className)}
      >
        {children}
      </QuantityPrimitive.Increment>
    );
  }
);

QuantityIncrement.displayName = 'QuantityIncrement';

// Quantity Reset Component
const quantityResetVariants = cva(
  'text-status-danger hover:text-status-danger/80 hover:bg-status-danger/10 rounded transition-colors',
  {
    variants: {
      variant: {
        default: 'px-2 py-1 text-xs',
        button: '', // For asChild usage with Button
      },
      size: {
        default: 'px-2 py-1 text-xs',
        sm: 'px-1 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface QuantityResetProps
  extends VariantProps<typeof quantityResetVariants> {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Button component that resets the quantity value to its initial state.
 * Must be used within a Quantity component.
 *
 * @component
 * @example
 * ```tsx
 * <Quantity>
 *   <div className="flex items-center gap-2">
 *     <div className="flex border rounded">
 *       <QuantityDecrement>-</QuantityDecrement>
 *       <QuantityInput />
 *       <QuantityIncrement>+</QuantityIncrement>
 *     </div>
 *     <QuantityReset size="sm">Reset</QuantityReset>
 *   </div>
 * </Quantity>
 * ```
 */
export const QuantityReset = React.forwardRef<any, QuantityResetProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    return (
      <QuantityPrimitive.Reset
        {...props}
        ref={ref}
        className={cn(quantityResetVariants({ variant, size }), className)}
      >
        {children}
      </QuantityPrimitive.Reset>
    );
  }
);

QuantityReset.displayName = 'QuantityReset';
