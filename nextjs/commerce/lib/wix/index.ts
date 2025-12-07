import { items } from "@wix/data";
import { currentCart, recommendations } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { createClient, media, OAuthStrategy } from "@wix/sdk";
import { collections, products } from "@wix/stores";
import { SortKey, WIX_SESSION_COOKIE } from "lib/constants";
import { cookies } from "next/headers";
import { Cart, Collection, Menu, Page, Product, ProductVariant } from "./types";

const cartesian = <T>(data: T[][]) =>
  data.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [
    [],
  ] as T[][]);

const reshapeCart = (cart: currentCart.Cart): Cart => {
  return {
    id: cart._id!,
    checkoutUrl: "/cart-checkout",
    cost: {
      subtotalAmount: {
        amount: String(
          cart.lineItems!.reduce((acc, item) => {
            return (
              acc + Number.parseFloat(item.price?.amount!) * item.quantity!
            );
          }, 0),
        ),
        currencyCode: cart.currency!,
      },
      totalAmount: {
        amount: String(
          cart.lineItems!.reduce((acc, item) => {
            return (
              acc + Number.parseFloat(item.price?.amount!) * item.quantity!
            );
          }, 0),
        ),
        currencyCode: cart.currency!,
      },
      totalTaxAmount: {
        amount: "0",
        currencyCode: cart.currency!,
      },
    },
    lines: cart.lineItems!.map((item) => {
      const featuredImage = media.getImageUrl(item.image!);
      return {
        id: item._id!,
        quantity: item.quantity!,
        cost: {
          totalAmount: {
            amount: String(
              Number.parseFloat(item.price?.amount!) * item.quantity!,
            ),
            currencyCode: cart.currency!,
          },
        },
        merchandise: {
          id: item._id!,
          title:
            item.descriptionLines
              ?.map((x) => x.colorInfo?.original ?? x.plainText?.original)
              .join(" / ") ?? "",
          selectedOptions: [],
          product: {
            handle: item.url?.split("/").pop() ?? "",
            featuredImage: {
              altText:
                "altText" in featuredImage ? featuredImage.altText : "alt text",
              url: media.getImageUrl(item.image!).url,
              width: media.getImageUrl(item.image!).width,
              height: media.getImageUrl(item.image!).height,
            },
            title: item.productName?.original!,
          } as any as Product,
          url: `/product/${item.url?.split("/").pop() ?? ""}`,
        },
      };
    }),
    totalQuantity: cart.lineItems!.reduce((acc, item) => {
      return acc + item.quantity!;
    }, 0),
  };
};

const reshapeCollection = (collection: collections.Collection) =>
  ({
    path: `/search/${collection.slug}`,
    handle: collection.slug,
    title: collection.name,
    description: collection.description,
    seo: {
      title: collection.name,
    },
    updatedAt: new Date().toISOString(),
  }) as Collection;

const reshapeCollections = (collections: collections.Collection[]) => {
  return collections.map(reshapeCollection);
};

const reshapeProduct = (item: products.Product) => {
  return {
    id: item._id!,
    title: item.name!,
    description: item.description!,
    descriptionHtml: item.description!,
    availableForSale:
      item.stock?.inventoryStatus === "IN_STOCK" ||
      item.stock?.inventoryStatus === "PARTIALLY_OUT_OF_STOCK",
    handle: item.slug!,
    images:
      item.media
        ?.items!.filter((x) => x.image)
        .map((image) => ({
          url: image.image!.url!,
          altText: image.image?.altText! ?? "alt text",
          width: image.image?.width!,
          height: image.image?.height!,
        })) || [],
    priceRange: {
      minVariantPrice: {
        amount: String(item.price?.price!),
        currencyCode: item.price?.currency!,
      },
      maxVariantPrice: {
        amount: String(item.price?.price!),
        currencyCode: item.price?.currency!,
      },
    },
    options: (item.productOptions ?? []).map((option) => ({
      id: option.name!,
      name: option.name!,
      values: option.choices!.map((choice) =>
        option.optionType === products.OptionType.color
          ? choice.description
          : choice.value,
      ),
    })),
    featuredImage: {
      url: item.media?.mainMedia?.image?.url!,
      altText: item.media?.mainMedia?.image?.altText! ?? "alt text",
      width: item.media?.mainMedia?.image?.width!,
      height: item.media?.mainMedia?.image?.height!,
    },
    tags: [],
    variants: item.manageVariants
      ? item.variants?.map((variant) => ({
          id: variant._id!,
          title: item.name!,
          price: {
            amount: String(variant.variant?.priceData?.price),
            currencyCode: variant.variant?.priceData?.currency,
          },
          availableForSale: variant.stock?.trackQuantity
            ? (variant.stock?.quantity ?? 0 > 0)
            : true,
          selectedOptions: Object.entries(variant.choices ?? {}).map(
            ([name, value]) => ({
              name,
              value,
            }),
          ),
        }))
      : cartesian(
          item.productOptions?.map(
            (x) =>
              x.choices?.map((choice) => ({
                name: x.name,
                value:
                  x.optionType === products.OptionType.color
                    ? choice.description
                    : choice.value,
              })) ?? [],
          ) ?? [],
        ).map((selectedOptions) => ({
          id: "00000000-0000-0000-0000-000000000000",
          title: item.name!,
          price: {
            amount: String(item.price?.price!),
            currencyCode: item.price?.currency!,
          },
          availableForSale: item.stock?.inventoryStatus === "IN_STOCK",
          selectedOptions: selectedOptions,
        })),
    seo: {
      description: item.description!,
      title: item.name!,
    },
    updatedAt: item.lastUpdated?.toString()!,
  } as Product;
};

export async function addToCart(
  lines: { productId: string; variant?: ProductVariant; quantity: number }[],
): Promise<Cart> {
  const { addToCurrentCart } = (await getWixClient()).use(currentCart);
  const { cart } = await addToCurrentCart({
    lineItems: lines.map(({ productId, variant, quantity }) => ({
      catalogReference: {
        catalogItemId: productId,
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
        ...(variant && {
          options:
            variant.id === "00000000-0000-0000-0000-000000000000"
              ? {
                  options: variant.selectedOptions.reduce(
                    (acc, option) => ({
                      ...acc,
                      [option.name!]: option.value!,
                    }),
                    {} as Record<string, string>,
                  ),
                }
              : { variantId: variant?.id },
        }),
      },
      quantity,
    })),
  });

  return reshapeCart(cart!);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const { removeLineItemsFromCurrentCart } = (await getWixClient()).use(
    currentCart,
  );

  const { cart } = await removeLineItemsFromCurrentCart(lineIds);

  return reshapeCart(cart!);
}

export async function updateCart(
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const { updateCurrentCartLineItemQuantity } = (await getWixClient()).use(
    currentCart,
  );

  const { cart } = await updateCurrentCartLineItemQuantity(
    lines.map(({ id, quantity }) => ({
      id: id,
      quantity,
    })),
  );

  return reshapeCart(cart!);
}

export async function getCart(): Promise<Cart | undefined> {
  const { getCurrentCart } = (await getWixClient()).use(currentCart);
  try {
    const cart = await getCurrentCart();

    return reshapeCart(cart);
  } catch (e) {
    if ((e as any).details.applicationError.code === "OWNED_CART_NOT_FOUND") {
      return undefined;
    }
  }
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const { getCollectionBySlug } = (await getWixClient()).use(collections);

  try {
    const { collection } = await getCollectionBySlug(handle);

    if (!collection) {
      return undefined;
    }

    return reshapeCollection(collection);
  } catch (e) {
    if ((e as any).code === "404") {
      return undefined;
    }
  }
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const { getCollectionBySlug } = (await getWixClient()).use(collections);
  let resolvedCollection;
  try {
    const { collection: wixCollection } = await getCollectionBySlug(collection);
    resolvedCollection = wixCollection;
  } catch (e) {
    if ((e as any)?.details?.applicationError?.code !== 404) {
      throw e;
    }
  }

  if (!resolvedCollection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  const { items } = await (await sortedProductsQuery(sortKey, reverse))
    .hasSome("collectionIds", [resolvedCollection._id])
    .find();

  return items.map(reshapeProduct);
}

async function sortedProductsQuery(sortKey?: string, reverse?: boolean) {
  const { queryProducts } = (await getWixClient()).use(products);
  const query = queryProducts();
  if (reverse) {
    return query.descending((sortKey! as SortKey) ?? "name");
  } else {
    return query.ascending((sortKey! as SortKey) ?? "name");
  }
}

export async function getCollections(): Promise<Collection[]> {
  const { queryCollections } = (await getWixClient()).use(collections);
  const { items } = await queryCollections().find();

  const wixCollections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(items).filter(
      (collection) => !collection.handle.startsWith("hidden"),
    ),
  ];

  return wixCollections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const { query } = (await getWixClient()).use(items);

  const { items: menus } = await query("Menus")
    .include("pages")
    .eq("slug", handle)
    .find()
    .catch((e) => {
      console.error(e);
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Menus collection was not found. Did you forget to create the Menus data collection?",
        );
        return { items: [] };
      } else {
        throw e;
      }
    });

  const menu = menus[0];

  return (
    menu?.pages.map((page: { title: string; slug: string }) => ({
      title: page.title,
      path: "/" + page.slug,
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page | undefined> {
  const { query } = (await getWixClient()).use(items);

  const { items: pages } = await query("Pages")
    .eq("slug", handle)
    .find()
    .catch((e) => {
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Pages collection was not found. Did you forget to create the Pages data collection?",
        );
        return { items: [] };
      } else {
        throw e;
      }
    });

  const page = pages[0];

  if (!page) {
    return undefined;
  }

  return {
    id: page._id!,
    title: page.title,
    handle: "/" + page.slug,
    body: page.body,
    bodySummary: "",
    createdAt: page._createdDate!.toDateString(),
    seo: {
      title: page.seoTitle,
      description: page.seoDescription,
    },
    updatedAt: page._updatedDate!.toDateString(),
  };
}

export async function getPages(): Promise<Page[]> {
  const { query } = (await getWixClient()).use(items);

  const { items: pages } = await query("Pages")
    .find()
    .catch((e) => {
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Pages collection was not found. Did you forget to create the Pages data collection?",
        );
        return { items: [] };
      } else {
        throw e;
      }
    });

  return pages.map((item) => ({
    id: item._id!,
    title: item.data!.title,
    handle: item.data!.slug,
    body: item.data!.body,
    bodySummary: "",
    createdAt: item.data!._createdDate.$date,
    seo: {
      title: item.data!.seoTitle,
      description: item.data!.seoDescription,
    },
    updatedAt: item.data!._updatedDate.$date,
  }));
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const { queryProducts } = (await getWixClient()).use(products);
  const { items } = await queryProducts().eq("slug", handle).limit(1).find();
  const product = items[0];

  if (!product) {
    return undefined;
  }

  return reshapeProduct(product);
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const { getRecommendation } = (await getWixClient()).use(recommendations);

  const { recommendation } = await getRecommendation(
    [
      {
        _id: "5dd69f67-9ab9-478e-ba7c-10c6c6e7285f",
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
      },
      {
        _id: "ba491fd2-b172-4552-9ea6-7202e01d1d3c",
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
      },
      {
        _id: "68ebce04-b96a-4c52-9329-08fc9d8c1253",
        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
      },
    ],
    {
      items: [
        {
          catalogItemId: productId,
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
        },
      ],
      minimumRecommendedItems: 3,
    },
  );

  if (!recommendation) {
    return [];
  }

  const { queryProducts } = (await getWixClient()).use(products);
  const { items } = await queryProducts()
    .in(
      "_id",
      recommendation.items!.map((item) => item.catalogItemId),
    )
    .find();
  return items.slice(0, 6).map(reshapeProduct);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const { items } = await (await sortedProductsQuery(sortKey, reverse))
    .startsWith("name", query || "")
    .find();

  return items.map(reshapeProduct);
}

export const getWixClient = async () => {
  let sessionTokens;
  try {
    const cookieStore = await cookies();
    sessionTokens = JSON.parse(
      cookieStore.get(WIX_SESSION_COOKIE)?.value || "{}",
    );
  } catch (e) {}
  const wixClient = createClient({
    auth: OAuthStrategy({
      clientId: process.env.WIX_CLIENT_ID!,
      tokens: sessionTokens,
    }),
  });
  return wixClient;
};

export async function createCheckoutUrl(postFlowUrl: string) {
  const {
    currentCart: { createCheckoutFromCurrentCart },
    redirects: { createRedirectSession },
  } = (await getWixClient()).use({ currentCart, redirects });

  const currentCheckout = await createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.OTHER_PLATFORM,
  });

  const { redirectSession } = await createRedirectSession({
    ecomCheckout: { checkoutId: currentCheckout.checkoutId },
    callbacks: {
      postFlowUrl,
    },
  });

  return redirectSession?.fullUrl!;
}
