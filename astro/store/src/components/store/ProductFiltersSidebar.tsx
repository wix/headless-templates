import React, { useState } from 'react';
import { ProductList } from '@wix/stores/components';
import * as Filter from '@/components/ui/store/Filter';

interface ProductFiltersSidebarProps {
  className?: string;
}

// Enhanced Filter components integrated with real ProductList filtering
export const ProductFiltersSidebar: React.FC<ProductFiltersSidebarProps> = ({
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full lg:w-80 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-6">
        <div className="relative">
          <div
            className={`bg-surface-primary backdrop-blur-sm rounded-xl p-6 border border-brand-subtle ${className}`}
          >
            <ProductList.Filter.Root>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-content-primary flex items-center gap-2">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </h3>
                <div className="flex items-center gap-2">
                  {/* Clean component - no render props! */}
                  <Filter.Action.Clear label="Clear All" />

                  {/* Mobile toggle */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="lg:hidden text-content-muted hover:text-content-primary transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter Content - Consolidated All Filters */}
              <div
                className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}
              >
                <Filter.FilterOptions>
                  <Filter.FilterOptionRepeater>
                    <Filter.FilterOption.Label />
                    <Filter.FilterOption.MultiFilter />
                    <Filter.FilterOption.RangeFilter />
                  </Filter.FilterOptionRepeater>
                </Filter.FilterOptions>
              </div>
            </ProductList.Filter.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFiltersSidebar;
