import { manifest } from "@wix/astro/extensions";
import { orders } from "@wix/ecom";
import { shippingRates } from "@wix/ecom/service-plugins";
import { products } from "@wix/stores";

const aPlugin = manifest
  .on(products.onProductCreated, ({ data: product }) => {
    console.log(`Product created: ${product.name}`);
  })
  .on(orders.onOrderCreated, ({ entity }) => {
    console.log(`Order created: ${entity._id}`);
  })
  .permissions(["WIX_STORES.READ_ORDERS", "WIX_STORES.READ_PRODUCTS"]);

export default manifest.plugin(aPlugin).provide(
  shippingRates,
  {
    ecomShippingRates: {
      name: "Fedex",
      description: "Fedex shipping rates",
      learnMoreUrl: "https://www.fedex.com/",
      dashboardUrl: "https://www.fedex.com/",
      thumbnailUrl: "https://www.fedex.com/",
    },
  },
  {
    getShippingRates(payload) {
      console.log("getShippingRates", payload);
      return {};
    },
  }
);
