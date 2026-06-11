import {
  QuantityDecrement,
  QuantityInput,
  QuantityIncrement,
  QuantityReset,
} from '@/components/ui/components/quantity';
import {
  CartTotalsPrice,
  CartTotalsDiscount,
  CartTotalsShipping,
  CartTotalsTax,
  CartTotalsTotal,
  CartSummary,
  CartLineItems,
  CartLineItemRepeater,
  CartClear,
  CartNotes,
  CartCoupon,
  CartCouponInput,
  CartCouponTrigger,
  CartCouponClear,
  CartErrors,
} from '@/components/ui/ecom/Cart';
import {
  LineItemImage,
  LineItemTitle,
  LineItemSelectedOptions,
  LineItemSelectedOptionRepeater,
  LineItemQuantity,
} from '@/components/ui/ecom/LineItem';
import { Label } from '@/components/ui/label';

import { CommerceActionsCheckout } from '@/components/ui/ecom/Commerce';
import {
  SelectedOptionText,
  SelectedOptionColor,
} from '@/components/ui/ecom/SelectedOption';
import { useNavigation } from '../NavigationContext';
import { Button } from '@/components/ui/button';

export default function CartContent() {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-content-primary mb-4">
          Shopping Cart
        </h1>
        <CartSummary asChild>
          {({ totalItems }, ref) => (
            <p
              ref={ref as React.Ref<HTMLParagraphElement>}
              className="text-content-secondary text-xl"
            >
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </CartSummary>
      </div>

      {/* Cart with Items */}
      <CartLineItems emptyState={emptyCartState}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-surface-primary backdrop-blur-sm rounded-xl border border-surface-subtle p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-content-primary">
                  Cart Items
                </h2>
                <CartClear />
              </div>

              <div className="space-y-6">
                <CartLineItemRepeater>
                  <div className="flex gap-4 p-4 border border-brand-light rounded-lg">
                    <LineItemImage />
                    <div className="flex-1 space-y-2">
                      <LineItemTitle />
                      <LineItemSelectedOptions>
                        <div className="flex flex-wrap gap-2">
                          <LineItemSelectedOptionRepeater>
                            <SelectedOptionText />
                            <SelectedOptionColor />
                          </LineItemSelectedOptionRepeater>
                        </div>
                      </LineItemSelectedOptions>

                      {/* Quantity Controls */}
                      <LineItemQuantity steps={1}>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center border border-brand-light rounded-lg">
                            <QuantityDecrement />
                            <QuantityInput disabled={true} />
                            <QuantityIncrement />
                          </div>
                          <QuantityReset>Remove</QuantityReset>
                        </div>
                      </LineItemQuantity>
                    </div>
                  </div>
                </CartLineItemRepeater>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface-primary backdrop-blur-sm rounded-xl border border-surface-subtle p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-content-primary mb-6">
                Order Summary
              </h2>

              {/* Order Notes */}
              <div className="mb-6">
                <CartNotes />
              </div>

              {/* Coupon Section */}
              <>
                <Label className="block text-sm font-medium text-content-primary mb-2">
                  Coupon Code:
                </Label>
                <CartCoupon>
                  <div className="space-y-2 mb-6">
                    <CartCouponInput placeholder="Enter coupon code" />
                    <CartCouponTrigger>Apply Coupon</CartCouponTrigger>
                    <CartCouponClear>Remove</CartCouponClear>
                  </div>
                </CartCoupon>
              </>

              <div className="w-full space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg text-content-primary">
                    <CartSummary asChild>
                      {({ totalItems }) => (
                        <span>
                          Subtotal ({totalItems}{' '}
                          {totalItems === 1 ? 'item' : 'items'})
                        </span>
                      )}
                    </CartSummary>

                    <CartTotalsPrice />
                  </div>
                  <CartTotalsDiscount label="Discount" />
                  <CartTotalsShipping label="Shipping" />
                  <CartTotalsTax label="Tax" />
                </div>

                <div className="border-t border-surface-interactive pt-4">
                  <CartTotalsTotal label="Total" />
                </div>
                <CartErrors />

                <CommerceActionsCheckout
                  label="Proceed to Checkout"
                  loadingState="Processing..."
                />

                <div className="text-center pt-4">
                  <a
                    href="/"
                    className="text-brand-primary hover:text-brand-light font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CartLineItems>
    </>
  );
}

const emptyCartState = () => {
  const Navigation = useNavigation();

  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8">
        <svg
          className="w-16 h-16 text-content-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h9M7 13l-1.5 6m0 0h9m-9 0a1 1 0 100 2 1 1 0 000-2zm9 0a1 1 0 100 2 1 1 0 000-2z"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-content-primary mb-4">
        Your cart is empty
      </h2>
      <p className="text-content-light text-lg mb-8">
        Start shopping to add items to your cart
      </p>
      <Navigation route="/store">
        <Button size="lg" className="p-6 text-md">
          Continue Shopping
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </Navigation>
    </div>
  );
};
