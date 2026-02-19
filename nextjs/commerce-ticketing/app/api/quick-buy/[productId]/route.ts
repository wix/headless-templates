import { NextRequest, NextResponse } from 'next/server';
import { getRequestUrl } from '@app/utils/server-utils';
import { getWixClient } from '@app/hooks/useWixClientServer';
import { checkout as checkoutTypes } from '@wix/ecom';
import { STORES_APP_ID } from '@app/constants';

export async function GET(
  request: NextRequest,
  {
    params: { productId },
  }: {
    params: { productId: string };
  }
) {
  const requestUrl = getRequestUrl(request);
  const baseUrl = new URL('/', requestUrl).toString();
  const { searchParams } = new URL(requestUrl);
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);
  const productOptions = JSON.parse(
    searchParams.get('productOptions') || 'null'
  );
  const wixClient = await getWixClient();
  const product = await wixClient.productsV3.getProduct(productId, {
    fields: ['VARIANT_OPTION_CHOICE_NAMES'],
  });
  if (!product) {
    return new Response('Product not found', {
      status: 404,
    });
  }
  const hasVariants = (product.options?.length ?? 0) > 0;
  const selectedOptions =
    productOptions ??
    (hasVariants
      ? {
          variantId: product.variantsInfo?.variants?.[0]?._id,
        }
      : product?.options?.length
      ? {
          options:
            product?.options?.reduce((acc, option) => {
              acc[option.name!] = option.choicesSettings?.choices?.[0]?.name!;
              return acc;
            }, {} as Record<string, any>) ?? {},
        }
      : undefined);
  const item = {
    quantity,
    catalogReference: {
      catalogItemId: product._id!,
      appId: STORES_APP_ID,
      options: selectedOptions,
    },
  };
  const checkout = await wixClient.ecomCheckout.createCheckout({
    lineItems: [item],
    channelType: checkoutTypes.ChannelType.WEB,
    overrideCheckoutUrl: `${baseUrl}api/redirect-to-checkout?checkoutId={checkoutId}`,
  });

  const { redirectSession } = await wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId: checkout!._id! },
    callbacks: {
      postFlowUrl: baseUrl,
      thankYouPageUrl: `${baseUrl}stores-success`,
      cartPageUrl: `${baseUrl}cart`,
    },
  });

  return NextResponse.redirect(redirectSession!.fullUrl!);
}
