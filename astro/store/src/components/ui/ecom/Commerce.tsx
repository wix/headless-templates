import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Commerce as CommercePrimitive } from '@wix/ecom/components';

/**
 * Root commerce provider that enables e-commerce functionality.
 * Provides context for cart operations, checkout flows, and commerce actions.
 *
 * @component
 * @example
 * ```tsx
 * <Commerce>
 *   <div className="min-h-screen">
 *     <Header />
 *     <main>
 *       <ProductList />
 *       <Cart />
 *     </main>
 *     <Footer />
 *   </div>
 * </Commerce>
 * ```
 */
export const Commerce = CommercePrimitive;

// Commerce Actions Checkout Component
const commerceCheckoutVariants = cva(
  'font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'btn-primary text-content-primary',
        primary: 'btn-primary text-content-primary',
        secondary:
          'bg-surface-secondary text-content-primary hover:bg-surface-secondary/90',
      },
      size: {
        default: 'py-4 px-6 rounded-xl',
        sm: 'py-2 px-4 rounded-lg text-sm',
        lg: 'py-4 px-6 rounded-xl text-lg',
        xl: 'py-6 px-8 rounded-2xl text-xl',
      },
      width: {
        default: '',
        full: 'w-full',
      },
      animation: {
        default: '',
        scale: 'transform hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      width: 'full',
      animation: 'scale',
    },
  }
);

export interface CommerceCheckoutProps
  extends React.ComponentPropsWithoutRef<
      typeof CommercePrimitive.Actions.Checkout
    >,
    VariantProps<typeof commerceCheckoutVariants> {}

/**
 * Checkout button that initiates the checkout process.
 * Handles cart validation and redirects to the checkout flow.
 *
 * @component
 * @example
 * ```tsx
 * <Cart>
 *   <div className="border-t pt-4 mt-4">
 *     <div className="flex justify-between items-center mb-4">
 *       <span className="text-lg font-semibold">Total:</span>
 *       <CartTotalsTotal />
 *     </div>
 *     <CommerceActionsCheckout
 *       variant="primary"
 *       size="lg"
 *       width="full"
 *       animation="scale"
 *       className="font-semibold"
 *     >
 *       Proceed to Checkout
 *     </CommerceActionsCheckout>
 *   </div>
 * </Cart>
 * ```
 */
export const CommerceActionsCheckout = React.forwardRef<
  React.ElementRef<typeof CommercePrimitive.Actions.Checkout>,
  CommerceCheckoutProps
>(({ variant, size, width, animation, className, ...props }, ref) => {
  return (
    <CommercePrimitive.Actions.Checkout
      {...props}
      ref={ref}
      className={cn(
        commerceCheckoutVariants({ variant, size, width, animation }),
        className
      )}
    >
      {props.children}
    </CommercePrimitive.Actions.Checkout>
  );
});

CommerceActionsCheckout.displayName = 'CommerceActionsCheckout';

// Commerce Actions namespace for better organization
export const CommerceActions = {
  Checkout: CommerceActionsCheckout,
};
