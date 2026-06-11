import { useLoaderData, redirect, Await, useParams } from 'react-router';
import React, { useEffect } from 'react';
import {
  loadCategoriesListServiceConfig,
  parseUrlToSearchOptions,
} from '@wix/stores/services';
import { loadProductsListServiceConfig } from '@wix/stores/services';
import CategoryPage from '../../store/main-components/categoryPage';
import { ProductListSkeleton } from '@/components/store/ProductList';
import { Card, CardContent } from '@/components/ui/card';
import { customizationsV3 } from '@wix/stores';
import { SEO } from '@wix/seo/components';
import { seoTags } from '@wix/seo';

// Helper function to create SEO configuration for store categories
function createCategorySeoConfig(categoryName: string, categorySlug?: string) {
  return {
    pageName: categoryName,
    slug: categorySlug,
    seoData: {
      tags: [
        {
          type: 'title' as const,
          children: `${categoryName} - Store`,
        },
        {
          type: 'meta' as const,
          props: {
            content: `Browse our ${categoryName} products`,
            name: 'description',
          },
        },
      ],
    },
  };
}
// Skeleton component for product collection loading
function CollectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category skeleton */}
      <Card className="overflow-hidden relative bg-surface-card border-surface-subtle mb-6 p-4">
        <CardContent className="p-0">
          <div className="h-6 w-24 bg-surface-loading rounded animate-pulse mb-4"></div>
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-surface-loading rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-surface-loading rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-stretch">
          <div className="lg:sticky lg:top-6">
            {/* Filters skeleton */}
            <Card className="overflow-hidden relative bg-surface-card border-surface-subtle p-4 lg:h-full h-32">
              <CardContent className="p-0">
                {/* Filters Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-4 h-4 bg-surface-loading rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-surface-loading rounded animate-pulse"></div>
                </div>

                {/* Price Range Section */}
                <div className="mb-6">
                  <div className="h-5 w-20 bg-surface-loading rounded animate-pulse mb-4"></div>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="h-4 w-6 bg-surface-loading rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-surface-loading rounded animate-pulse"></div>
                  </div>
                  <div className="h-2 bg-surface-loading rounded-full animate-pulse mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-10 flex-1 bg-surface-loading rounded animate-pulse"></div>
                    <div className="h-10 flex-1 bg-surface-loading rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Color Section */}
                <div className="mb-6">
                  <div className="h-5 w-10 bg-surface-loading rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-surface-loading rounded-full animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="h-5 w-20 bg-surface-loading rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-surface-loading rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-surface-loading rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Product grid skeleton */}
        <div className="flex-1 min-w-0">
          <ProductListSkeleton />
        </div>
      </div>
    </div>
  );
}

// Error fallback for collection loading
function CollectionError() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="text-status-danger text-2xl mb-4">⚠️</div>
        <h2 className="text-content-primary text-xl mb-2">
          Failed to load products
        </h2>
        <p className="text-content-secondary">Please try refreshing the page</p>
      </div>
    </div>
  );
}

export async function storeCollectionRouteLoader({
  params,
  request,
}: {
  params: { categorySlug?: string };
  request: Request;
}) {
  // Load categories first so we can pass them to parseUrlForProductsListSearch
  const categoriesListConfig = await loadCategoriesListServiceConfig();

  // Find category by its real slug
  let selectedCategory = null;
  if (params.categorySlug) {
    selectedCategory = categoriesListConfig.categories.find(
      (cat: any) => cat.slug === params.categorySlug
    );
  } else {
    selectedCategory = categoriesListConfig.categories[0];
    return redirect(`/store/${selectedCategory.slug}`);
  }

  // If category not found, return 404
  if (!selectedCategory) {
    throw new Response('Not Found', { status: 404 });
  }

  const { items: customizations = [] } = await customizationsV3
    .queryCustomizations()
    .find();

  const parsedSearchOptions = await parseUrlToSearchOptions(
    request.url,
    categoriesListConfig.categories,
    customizations,
    {
      cursorPaging: {
        limit: 20,
      },
      filter: {
        'allCategoriesInfo.categories': {
          $matchItems: [{ _id: selectedCategory._id! }],
        },
      },
    }
  );
  const productListConfigPromise =
    loadProductsListServiceConfig(parsedSearchOptions);
  const productListConfig = import.meta.env.SSR
    ? await productListConfigPromise
    : undefined;

  return {
    productListConfigPromise,
    productListConfig,
    categoriesListConfig,
    currentCategorySlug: params.categorySlug,
  };
}

export function StoreCollectionRoute({
  productPageRoute,
}: {
  productPageRoute: string;
}) {
  const {
    categoriesListConfig,
    productListConfigPromise,
    productListConfig,
    currentCategorySlug,
  } = useLoaderData<typeof storeCollectionRouteLoader>();
  const { categorySlug } = useParams();

  const category = categoriesListConfig.categories.find(
    category => category.slug === currentCategorySlug
  );
  const categoryName = category?.name || '';

  return (
    <SEO.UpdateTagsTrigger>
      {({ updateSeoTags }) => {
        // Update SEO tags on client-side navigation (SPA transitions)
        // This is for client-side navigation only; SSR handles initial load
        useEffect(() => {
          if (categorySlug && typeof window !== 'undefined') {
            updateSeoTags(
              seoTags.ItemType.STORES_CATEGORY,
              createCategorySeoConfig(categoryName, categorySlug)
            );
          }
        }, [categorySlug, updateSeoTags, categoryName]);

        return (
          <div className="wix-verticals-container">
            {/* Collection/products load with skeleton using React Router's Await */}
            <React.Suspense fallback={<CollectionSkeleton />}>
              <Await
                resolve={productListConfig ?? productListConfigPromise}
                errorElement={<CollectionError />}
              >
                {resolvedProductListConfig => {
                  return (
                    <CategoryPage
                      categoriesListConfig={categoriesListConfig}
                      productsListConfig={resolvedProductListConfig}
                      currentCategorySlug={currentCategorySlug}
                      productPageRoute={productPageRoute}
                    />
                  );
                }}
              </Await>
            </React.Suspense>
          </div>
        );
      }}
    </SEO.UpdateTagsTrigger>
  );
}
