import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { SelectedOption as SelectedOptionPrimitive } from '@wix/ecom/components';

/**
 * Root component for displaying a selected product option in cart line items.
 * Provides context for showing option names and values that were chosen.
 *
 * @component
 * @example
 * ```tsx
 * <LineItemSelectedOptions>
 *   <LineItemSelectedOptionRepeater>
 *     <SelectedOption>
 *       <div className="flex items-center gap-2">
 *         <SelectedOptionText className="text-sm" />
 *         <SelectedOptionColor className="w-4 h-4 rounded-full" />
 *       </div>
 *     </SelectedOption>
 *   </LineItemSelectedOptionRepeater>
 * </LineItemSelectedOptions>
 * ```
 */
export const SelectedOption = SelectedOptionPrimitive.Root;

// SelectedOption Text Component
const selectedOptionTextVariants = cva('text-content-secondary', {
  variants: {
    size: {
      default: 'text-sm',
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface SelectedOptionTextProps
  extends React.ComponentPropsWithoutRef<typeof SelectedOptionPrimitive.Text>,
    VariantProps<typeof selectedOptionTextVariants> {}

/**
 * Displays the text representation of a selected option.
 * Shows both the option name and selected value (e.g., "Size: Large").
 *
 * @component
 * @example
 * ```tsx
 * <SelectedOption>
 *   <div className="flex flex-wrap gap-2 text-sm text-gray-600">
 *     <SelectedOptionText size="sm" className="bg-gray-100 px-2 py-1 rounded" />
 *   </div>
 * </SelectedOption>
 *
 * // Or in a list format
 * <SelectedOption>
 *   <SelectedOptionText size="base" className="block" />
 * </SelectedOption>
 * ```
 */
export const SelectedOptionText = React.forwardRef<
  React.ElementRef<typeof SelectedOptionPrimitive.Text>,
  SelectedOptionTextProps
>(({ size, className, ...props }, ref) => {
  return (
    <SelectedOptionPrimitive.Text
      {...props}
      ref={ref}
      className={cn(selectedOptionTextVariants({ size }), className)}
    >
      {props.children}
    </SelectedOptionPrimitive.Text>
  );
});

SelectedOptionText.displayName = 'SelectedOptionText';

// SelectedOption Color Component
const selectedOptionColorVariants = cva(
  'flex items-center text-content-secondary',
  {
    variants: {
      size: {
        default: 'gap-2 text-sm',
        xs: 'gap-1 text-xs',
        sm: 'gap-2 text-sm',
        base: 'gap-2 text-base',
        lg: 'gap-3 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface SelectedOptionColorProps
  extends React.ComponentPropsWithoutRef<typeof SelectedOptionPrimitive.Color>,
    VariantProps<typeof selectedOptionColorVariants> {}

/**
 * Displays a color swatch for selected color options.
 * Shows the actual color that was chosen along with optional text.
 *
 * @component
 * @example
 * ```tsx
 * <SelectedOption>
 *   <div className="flex items-center gap-2">
 *     <span className="text-sm text-gray-600">Color:</span>
 *     <SelectedOptionColor
 *       size="base"
 *       className="w-5 h-5 rounded-full border-2 border-gray-300"
 *     />
 *   </div>
 * </SelectedOption>
 *
 * // Or combined with text
 * <SelectedOption>
 *   <SelectedOptionColor size="lg" className="flex items-center gap-3" />
 * </SelectedOption>
 * ```
 */
export const SelectedOptionColor = React.forwardRef<
  React.ElementRef<typeof SelectedOptionPrimitive.Color>,
  SelectedOptionColorProps
>(({ size, className, ...props }, ref) => {
  return (
    <SelectedOptionPrimitive.Color
      {...props}
      ref={ref}
      className={cn(selectedOptionColorVariants({ size }), className)}
    >
      {props.children}
    </SelectedOptionPrimitive.Color>
  );
});

SelectedOptionColor.displayName = 'SelectedOptionColor';
