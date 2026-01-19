import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LineItem as LineItemPrimitive } from '@wix/ecom/components';

/**
 * Root component for cart line items.
 * Provides context for line item details like image, title, quantity, selected options, etc.
 *
 * @component
 * @example
 * ```tsx
 * <CartLineItems>
 *   <CartLineItemRepeater>
 *     <LineItem>
 *       <div className="flex items-center gap-4 p-4 border-b">
 *         <LineItemImage size="lg" className="rounded-lg" />
 *         <div className="flex-1">
 *           <LineItemTitle size="lg" className="font-semibold mb-2" />
 *           <LineItemSelectedOptions className="text-sm text-gray-600">
 *             <LineItemSelectedOptionRepeater>
 *               <SelectedOption>
 *                 <SelectedOptionText size="sm" />
 *               </SelectedOption>
 *             </LineItemSelectedOptionRepeater>
 *           </LineItemSelectedOptions>
 *         </div>
 *         <div className="text-right">
 *           <div className="font-semibold mb-2">$29.99</div>
 *           <LineItemQuantity>
 *             <Quantity>
 *               <div className="flex items-center border rounded">
 *                 <QuantityDecrement>-</QuantityDecrement>
 *                 <QuantityInput />
 *                 <QuantityIncrement>+</QuantityIncrement>
 *               </div>
 *             </Quantity>
 *           </LineItemQuantity>
 *         </div>
 *       </div>
 *     </LineItem>
 *   </CartLineItemRepeater>
 * </CartLineItems>
 * ```
 */
export const LineItem = LineItemPrimitive.Root;

// LineItem Image Component
const lineItemImageVariants = cva('rounded-lg object-cover', {
  variants: {
    size: {
      default: 'w-16 h-16',
      sm: 'w-12 h-12',
      lg: 'w-24 h-24',
      xl: 'w-32 h-32',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LineItemImageProps
  extends React.ComponentPropsWithoutRef<typeof LineItemPrimitive.Image>,
    VariantProps<typeof lineItemImageVariants> {}

/**
 * Displays the product image for a cart line item.
 * Automatically loads the correct image from the product data.
 *
 * @component
 * @example
 * ```tsx
 * <LineItem>
 *   <div className="flex items-start gap-4">
 *     <LineItemImage
 *       size="xl"
 *       className="rounded-lg border"
 *     />
 *     <div className="flex-1">
 *       <LineItemTitle />
 *       <div className="text-sm text-gray-500 mt-1">
 *         <LineItemSelectedOptions>
 *           <LineItemSelectedOptionRepeater>
 *             <SelectedOption>
 *               <SelectedOptionText />
 *             </SelectedOption>
 *           </LineItemSelectedOptionRepeater>
 *         </LineItemSelectedOptions>
 *       </div>
 *     </div>
 *   </div>
 * </LineItem>
 * ```
 */
export const LineItemImage = React.forwardRef<
  React.ElementRef<typeof LineItemPrimitive.Image>,
  LineItemImageProps
>(({ size, className, ...props }, ref) => {
  return (
    <LineItemPrimitive.Image
      {...props}
      ref={ref}
      className={cn(lineItemImageVariants({ size }), className)}
    />
  );
});

LineItemImage.displayName = 'LineItemImage';

// LineItem Title Component
const lineItemTitleVariants = cva('font-semibold text-content-primary', {
  variants: {
    size: {
      default: 'text-lg',
      sm: 'text-base',
      lg: 'text-xl',
      xl: 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LineItemTitleProps
  extends React.ComponentPropsWithoutRef<typeof LineItemPrimitive.Title>,
    VariantProps<typeof lineItemTitleVariants> {}

/**
 * Displays the product title/name for a cart line item.
 * Shows the name of the product that was added to the cart.
 *
 * @component
 * @example
 * ```tsx
 * <LineItem>
 *   <div className="flex justify-between items-start">
 *     <div>
 *       <LineItemTitle size="lg" className="hover:text-blue-600 cursor-pointer" />
 *       <LineItemSelectedOptions className="text-sm text-gray-500 mt-1">
 *         <LineItemSelectedOptionRepeater>
 *           <SelectedOption>
 *             <SelectedOptionText />
 *           </SelectedOption>
 *         </LineItemSelectedOptionRepeater>
 *       </LineItemSelectedOptions>
 *     </div>
 *     <div className="text-right">
 *       <div className="font-semibold">$29.99</div>
 *     </div>
 *   </div>
 * </LineItem>
 * ```
 */
export const LineItemTitle = React.forwardRef<
  React.ElementRef<typeof LineItemPrimitive.Title>,
  LineItemTitleProps
>(({ size, className, ...props }, ref) => {
  return (
    <LineItemPrimitive.Title
      {...props}
      ref={ref}
      className={cn(lineItemTitleVariants({ size }), className)}
    >
      {props.children}
    </LineItemPrimitive.Title>
  );
});

LineItemTitle.displayName = 'LineItemTitle';

// LineItem SelectedOptions Component
/**
 * Container for displaying all selected product options for a line item.
 * Shows the chosen variants, modifiers, and customizations.
 *
 * @component
 * @example
 * ```tsx
 * <LineItem>
 *   <LineItemTitle />
 *   <LineItemSelectedOptions className="text-sm text-gray-600 mt-1">
 *     <LineItemSelectedOptionRepeater>
 *       <SelectedOption>
 *         <div className="flex items-center gap-2">
 *           <span className="font-medium">
 *             <SelectedOptionText />
 *           </span>
 *         </div>
 *       </SelectedOption>
 *     </LineItemSelectedOptionRepeater>
 *   </LineItemSelectedOptions>
 * </LineItem>
 * ```
 */
export const LineItemSelectedOptions = React.forwardRef<
  React.ElementRef<typeof LineItemPrimitive.SelectedOptions>,
  React.ComponentPropsWithoutRef<typeof LineItemPrimitive.SelectedOptions>
>((props, ref) => {
  return (
    <LineItemPrimitive.SelectedOptions {...props} ref={ref}>
      {props.children}
    </LineItemPrimitive.SelectedOptions>
  );
});

LineItemSelectedOptions.displayName = 'LineItemSelectedOptions';

/**
 * Repeater component that renders each selected option for a line item.
 * Automatically iterates through all selected product options.
 *
 * @component
 * @example
 * ```tsx
 * <LineItemSelectedOptions>
 *   <LineItemSelectedOptionRepeater>
 *     <SelectedOption>
 *       <div className="flex items-center gap-2">
 *         <SelectedOptionText size="sm" className="text-gray-600" />
 *         <SelectedOptionColor className="w-4 h-4 rounded-full" />
 *       </div>
 *     </SelectedOption>
 *   </LineItemSelectedOptionRepeater>
 * </LineItemSelectedOptions>
 * ```
 */
export const LineItemSelectedOptionRepeater =
  LineItemPrimitive.SelectedOptionRepeater;
LineItemSelectedOptionRepeater.displayName = 'LineItemSelectedOptionRepeater';

/**
 * Container for line item quantity controls.
 * Wraps quantity selector components for cart line items.
 *
 * @component
 * @example
 * ```tsx
 * <LineItem>
 *   <div className="flex items-center justify-between">
 *     <div>
 *       <LineItemTitle />
 *       <LineItemSelectedOptions>
 *         <LineItemSelectedOptionRepeater>
 *           <SelectedOption>
 *             <SelectedOptionText />
 *           </SelectedOption>
 *         </LineItemSelectedOptionRepeater>
 *       </LineItemSelectedOptions>
 *     </div>
 *     <LineItemQuantity>
 *       <Quantity>
 *         <div className="flex items-center border rounded">
 *           <QuantityDecrement>-</QuantityDecrement>
 *           <QuantityInput />
 *           <QuantityIncrement>+</QuantityIncrement>
 *         </div>
 *       </Quantity>
 *     </LineItemQuantity>
 *   </div>
 * </LineItem>
 * ```
 */
export const LineItemQuantity = React.forwardRef<
  React.ElementRef<typeof LineItemPrimitive.Quantity>,
  React.ComponentPropsWithoutRef<typeof LineItemPrimitive.Quantity>
>((props, ref) => {
  return (
    <LineItemPrimitive.Quantity {...props} ref={ref}>
      {props.children}
    </LineItemPrimitive.Quantity>
  );
});

LineItemQuantity.displayName = 'LineItemQuantity';
