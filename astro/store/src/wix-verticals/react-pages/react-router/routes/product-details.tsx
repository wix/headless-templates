import { useLoaderData, useParams } from 'react-router';
import { loadProductServiceConfig, ProductService } from '@wix/stores/services';
import type { ServiceFactoryConfig } from '@wix/services-definitions';
import ProductDetailPage from '../../store/main-components/productDetailsPage';
import { SEO } from '@wix/seo/components';
import { seoTags } from '@wix/seo';
import { useEffect } from 'react';

export async function productRouteLoader({
  params,
  request,
}: {
  params: { slug?: string };
  request: Request;
}): Promise<{
  productServiceConfig: ServiceFactoryConfig<typeof ProductService>;
}> {
  if (!params.slug) {
    throw new Error('Product slug is required');
  }

  const productServiceConfigResult = await loadProductServiceConfig(
    params.slug
  );

  if (productServiceConfigResult.type === 'notFound') {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    productServiceConfig: productServiceConfigResult.config,
  };
}

export function ProductDetailsRoute() {
  const { productServiceConfig } = useLoaderData<typeof productRouteLoader>();
  const { slug } = useParams();

  return (
    <SEO.UpdateTagsTrigger>
      {({ updateSeoTags }) => {
        // Update SEO tags on client-side navigation (SPA transitions)
        // This is for client-side navigation only; SSR handles initial load
        useEffect(() => {
          if (slug && typeof window !== 'undefined') {
            updateSeoTags(seoTags.ItemType.STORES_PRODUCT, { slug });
          }
        }, [slug, updateSeoTags]);

        return (
          <div className="wix-verticals-container">
            <ProductDetailPage productServiceConfig={productServiceConfig} />
          </div>
        );
      }}
    </SEO.UpdateTagsTrigger>
  );
}
