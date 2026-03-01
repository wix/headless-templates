import { items } from "@wix/data";
import { currentCart, recommendations } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { media } from "@wix/sdk";
import { categories } from "@wix/categories";
import { productsV3 } from "@wix/stores";
import { type SortKey } from "../constants";

const SEARCH_SORT_KEY_MAP: Record<string, string> = {
  name: "name",
  price: "actualPriceRange.minValue.amount",
};

const QUERY_SORT_KEY_MAP: Record<string, string> = {
  lastUpdated: "_updatedDate",
};

function isQuerySort(sortKey?: string): boolean {
  return !!sortKey && sortKey in QUERY_SORT_KEY_MAP;
}

function buildSearchSort(sortKey?: string, reverse?: boolean) {
  if (!sortKey) return undefined;
  const fieldName = SEARCH_SORT_KEY_MAP[sortKey];
  if (!fieldName) return undefined;
  return [{ fieldName, order: reverse ? "DESC" : "ASC" }] as any;
}
import type { Cart, Collection, Menu, Page, Product } from "./types";

const PRODUCT_FIELDS_LIST = [
  "CURRENCY",
  "MEDIA_ITEMS_INFO",
  "PLAIN_DESCRIPTION",
] as any;

const PRODUCT_FIELDS_DETAIL = [
  "CURRENCY",
  "MEDIA_ITEMS_INFO",
  "PLAIN_DESCRIPTION",
  "VARIANT_OPTION_CHOICE_NAMES",
] as any;

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
          }, 0)
        ),
        currencyCode: cart.currency!,
      },
      totalAmount: {
        amount: String(
          cart.lineItems!.reduce((acc, item) => {
            return (
              acc + Number.parseFloat(item.price?.amount!) * item.quantity!
            );
          }, 0)
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
              Number.parseFloat(item.price?.amount!) * item.quantity!
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

const reshapeCategory = (category: categories.Category) =>
  ({
    path: `/search/${category.slug}`,
    handle: category.slug,
    title: category.name,
    description: category.description,
    seo: {
      title: category.name,
    },
    updatedAt: new Date().toISOString(),
  }) as Collection;

const reshapeCategories = (items: categories.Category[]) => {
  return items.map(reshapeCategory);
};

const reshapeProduct = (item: productsV3.V3Product) => {
  const hasVariants = (item.options?.length ?? 0) > 0;
  return {
    id: item._id!,
    title: item.name!,
    description: item.plainDescription ?? item.name ?? "",
    descriptionHtml: item.plainDescription ?? item.name ?? "",
    availableForSale:
      item.inventory?.availabilityStatus !== "OUT_OF_STOCK",
    handle: item.slug!,
    images:
      item.media?.itemsInfo?.items
        ?.filter((x) => x.image)
        .map((img) => {
          const resolved = media.getImageUrl(img.image!);
          return {
            url: resolved.url,
            altText: img.altText ?? "alt text",
            width: resolved.width,
            height: resolved.height,
          };
        }) || [],
    priceRange: {
      minVariantPrice: {
        amount: item.actualPriceRange?.minValue?.amount ?? "0",
        currencyCode: item.currency ?? "USD",
      },
      maxVariantPrice: {
        amount:
          item.actualPriceRange?.maxValue?.amount ??
          item.actualPriceRange?.minValue?.amount ??
          "0",
        currencyCode: item.currency ?? "USD",
      },
    },
    options: (item.options ?? []).map((option) => ({
      id: option.name!,
      name: option.name!,
      values: (option.choicesSettings?.choices ?? []).map(
        (choice) => choice.name!
      ),
    })),
    featuredImage: item.media?.main?.image
      ? (() => {
          const resolved = media.getImageUrl(item.media.main.image);
          return {
            url: resolved.url,
            altText: item.media.main.altText ?? "alt text",
            width: resolved.width,
            height: resolved.height,
          };
        })()
      : { url: "", altText: "alt text", width: 0, height: 0 },
    tags: [],
    variants: hasVariants
      ? item.variantsInfo?.variants?.map((variant) => ({
          id: variant._id!,
          title: item.name!,
          price: {
            amount: variant.price?.actualPrice?.amount ?? "0",
            currencyCode: item.currency ?? "USD",
          },
          availableForSale: variant.inventoryStatus?.inStock ?? true,
          selectedOptions:
            variant.choices?.map((choice) => ({
              name: choice.optionChoiceNames!.optionName!,
              value: choice.optionChoiceNames!.choiceName!,
            })) ?? [],
        }))
      : cartesian(
          item.options?.map(
            (x) =>
              x.choicesSettings?.choices?.map((choice) => ({
                name: x.name,
                value: choice.name,
              })) ?? []
          ) ?? []
        ).map((selectedOptions) => ({
          id: "00000000-0000-0000-0000-000000000000",
          title: item.name!,
          price: {
            amount: item.actualPriceRange?.minValue?.amount ?? "0",
            currencyCode: item.currency ?? "USD",
          },
          availableForSale:
            item.inventory?.availabilityStatus !== "OUT_OF_STOCK",
          selectedOptions: selectedOptions,
        })),
    seo: {
      description: item.plainDescription ?? "",
      title: item.name!,
    },
    updatedAt: item._updatedDate?.toString() ?? new Date().toISOString(),
  } as Product;
};

export async function addToCart(
  lines: {
    productId: string;
    variant?: { variantId: string } | { options: Record<string, string> };
    quantity: number;
  }[]
): Promise<Cart> {
  const { cart } = await currentCart.addToCurrentCart({
    lineItems: lines.map(({ productId, variant, quantity }) => ({
      catalogReference: {
        catalogItemId: productId,
        appId: "1380b703-ce81-ff05-f115-39571d94dfcd",
        ...(variant && {
          options: variant,
        }),
      },
      quantity,
    })),
  });

  return reshapeCart(cart!);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const { cart } = await currentCart.removeLineItemsFromCurrentCart(lineIds);

  return reshapeCart(cart!);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const { cart } = await currentCart.updateCurrentCartLineItemQuantity(
    lines.map(({ id, quantity }) => ({
      id: id,
      quantity,
    }))
  );

  return reshapeCart(cart!);
}

export async function getCart(): Promise<Cart | undefined> {
  try {
    const cart = await currentCart.getCurrentCart();

    return reshapeCart(cart);
  } catch (e) {
    if ((e as any).details.applicationError.code === "OWNED_CART_NOT_FOUND") {
      return undefined;
    }
    throw e;
  }
}

const CATEGORIES_TREE_REFERENCE = {
  appNamespace: "@wix/stores",
};

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  try {
    const { categories: results = [] } = await categories.searchCategories(
      {
        filter: { slug: handle },
        cursorPaging: { limit: 1 },
      },
      { treeReference: CATEGORIES_TREE_REFERENCE }
    );

    const category = results[0];
    if (!category) {
      return undefined;
    }

    return reshapeCategory(category);
  } catch (e) {
    if ((e as any).code === "404") {
      return undefined;
    }
    throw e;
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
  let resolvedCategory;
  try {
    const { categories: results = [] } = await categories.searchCategories(
      {
        filter: { slug: collection },
        cursorPaging: { limit: 1 },
      },
      { treeReference: CATEGORIES_TREE_REFERENCE }
    );
    resolvedCategory = results[0];
  } catch (e) {
    if ((e as any)?.details?.applicationError?.code !== 404) {
      throw e;
    }
  }

  if (!resolvedCategory) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  let products: productsV3.V3Product[];
  if (isQuerySort(sortKey)) {
    const fieldName = QUERY_SORT_KEY_MAP[sortKey!];
    let query = productsV3
      .queryProducts({ fields: PRODUCT_FIELDS_DETAIL })
      .limit(100);
    query = reverse ? query.descending(fieldName as any) : query.ascending(fieldName as any);
    const result = await query.find();
    products = result.items;
  } else {
    ({ products = [] } = await productsV3.searchProducts(
      {
        filter: {
          "directCategoriesInfo.categories": {
            $matchItems: [{ _id: resolvedCategory._id }],
          },
        } as any,
        sort: buildSearchSort(sortKey, reverse),
        cursorPaging: { limit: 100 },
      },
      { fields: PRODUCT_FIELDS_DETAIL }
    ));
  }

  return products.map(reshapeProduct);
}

export async function getCollections(): Promise<Collection[]> {
  const { categories: items = [] } = await categories.searchCategories(
    { cursorPaging: { limit: 100 } },
    { treeReference: CATEGORIES_TREE_REFERENCE }
  );

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
    ...reshapeCategories(items).filter(
      (collection) => !collection.handle.startsWith("hidden")
    ),
  ];

  return wixCollections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const { items: menus } = await items
    .queryDataItems({
      dataCollectionId: "Menus",
      includeReferencedItems: ["pages"],
    })
    .eq("slug", handle)
    .find()
    .catch((e) => {
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Menus collection was not found. Did you forget to create the Menus data collection?"
        );
        return { items: [] };
      } else {
        throw e;
      }
    });

  const menu = menus[0];

  return (
    menu?.data!.pages.map((page: { title: string; slug: string }) => ({
      title: page.title,
      path: "/" + page.slug,
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page | undefined> {
  const { items: pages } = await items
    .queryDataItems({
      dataCollectionId: "Pages",
    })
    .eq("slug", handle)
    .find()
    .catch((e) => {
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Pages collection was not found. Did you forget to create the Pages data collection?"
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
    title: page.data!.title,
    handle: "/" + page.data!.slug,
    body: page.data!.body,
    bodySummary: "",
    createdAt: page.data!._createdDate.$date,
    seo: {
      title: page.data!.seoTitle,
      description: page.data!.seoDescription,
    },
    updatedAt: page.data!._updatedDate.$date,
  };
}

export async function getPages(): Promise<Page[]> {
  const { items: pages } = await items
    .queryDataItems({
      dataCollectionId: "Pages2",
    })
    .find()
    .catch((e) => {
      if (e.details.applicationError.code === "WDE0025") {
        console.error(
          "Pages collection was not found. Did you forget to create the Pages data collection?"
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
  const { product } = await productsV3.getProductBySlug(handle, {
    fields: PRODUCT_FIELDS_DETAIL,
  });

  if (!product) {
    return undefined;
  }

  return reshapeProduct(product);
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  const { recommendation } = await recommendations.getRecommendation(
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
    }
  );

  if (!recommendation) {
    return [];
  }

  const { products = [] } = await productsV3.searchProducts(
    {
      filter: {
        _id: {
          $in: recommendation.items!.map((item) => item.catalogItemId),
        },
      } as any,
      cursorPaging: { limit: 6 },
    },
    { fields: PRODUCT_FIELDS_LIST }
  );
  return products.slice(0, 6).map(reshapeProduct);
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
  let products: productsV3.V3Product[];
  if (!query && isQuerySort(sortKey)) {
    const fieldName = QUERY_SORT_KEY_MAP[sortKey!];
    let q = productsV3
      .queryProducts({ fields: PRODUCT_FIELDS_DETAIL })
      .limit(100);
    q = reverse ? q.descending(fieldName as any) : q.ascending(fieldName as any);
    const result = await q.find();
    products = result.items;
  } else {
    ({ products = [] } = await productsV3.searchProducts(
      {
        search: query ? { expression: query } : undefined,
        sort: buildSearchSort(sortKey, reverse),
        cursorPaging: { limit: 100 },
      },
      { fields: PRODUCT_FIELDS_DETAIL }
    ));
  }

  return products.map(reshapeProduct);
}

export async function createCheckoutUrl(postFlowUrl: string) {
  const currentCheckout = await currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.OTHER_PLATFORM,
  });

  const { redirectSession } = await redirects.createRedirectSession({
    ecomCheckout: { checkoutId: currentCheckout.checkoutId },
    callbacks: {
      postFlowUrl,
    },
  });

  return redirectSession?.fullUrl!;
}
