import { useLoaderData } from 'react-router';
import { useEffect, useState, type ReactNode } from 'react';

import { loadCurrentCartServiceConfig } from '@wix/ecom/services';
import { loadSEOTagsServiceConfig } from '@wix/seo/services';
import { MiniCartContent, MiniCartIcon } from '@/components/ecom/MiniCart';
import { CurrentCart } from '@/components/ui/ecom/CurrentCart';
import { CartLineItemAdded } from '@/components/ui/ecom/Cart';
import {
  NavigationProvider,
  type NavigationComponent,
} from '@/components/NavigationContext';
import { Link } from 'react-router';
import '@wix/wix-vibe-plugins/plugins-vars.css';
import {
  MiniCartContextProvider,
  useMiniCartContext,
} from '@/components/MiniCartContextProvider';
import { Commerce } from '@/components/ui/ecom/Commerce';
import { SEO } from '@wix/seo/components';

const ReactRouterNavigationComponent: NavigationComponent = ({
  route,
  children,
  ...props
}) => {
  return (
    <Link to={route} {...props}>
      {children}
    </Link>
  );
};

export async function rootRouteLoader({ request }: { request: Request }) {
  try {
    const [currentCartServiceConfig, seoTagsServiceConfig] = await Promise.all([
      loadCurrentCartServiceConfig(),
      loadSEOTagsServiceConfig({
        pageUrl: request.url,
      }),
    ]);

    return {
      currentCartServiceConfig,
      seoTagsServiceConfig,
    };
  } catch (error) {
    console.error('Error loading root route services:', error);
    // Return minimal valid configs as fallback
    return {
      currentCartServiceConfig: {},
      seoTagsServiceConfig: {
        tags: [],
      },
    };
  }
}

export function WixServicesProvider(props: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof rootRouteLoader>();
  
  // Provide default values if loader data is not available
  const currentCartServiceConfig = loaderData?.currentCartServiceConfig || {};
  const seoTagsServiceConfig = loaderData?.seoTagsServiceConfig || { tags: [] };

  return (
    <div data-testid="main-container">
      <SEO.Root seoTagsServiceConfig={seoTagsServiceConfig}>
        <MiniCartContextProvider>
          <Commerce.Root checkoutServiceConfig={{}}>
            <CurrentCart currentCartServiceConfig={currentCartServiceConfig}>
              <NavigationProvider
                navigationComponent={ReactRouterNavigationComponent}
              >
                {props.children}
              </NavigationProvider>
            </CurrentCart>
          </Commerce.Root>
        </MiniCartContextProvider>
      </SEO.Root>
    </div>
  );
}

export function MiniCart({
  cartIcon,
  cartIconClassName,
  children,
}: {
  cartIcon?: React.ComponentType;
  cartIconClassName?: string;
  children?: ReactNode;
}) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const loaderData = useLoaderData<typeof rootRouteLoader>();
  const currentCartServiceConfig = loaderData?.currentCartServiceConfig || {};

  return (
    <>
      <MiniCartIcon Icon={cartIcon} className={cartIconClassName} />

      <CurrentCart currentCartServiceConfig={currentCartServiceConfig}>
        <StoreLayoutContent
          children={children}
          showSuccessMessage={showSuccessMessage}
          setShowSuccessMessage={setShowSuccessMessage}
        />
      </CurrentCart>
      <MiniCartContent />
    </>
  );
}

function StoreLayoutContent({
  children,
  showSuccessMessage,
  setShowSuccessMessage,
}: {
  children: ReactNode;
  showSuccessMessage: boolean;
  setShowSuccessMessage: (show: boolean) => void;
}) {
  const { open } = useMiniCartContext();
  return (
    <>
      <CartLineItemAdded>
        {({ onAddedToCart }) => {
          useEffect(
            () =>
              onAddedToCart(() => {
                setShowSuccessMessage(true);
                setTimeout(() => {
                  setShowSuccessMessage(false);
                  open();
                }, 3000);
              }),
            [onAddedToCart]
          );

          return null;
        }}
      </CartLineItemAdded>

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

      {/* Main Content */}
      {children}
    </>
  );
}
