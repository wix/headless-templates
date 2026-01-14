import ProductList from '@/components/store/ProductList';

import {
  type CategoriesListServiceConfig,
  type ProductsListServiceConfig,
} from '@wix/stores/services';

interface StoreCollectionPageProps {
  productsListConfig: ProductsListServiceConfig;
  categoriesListConfig: CategoriesListServiceConfig;
  currentCategorySlug: string;
  productPageRoute: string;
}

function CategoryPage({
  productsListConfig,
  categoriesListConfig,
  currentCategorySlug,
  productPageRoute,
}: StoreCollectionPageProps) {
  return (
    <ProductList
      productPageRoute={productPageRoute}
      productsListConfig={productsListConfig}
      categoriesListConfig={categoriesListConfig}
      currentCategorySlug={currentCategorySlug}
    />
  );
}

export default CategoryPage;
