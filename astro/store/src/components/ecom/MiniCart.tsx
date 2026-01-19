import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  QuantityDecrement,
  QuantityInput,
  QuantityIncrement,
  QuantityReset,
} from '@/components/ui/components/quantity';
import { CommerceActionsCheckout } from '@/components/ui/ecom/Commerce';
import {
  CartSummary,
  CartLineItems,
  CartLineItemRepeater,
  CartNotes,
  CartCoupon,
  CartCouponRaw,
  CartErrors,
  CartTotalsPrice,
  CartTotalsDiscount,
  CartTotalsShipping,
  CartTotalsTax,
  CartTotalsTotal,
} from '@/components/ui/ecom/Cart';
import {
  LineItemImage,
  LineItemTitle,
  LineItemSelectedOptions,
  LineItemSelectedOptionRepeater,
  LineItemQuantity,
} from '@/components/ui/ecom/LineItem';
import {
  SelectedOptionText,
  SelectedOptionColor,
} from '@/components/ui/ecom/SelectedOption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  useMiniCartContext,
  MINI_CART_PORTAL_ID,
} from '../MiniCartContextProvider';

// Mini coupon form for the cart sidebar
const CouponFormMini = ({
  apply,
  remove,
  isLoading,
  appliedCoupon,
}: {
  apply: (code: string) => void;
  remove: () => void;
  isLoading: boolean;
  appliedCoupon: string | null;
}) => {
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-2 bg-status-success-light border border-status-success rounded">
        <span className="text-status-success text-xs font-medium">
          Coupon: {appliedCoupon}
        </span>
        <Button
          onClick={remove}
          disabled={isLoading}
          variant="link"
          size="sm"
          className="text-status-danger hover:text-status-error text-xs h-auto p-0"
        >
          {isLoading ? 'Removing...' : 'Remove'}
        </Button>
      </div>
    );
  }

  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      apply(code.trim());
      setCode('');
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="link"
        size="sm"
        className="text-accent hover:text-brand-light text-xs font-medium h-auto p-0"
      >
        Have a promo code?
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1">
        <Input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Promo code"
          className="flex-1 px-2 py-1 text-xs bg-surface-interactive border border-surface-interactive rounded text-content-primary placeholder:text-content-muted focus:border-brand-light focus:outline-none"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!code.trim() || isLoading}
          variant="secondary"
          size="sm"
          className="px-2 py-1 text-xs font-medium h-auto"
        >
          {isLoading ? '...' : 'Apply Coupon'}
        </Button>
      </div>

      <Button
        type="button"
        onClick={() => setIsExpanded(false)}
        variant="link"
        size="sm"
        className="text-content-muted hover:text-content-secondary text-xs h-auto p-0"
      >
        Cancel
      </Button>
    </form>
  );
};

const DefaultMiniCartIcon = () => (
  <div className="text-content-primary ">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12"
      />
    </svg>
  </div>
);

export function MiniCartIcon({
  Icon = DefaultMiniCartIcon,
  className,
}: { Icon?: React.ComponentType; className?: string } = {}) {
  const { open } = useMiniCartContext();
  return (
    <>
      {/* Cart Icon */}
      <div className={className}>
        <CartSummary asChild>
          {({ totalItems }) => (
            <Button
              data-testid="mini-cart-icon"
              onClick={open}
              variant="link"
              size="icon"
              className="relative [&_svg]:pointer-events-none [&_svg]:size-6"
            >
              <Icon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-medium text-content-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          )}
        </CartSummary>
      </div>
    </>
  );
}

export function MiniCartContent() {
  const { close, isOpen } = useMiniCartContext();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  // Don't render anything if not open
  if (!isOpen) return null;

  // Create portal target if it doesn't exist
  const getPortalTarget = () => {
    let portalTarget = document.getElementById(MINI_CART_PORTAL_ID);
    if (!portalTarget) {
      portalTarget = document.createElement('div');
      portalTarget.id = MINI_CART_PORTAL_ID;
      document.body.appendChild(portalTarget);
    }
    return portalTarget;
  };

  // Only render portal on client side
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-modal shadow-xl flex flex-col bg-background"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-subtle flex-shrink-0">
          <CartSummary asChild>
            {({ totalItems }) => (
              <h2 className="text-xl font-bold text-content-primary">
                Shopping Cart ({totalItems})
              </h2>
            )}
          </CartSummary>

          <Button
            onClick={close}
            variant="ghost"
            size="icon"
            className="text-content-primary hover:text-brand-light transition-colors"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <CartLineItems
            emptyState={
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface-interactive rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-content-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-content-muted">Your cart is empty</p>
              </div>
            }
          >
            <CartLineItemRepeater>
              <Card className="border-brand-light">
                <CardContent className="flex gap-4 p-4">
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
                        <div className="flex items-center border border-brand-light rounded-lg bg-surface-primary">
                          <QuantityDecrement />
                          <QuantityInput disabled={true} />
                          <QuantityIncrement />
                        </div>
                        <QuantityReset>Remove</QuantityReset>
                      </div>
                    </LineItemQuantity>
                  </div>
                </CardContent>
              </Card>
            </CartLineItemRepeater>
          </CartLineItems>
        </div>

        <div className="border-t border-surface-subtle p-6 flex-shrink-0">
          <div className="mb-4">
            <Label className="text-content-secondary text-sm mb-2 block">
              Notes:
            </Label>
            <CartNotes asChild>
              <Textarea
                placeholder="Special instructions for your order (e.g., gift wrap, delivery notes)"
                rows={2}
                className="resize-vertical bg-surface-interactive border border-surface-interactive text-content-primary placeholder:text-content-muted focus:border-brand-primary"
              />
            </CartNotes>
          </div>

          {/* Coupon Code */}
          <div className="mb-4">
            <CartCoupon>
              <CartCouponRaw asChild>
                {({ apply, isLoading, appliedCoupon, remove }) => (
                  <CouponFormMini
                    apply={apply}
                    isLoading={isLoading}
                    remove={remove}
                    appliedCoupon={appliedCoupon}
                  />
                )}
              </CartCouponRaw>
            </CartCoupon>
          </div>
          <CartErrors />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-content-secondary">
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

            <div className="border-t border-surface-interactive pt-2">
              <CartTotalsTotal label="Total" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <CommerceActionsCheckout asChild>
            <Button className="w-full font-semibold py-3 px-6" size="lg">
              Proceed to Checkout
            </Button>
          </CommerceActionsCheckout>
        </div>
      </div>
    </div>,
    getPortalTarget()
  );
}
