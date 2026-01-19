import React from 'react';
import {
  ProductActionAddToCart,
  ProductActionBuyNow,
  ProductActionPreOrder,
} from '@/components/ui/store/Product';

interface ProductActionButtonsProps {
  showBuyNow?: boolean;
}

// Main Product Action Buttons Container
export const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  showBuyNow = false,
}) => {
  return (
    <div className="flex gap-3 w-full">
      <ProductActionAddToCart
        label="Add to Cart"
        loadingState={
          <>
            <span className="opacity-0">Add to Cart</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </>
        }
      />
      {showBuyNow && (
        <ProductActionBuyNow
          label="Buy Now"
          loadingState={
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          }
        />
      )}
      <ProductActionPreOrder
        label="Pre Order"
        loadingState={
          <>
            <span className="opacity-0">Pre Order</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </>
        }
      />
    </div>
  );
};

export default ProductActionButtons;
