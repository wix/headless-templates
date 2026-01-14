import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Cart as CartPrimitive } from '@wix/ecom/components';

/**
 * Root component for shopping cart functionality.
 * Provides context for all cart-related components like line items, totals, actions, etc.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="bg-white rounded-lg shadow p-6">
 *     <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
 *     <CartLineItems>
 *       <CartLineItemRepeater>
 *         <LineItem>
 *           <LineItemTitle />
 *         </LineItem>
 *       </CartLineItemRepeater>
 *     </CartLineItems>
 *     <div className="border-t pt-4 mt-4">
 *       <CartTotalsTotal />
 *     </div>
 *   </div>
 * </Cart>
 * ```
 */
export const Cart = CartPrimitive.Root;

// Cart Totals Components
const cartTotalVariants = cva('flex justify-between', {
  variants: {
    variant: {
      default: 'text-lg text-content-primary',
      subtotal: 'text-lg text-content-primary font-semibold',
      discount: 'text-lg text-status-success',
      shipping: 'text-lg text-content-primary',
      tax: 'text-lg text-content-primary',
      total: 'text-xl font-bold text-content-primary',
    },
    size: {
      default: 'text-lg',
      sm: 'text-sm',
      lg: 'text-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface CartTotalProps
  extends React.ComponentPropsWithoutRef<typeof CartPrimitive.Totals.Price>,
    VariantProps<typeof cartTotalVariants> {}

/**
 * Displays the cart subtotal price.
 * Shows the sum of all line items before taxes, shipping, and discounts.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="space-y-2">
 *     <div className="flex justify-between">
 *       <span>Subtotal:</span>
 *       <CartTotalsPrice variant="subtotal" />
 *     </div>
 *     <div className="flex justify-between">
 *       <span>Shipping:</span>
 *       <CartTotalsShipping />
 *     </div>
 *     <div className="flex justify-between font-bold border-t pt-2">
 *       <span>Total:</span>
 *       <CartTotalsTotal variant="total" />
 *     </div>
 *   </div>
 * </Cart>
 * ```
 */
export const CartTotalsPrice = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Totals.Price>,
  CartTotalProps
>(({ variant = 'subtotal', size, className, ...props }, ref) => {
  return (
    <CartPrimitive.Totals.Price
      {...props}
      ref={ref}
      className={cn(cartTotalVariants({ variant, size }), className)}
    >
      {props.children}
    </CartPrimitive.Totals.Price>
  );
});

CartTotalsPrice.displayName = 'CartTotalsPrice';

export interface CartTotalDiscountProps
  extends React.ComponentPropsWithoutRef<typeof CartPrimitive.Totals.Discount>,
    VariantProps<typeof cartTotalVariants> {}

/**
 * Displays cart discount amount (when coupons or promotions are applied).
 * Only shows when there are active discounts on the cart.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="space-y-2">
 *     <CartTotalsPrice />
 *     <div className="flex justify-between text-green-600">
 *       <span>Discount:</span>
 *       <CartTotalsDiscount variant="discount" />
 *     </div>
 *     <CartTotalsTotal />
 *   </div>
 * </Cart>
 * ```
 */
export const CartTotalsDiscount = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Totals.Discount>,
  CartTotalDiscountProps
>(({ variant = 'discount', size, className, ...props }, ref) => {
  return (
    <CartPrimitive.Totals.Discount
      {...props}
      ref={ref}
      className={cn(cartTotalVariants({ variant, size }), className)}
    >
      {props.children}
    </CartPrimitive.Totals.Discount>
  );
});

CartTotalsDiscount.displayName = 'CartTotalsDiscount';

/**
 * Displays cart shipping costs.
 * Shows shipping fees and delivery options when applicable.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="space-y-2">
 *     <CartTotalsPrice />
 *     <div className="flex justify-between">
 *       <span>Shipping:</span>
 *       <CartTotalsShipping variant="shipping" />
 *     </div>
 *     <CartTotalsTotal />
 *   </div>
 * </Cart>
 * ```
 */
export interface CartTotalShippingProps
  extends React.ComponentPropsWithoutRef<typeof CartPrimitive.Totals.Shipping>,
    VariantProps<typeof cartTotalVariants> {}

export const CartTotalsShipping = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Totals.Shipping>,
  CartTotalShippingProps
>(({ variant = 'shipping', size, className, ...props }, ref) => {
  return (
    <CartPrimitive.Totals.Shipping
      {...props}
      ref={ref}
      className={cn(cartTotalVariants({ variant, size }), className)}
    >
      {props.children}
    </CartPrimitive.Totals.Shipping>
  );
});

CartTotalsShipping.displayName = 'CartTotalsShipping';

/**
 * Displays cart tax amount.
 * Shows calculated taxes based on cart contents and shipping address.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="space-y-2">
 *     <CartTotalsPrice />
 *     <CartTotalsShipping />
 *     <div className="flex justify-between">
 *       <span>Tax:</span>
 *       <CartTotalsTax variant="tax" />
 *     </div>
 *     <CartTotalsTotal />
 *   </div>
 * </Cart>
 * ```
 */
export interface CartTotalTaxProps
  extends React.ComponentPropsWithoutRef<typeof CartPrimitive.Totals.Tax>,
    VariantProps<typeof cartTotalVariants> {}

export const CartTotalsTax = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Totals.Tax>,
  CartTotalTaxProps
>(({ variant = 'tax', size, className, ...props }, ref) => {
  return (
    <CartPrimitive.Totals.Tax
      {...props}
      ref={ref}
      className={cn(cartTotalVariants({ variant, size }), className)}
    >
      {props.children}
    </CartPrimitive.Totals.Tax>
  );
});

CartTotalsTax.displayName = 'CartTotalsTax';

/**
 * Displays the final cart total including all fees and taxes.
 * Shows the complete amount the customer will be charged.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="space-y-2">
 *     <CartTotalsPrice />
 *     <CartTotalsShipping />
 *     <CartTotalsTax />
 *     <div className="flex justify-between font-bold border-t pt-2">
 *       <span>Total:</span>
 *       <CartTotalsTotal variant="total" />
 *     </div>
 *   </div>
 * </Cart>
 * ```
 */
export interface CartTotalTotalProps
  extends React.ComponentPropsWithoutRef<typeof CartPrimitive.Totals.Total>,
    VariantProps<typeof cartTotalVariants> {}

export const CartTotalsTotal = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Totals.Total>,
  CartTotalTotalProps
>(({ variant = 'total', size, className, ...props }, ref) => {
  return (
    <CartPrimitive.Totals.Total
      {...props}
      ref={ref}
      className={cn(cartTotalVariants({ variant, size }), className)}
    >
      {props.children}
    </CartPrimitive.Totals.Total>
  );
});

CartTotalsTotal.displayName = 'CartTotalsTotal';

// Cart Summary Component
/**
 * Displays a summary of cart contents (e.g., "3 items in cart").
 * Provides a quick overview of cart status and can use render props.
 *
 * @component
 * @example
 * ```tsx
 * <CartSummary>
 *   {({ subtotal, totalItems }) => (
 *     <>
 *       {totalItems > 0 ? (
 *         <div className="bg-surface-card rounded-xl p-6 border border-brand-subtle">
 *           <div className="flex justify-between items-center mb-4">
 *             <h3 className="text-xl font-semibold text-content-primary">
 *               Cart Summary
 *             </h3>
 *             <span className="text-content-secondary text-sm">
 *               {totalItems} {totalItems === 1 ? 'item' : 'items'}
 *             </span>
 *           </div>
 *         </div>
 *       ) : (
 *         <div className="text-center py-8">
 *           <p className="text-content-muted">Your cart is empty</p>
 *         </div>
 *       )}
 *     </>
 *   )}
 * </CartSummary>
 * ```
 */
export const CartSummary = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Summary>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Summary>
>((props, ref) => {
  return (
    <CartPrimitive.Summary
      {...props}
      ref={ref}
      className={cn('text-content-secondary', props.className)}
      labels={{
        subtotal: 'Subtotal ({totalItems} items)',
        total: 'Total',
        calculating: 'Calculating...',
        ...props.labels,
      }}
    >
      {props.children}
    </CartPrimitive.Summary>
  );
});

CartSummary.displayName = 'CartSummary';

// Cart LineItems Component
/**
 * Container for all cart line items.
 * Wraps the line item repeater and individual line item components.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <CartLineItems className="space-y-4 mb-6">
 *     <CartLineItemRepeater>
 *       <LineItem>
 *         <div className="flex items-center gap-4">
 *           <LineItemImage size="lg" />
 *           <div className="flex-1">
 *             <LineItemTitle />
 *             <LineItemSelectedOptions>
 *               <LineItemSelectedOptionRepeater>
 *                 <SelectedOption>
 *                   <SelectedOptionText />
 *                 </SelectedOption>
 *               </LineItemSelectedOptionRepeater>
 *             </LineItemSelectedOptions>
 *           </div>
 *         </div>
 *       </LineItem>
 *     </CartLineItemRepeater>
 *   </CartLineItems>
 * </Cart>
 * ```
 */
export const CartLineItems = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.LineItems>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.LineItems>
>((props, ref) => {
  return (
    <CartPrimitive.LineItems {...props} ref={ref}>
      {props.children}
    </CartPrimitive.LineItems>
  );
});

CartLineItems.displayName = 'CartLineItems';

// Cart LineItem Repeater Component
export const CartLineItemRepeater = CartPrimitive.LineItemRepeater;
/**
 * Repeater component that renders each line item in the cart.
 * Automatically iterates through all items in the cart.
 *
 * @component
 * @example
 * ```tsx
 * <CartLineItems>
 *   <CartLineItemRepeater>
 *     <LineItem>
 *       <div className="flex items-center gap-4 p-4">
 *         <LineItemImage size="lg" />
 *         <div className="flex-1">
 *           <LineItemTitle />
 *           <LineItemSelectedOptions>
 *             <LineItemSelectedOptionRepeater>
 *               <SelectedOption>
 *                 <SelectedOptionText />
 *               </SelectedOption>
 *             </LineItemSelectedOptionRepeater>
 *           </LineItemSelectedOptions>
 *         </div>
 *       </div>
 *     </LineItem>
 *   </CartLineItemRepeater>
 * </CartLineItems>
 * ```
 */
CartLineItemRepeater.displayName = 'CartLineItemRepeater';

// Cart Clear Component
/**
 * Button to clear all items from the cart.
 * Provides confirmation and handles cart clearing automatically.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="flex justify-between items-center mb-4">
 *     <h2>Shopping Cart</h2>
 *     <CartClear
 *       className="text-red-600 hover:text-red-700"
 *       labels={{
 *         clearing: 'Clearing cart...',
 *         clear: 'Clear all {totalItems} items'
 *       }}
 *     />
 *   </div>
 *   <CartLineItems>
 *     <CartLineItemRepeater>
 *       <LineItem />
 *     </CartLineItemRepeater>
 *   </CartLineItems>
 * </Cart>
 * ```
 */
export const CartClear = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Clear>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Clear>
>((props, ref) => {
  return (
    <CartPrimitive.Clear
      {...props}
      ref={ref}
      className={cn(
        'text-status-error hover:text-status-error/80 text-sm font-medium transition-colors duration-200 disabled:opacity-50',
        props.className
      )}
      labels={{
        clearing: 'Clearing...',
        clear: 'Clear Cart ({totalItems})',
        ...props.labels,
      }}
    >
      {props.children}
    </CartPrimitive.Clear>
  );
});

CartClear.displayName = 'CartClear';

// Cart Notes Component
export const CartNotes = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Notes>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Notes>
>((props, ref) => {
  return (
    <CartPrimitive.Notes
      {...props}
      ref={ref}
      className={cn(
        '[&_textarea]:focus:border-surface-interactive [&_textarea]:focus:ring-0 [&_textarea]:focus:outline-none',
        props.className
      )}
    >
      {props.children}
    </CartPrimitive.Notes>
  );
});

/**
 * Component for adding special instructions or notes to the cart.
 * Allows customers to add delivery instructions or special requests.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="mt-4">
 *     <h3 className="font-medium mb-2">Special Instructions</h3>
 *     <CartNotes className="w-full">
 *       <textarea
 *         placeholder="Add delivery instructions..."
 *         className="w-full p-3 border rounded-lg"
 *       />
 *     </CartNotes>
 *   </div>
 * </Cart>
 * ```
 */
CartNotes.displayName = 'CartNotes';

/**
 * Root component for coupon/promo code functionality.
 * Provides context for coupon input, trigger, and clear actions.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <CartCoupon>
 *     <div className="flex gap-2">
 *       <CartCouponInput placeholder="Enter promo code" />
 *       <CartCouponTrigger>Apply</CartCouponTrigger>
 *     </div>
 *     <CartCouponClear>Remove coupon</CartCouponClear>
 *   </CartCoupon>
 * </Cart>
 * ```
 */
export const CartCoupon = CartPrimitive.Coupon.Root;
CartCoupon.displayName = 'CartCoupon';

/**
 * Input field for entering coupon/promo codes.
 * Must be used within a CartCoupon component.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <CartCoupon>
 *     <div className="flex gap-2 mt-4">
 *       <CartCouponInput
 *         placeholder="Enter promo code"
 *         className="flex-1"
 *       />
 *       <CartCouponTrigger className="px-4 py-2 bg-blue-600 text-white rounded">
 *         Apply
 *       </CartCouponTrigger>
 *     </div>
 *   </CartCoupon>
 * </Cart>
 * ```
 */
export const CartCouponInput = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Coupon.Input>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Coupon.Input>
>((props, ref) => {
  return (
    <CartPrimitive.Coupon.Input
      {...props}
      ref={ref}
      className={cn(
        'w-full px-3 py-2 bg-surface-interactive border border-surface-interactive rounded-lg text-content-primary placeholder:text-content-muted focus:border-surface-interactive focus:ring-0 focus:outline-none transition-colors duration-200',
        props.className
      )}
    >
      {props.children}
    </CartPrimitive.Coupon.Input>
  );
});

CartCouponInput.displayName = 'CartCouponInput';

/**
 * Button to apply the entered coupon code.
 * Handles coupon validation and application automatically.
 *
 * @component
 * @example
 * ```tsx
 * <CartCoupon>
 *   <div className="border rounded-lg p-4">
 *     <h3 className="font-medium mb-2">Have a promo code?</h3>
 *     <div className="flex gap-2">
 *       <CartCouponInput placeholder="Enter code" />
 *       <CartCouponTrigger>
 *         Apply Code
 *       </CartCouponTrigger>
 *     </div>
 *   </div>
 * </CartCoupon>
 * ```
 */
export const CartCouponTrigger = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Coupon.Trigger>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Coupon.Trigger>
>((props, ref) => {
  return (
    <CartPrimitive.Coupon.Trigger
      {...props}
      ref={ref}
      className={cn(
        'w-full text-content-primary font-medium py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-center text-sm btn-primary',
        props.className
      )}
    >
      {props.children}
    </CartPrimitive.Coupon.Trigger>
  );
});

CartCouponTrigger.displayName = 'CartCouponTrigger';

/**
 * Button to remove/clear applied coupon codes.
 * Only shows when a coupon is currently applied to the cart.
 *
 * @component
 * @example
 * ```tsx
 * <CartCoupon>
 *   <div className="space-y-2">
 *     <div className="flex gap-2">
 *       <CartCouponInput />
 *       <CartCouponTrigger>Apply</CartCouponTrigger>
 *     </div>
 *     <CartCouponClear className="text-sm text-red-600 hover:text-red-700">
 *       Remove coupon
 *     </CartCouponClear>
 *   </div>
 * </CartCoupon>
 * ```
 */
export const CartCouponClear = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Coupon.Clear>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Coupon.Clear>
>((props, ref) => {
  return (
    <CartPrimitive.Coupon.Clear
      {...props}
      ref={ref}
      className={cn(
        'text-status-error hover:text-status-error/80 text-sm',
        props.className
      )}
    >
      {props.children}
    </CartPrimitive.Coupon.Clear>
  );
});

CartCouponClear.displayName = 'CartCouponClear';

/**
 * Raw component that provides direct access to coupon data.
 * Useful for custom coupon display or accessing coupon properties.
 *
 * @component
 * @example
 * ```tsx
 * <CartCoupon>
 *   <CartCouponRaw>
 *     {({ coupon, isApplied }) => (
 *       <div>
 *         {isApplied && (
 *           <div className="bg-green-100 p-2 rounded">
 *             Coupon {coupon?.code} applied!
 *           </div>
 *         )}
 *       </div>
 *     )}
 *   </CartCouponRaw>
 * </CartCoupon>
 * ```
 */
export const CartCouponRaw = CartPrimitive.Coupon.Raw;
CartCouponRaw.displayName = 'CartCouponRaw';

// Cart Errors Component
export const CartErrors = React.forwardRef<
  React.ElementRef<typeof CartPrimitive.Errors>,
  React.ComponentPropsWithoutRef<typeof CartPrimitive.Errors>
>((props, ref) => {
  return (
    <CartPrimitive.Errors
      {...props}
      ref={ref}
      className={cn(
        'w-full bg-surface-error border border-status-error rounded-lg p-3 text-status-error text-xs',
        props.className
      )}
    >
      {props.children}
    </CartPrimitive.Errors>
  );
});

/**
 * Displays cart-related errors and validation messages.
 * Shows errors like inventory issues, shipping problems, or payment errors.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <CartErrors className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
 *     {({ errors }) => (
 *       <div>
 *         <h4 className="font-medium mb-2">Cart Errors:</h4>
 *         <ul className="list-disc list-inside space-y-1">
 *           {errors.map((error, index) => (
 *             <li key={index}>{error.message}</li>
 *           ))}
 *         </ul>
 *       </div>
 *     )}
 *   </CartErrors>
 * </Cart>
 * ```
 */
CartErrors.displayName = 'CartErrors';

/**
 * Component that detects when items are added to the cart.
 * Provides callbacks for handling add-to-cart events and notifications.
 *
 * @component
 * @example
 * ```tsx
 * <CartLineItemAdded>
 *   {({ onAddedToCart }) => {
 *     useEffect(() => {
 *       return onAddedToCart((lineItems) => {
 *         if (lineItems && lineItems.length > 0) {
 *           showNotification('Item added to cart!');
 *         }
 *       });
 *     }, []);
 *     return null;
 *   }}
 * </CartLineItemAdded>
 * ```
 */
export const CartLineItemAdded = CartPrimitive.LineItemAdded;
