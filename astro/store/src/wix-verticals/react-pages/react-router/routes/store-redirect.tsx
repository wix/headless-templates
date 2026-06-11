import { redirect } from 'react-router';
import { loadCategoriesListServiceConfig } from '@wix/stores/services';

export async function defaultStoreCollectionRouteRedirectLoader() {
  const [categoriesConfig] = await Promise.all([
    loadCategoriesListServiceConfig(),
  ]);

  const selectedCategory = categoriesConfig.categories[0];
  return redirect(`/store/${selectedCategory.slug}`);
}
