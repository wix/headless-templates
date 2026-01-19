import { useEffect, useState } from 'react';
import { productsV3 } from '@wix/stores';

import ProductDetails from './ProductDetails';
import { useNavigation } from '../NavigationContext';

import { CartLineItemAdded } from '@/components/ui/ecom/Cart';
import type { LineItem } from '@wix/ecom/services';

interface QuickViewModalProps {
  product: productsV3.V3Product;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  productPageRoute: string;
}

export default function QuickViewModal({
  product,
  isOpen,
  isLoading,
  onClose,
  productPageRoute,
}: QuickViewModalProps) {
  const Navigation = useNavigation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-status-success-medium backdrop-blur-sm text-content-primary px-6 py-3 rounded-xl shadow-lg border border-status-success animate-pulse">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Added to cart successfully!
          </div>
        </div>
      )}

      <CartLineItemAdded>
        {({ onAddedToCart }) => {
          useEffect(() => {
            return onAddedToCart((lineItems: LineItem[] | undefined) => {
              if (!lineItems) return;
              const myLineItemIsThere = lineItems.some(
                lineItem =>
                  lineItem.catalogReference?.catalogItemId === product._id
              );
              if (!myLineItemIsThere) return;

              setShowSuccessMessage(true);
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 3000);
            });
          }, [onAddedToCart]);

          return null;
        }}
      </CartLineItemAdded>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl mx-4 max-h-[90vh] bg-surface-modal rounded-2xl border border-brand-subtle shadow-2xl animate-[slideUp_0.3s_ease-out] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-surface-primary backdrop-blur-sm rounded-full border border-brand-light hover:bg-surface-hover transition-colors group"
        >
          <svg
            className="w-5 h-5 text-content-secondary group-hover:text-content-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {isLoading ? (
            // Loading state while fetching full product data
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-content-secondary">
                  Loading product details...
                </p>
              </div>
            </div>
          ) : (
            <>
              <ProductDetails isQuickView={true} product={product!} />

              {/* View Full Product Page Link */}
              <div className="mt-6 pt-6 border-t border-brand-subtle">
                <Navigation
                  route={`${productPageRoute}/${product.slug}`}
                  className="w-full text-content-primary font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 btn-primary"
                >
                  View Full Product Page
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Navigation>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
