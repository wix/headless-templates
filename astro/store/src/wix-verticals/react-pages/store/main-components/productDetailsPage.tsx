import ProductDetails from '@/components/store/ProductDetails';

interface ProductDetailPageProps {
  productServiceConfig?: any;
}

function ProductDetailsPage({ productServiceConfig }: ProductDetailPageProps) {
  return <ProductDetails product={productServiceConfig.product} />;
}

export default ProductDetailsPage;
