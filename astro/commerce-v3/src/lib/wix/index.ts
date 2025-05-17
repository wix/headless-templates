import { items } from "@wix/data";
import { currentCart, recommendations } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { media } from "@wix/sdk";
import {productsV3} from "@wix/stores";
import { categories } from "@wix/categories";
import type { Cart, Collection, Menu, Page, Product } from "./types";
import {
  InventoryAvailabilityStatus,
  SingleEntityOpsRequestedFields
} from "@wix/auto_sdk_stores_products-v-3";

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
      description: category.description || "",
      seo: {
        title: category.name,
      },
      updatedAt: new Date().toISOString(),
    }) as Collection;

const reshapeCategories = (categoryList: categories.Category[] = []) => {
  return categoryList.map(reshapeCategory);
};

const reshapeProduct = (item: productsV3.V3Product) => {
  return {
    id: item._id!,
    title: item.name!,
    descriptionHtml: item.plainDescription!,
    availableForSale:
        item.inventory?.availabilityStatus === InventoryAvailabilityStatus.IN_STOCK ||
        item.inventory?.availabilityStatus === InventoryAvailabilityStatus.PARTIALLY_OUT_OF_STOCK,
    handle: item.slug!,
    images:
        item.media
            ?.itemsInfo?.items?.map((image: any) => ({
              url: media.getImageUrl(item.media?.main?.image!).url!,
              altText: image?.altText! ?? "alt text",
              width: media.getImageUrl(item.media?.main?.image!).width!,
              height: media.getImageUrl(item.media?.main?.image!).height!,
            })) || [],
    priceRange: {
      minVariantPrice: {
        amount: item.actualPriceRange?.minValue?.amount!,
        currencyCode: item.currency!,
      },
      maxVariantPrice: {
        amount: item.actualPriceRange?.maxValue?.amount!,
        currencyCode: item.currency!,
      },
    },
    options: (item.options ?? []).map((option: any) => ({
      id: option.name!,
      name: option.name!,
      values: option.choicesSettings?.choices?.map((choice: any) =>
          choice.name
      ),
    })),
    featuredImage: {
      url: media.getImageUrl(item.media?.main?.image!).url,
      altText: item.media?.main?.altText! ?? "alt text",
      width: media.getImageUrl(item.media?.main?.image!).width!,
      height: media.getImageUrl(item.media?.main?.image!).height!,
    },
    tags: [],
    variants: item.variantsInfo?.variants
        ? item.variantsInfo?.variants?.map((variant: productsV3.Variant) => ({
          id: variant._id!,
          title: item.name!,
          price: {
            amount: variant?.price?.actualPrice?.amount,
            currencyCode: item.currency,
          },
          availableForSale: variant.inventoryStatus?.inStock!,
          selectedOptions: Object.entries(variant.choices ?? {}).map(
              ([name, value]) => ({
                name,
                value,
              })
          ),
        }))
        : cartesian(
            item.options?.map(
                (x: any) =>
                    x.choicesSettings?.choices?.map((choice: any) => ({
                      name: x.name,
                      value: choice.name,
                    })) ?? []
            ) ?? []
        ).map((selectedOptions: any) => ({
          id: "00000000-0000-0000-0000-000000000000",
          title: item.name!,
          price: {
            amount: item.actualPriceRange?.maxValue?.amount,
            currencyCode: item?.currency!,
          },
          availableForSale: item.inventory?.availabilityStatus === InventoryAvailabilityStatus.IN_STOCK ||
              item.inventory?.availabilityStatus === InventoryAvailabilityStatus.PARTIALLY_OUT_OF_STOCK,
          selectedOptions: selectedOptions,
        })),
    seo: {
      description: item.plainDescription!,
      title: item.name!,
    },
    updatedAt: item._updatedDate?.toString() || new Date().toISOString(),
  };
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

export async function getCategoriesPoc(
    handle: string
): Promise<Collection | undefined> {
  try {
    const { items } = await categories.queryCategories({
      treeReference: {
        appNamespace: "@wix/stores"
      }
    })
        .eq("slug", handle)
        .find();

    const category = items[0];
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

export async function getCategoryProducts({
                                              collection,
                                              reverse,
                                              sortKey,
                                            }: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  let resolvedCategory;
  let sortParam;
  switch (sortKey) {
    case 'price':
      sortParam = 'actualPriceRange.minValue.amount';
      break;

    case 'latest':
      sortParam = 'createdDate';
      break;

    default:
      sortParam = 'name';
      break;
  }

  try {
    const { items } = await categories.queryCategories({
      treeReference: {
        appNamespace: "@wix/stores"
      }
    }).eq("slug", collection).find();
    resolvedCategory = items[0];
  } catch (e) {
    if ((e as any)?.details?.applicationError?.code !== 404) {
      throw e;
    }
  }

  if (!resolvedCategory) {
    console.log(`No category found for \`${collection}\``);
    return [];
  }

  const searchOptions: any = {
    sort: [{
      fieldName: sortParam,
      order: reverse ? "DESC" : "ASC"
    }],
    fields: ['PLAIN_DESCRIPTION', 'MEDIA_ITEMS_INFO', 'CURRENCY', 'THUMBNAIL', 'DIRECT_CATEGORIES_INFO'],
    filter: {
      'directCategoriesInfo.categories': {
        $matchItems: [
          {
            id: {
              $in: [resolvedCategory._id],
            },
          },
        ],
      },
    },
  };

  const response = await productsV3.searchProducts(searchOptions);
  const products = response.products || [];

  // @ts-ignore todo - need to adjust typings for v3
  return products.map(reshapeProduct);
}

export async function getCategories(): Promise<categories.Category[]> {
  const { categories: categoriesResponse } = await categories.searchCategories({
    treeReference: {
      appNamespace: "@wix/stores"
    }
  });

  const wixCategories = [
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

    ...reshapeCategories(categoriesResponse).filter(
        (category) => !category.handle.startsWith("hidden")
    ),
  ];

  return wixCategories;
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

// TODO should be productsV3.V3Product need to adjust astro file types
export async function getProduct(slug: string): Promise<Product | undefined> {
  const { product } = await productsV3
      .getProductBySlug(slug, {fields: [SingleEntityOpsRequestedFields.MEDIA_ITEMS_INFO]})

  if (!product) {
    return undefined;
  }

  // TODO need to adjust types
  //@ts-ignore
  return reshapeProduct(product);
}

// TODO should be productsV3.V3Product need to adjust astro file types
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

  const { items } = await productsV3
      .queryProducts()
      .in(
          "_id",
          recommendation.items!.map((item) => item.catalogItemId)
      )
      .find();
  // @ts-ignore todo - need to adjust typings for v3
  return items.slice(0, 6).map(reshapeProduct);
}

// TODO should be productsV3.V3Product need to adjust astro file types
export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  let sortParam;
  switch (sortKey) {
    case 'price':
      sortParam = 'actualPriceRange.minValue.amount';
      break;

    case 'latest':
      sortParam = 'createdDate';
      break;

    default:
      sortParam = 'name';
      break;
  }

  const searchOptions: any = {
    search: {
      sort: [{
        fieldName: sortParam,
        order: reverse ? "DESC" : "ASC"
      }]
    }
  };

  if (query) {
    searchOptions.search.search = {expression: query};
  }

  const response = await productsV3.searchProducts(searchOptions);

  // TODO need to adjust types
  //@ts-ignore
  return (response.products || []).map(reshapeProduct);
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
