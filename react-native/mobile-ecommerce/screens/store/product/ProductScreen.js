import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout } from "@wix/ecom";
import { products } from "@wix/stores";
import * as Linking from "expo-linking";
import * as React from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import {
  Button,
  Card,
  IconButton,
  List,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import RenderHtml from "react-native-render-html";
import { wixCient } from "../../../authentication/wixClient";
import { SimpleContainer } from "../../../components/Container/SimpleContainer";
import { NumericInput } from "../../../components/Input/NumericInput";
import Routes from "../../../routes/routes";
import { styles } from "../../../styles/store/product/styles";
import { WixMediaImage } from "../../../WixMediaImage";

export function ProductScreen({ route, navigation }) {
  const { product, collectionName } = route.params;
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [requestedQuantity, setRequestQuantity] = React.useState(1);
  const [selectedProductOptions, setSelectedProductOptions] = React.useState(
    {},
  );
  const [addToCartSnackBarVisible, setAddToCartSnackBarVisible] =
    React.useState(false);

  const selectedVariant = product.variants?.find(
    (variant) =>
      Object.entries(selectedProductOptions).length > 0 &&
      Object.entries(selectedProductOptions).every(
        ([key, value]) => variant.choices[key] === value,
      ),
  );

  const description = product?.description ?? "";

  const buyNowMutation = useMutation(
    async (quantity) => {
      const item = {
        quantity,
        catalogReference: cartCatalogReference(
          product,
          selectedVariant,
          selectedProductOptions,
        ),
      };

      const currentCheckout = await wixCient.checkout.createCheckout({
        lineItems: [item],
        channelType: checkout.ChannelType.OTHER_PLATFORM,
      });

      const { redirectSession } =
        await wixCient.redirects.createRedirectSession({
          ecomCheckout: { checkoutId: currentCheckout._id },
          callbacks: {
            thankYouPageUrl: Linking.createURL("/store/checkout/thank-you"),
            cartPageUrl: Linking.createURL("/store/cart"),
            postFlowUrl: Linking.createURL("/store/products"),
          },
        });

      return redirectSession;
    },
    {
      onSuccess: (redirectSession) => {
        navigation.navigate(Routes.Cart, {
          screen: Routes.Checkout,
          params: { redirectSession, cameFrom: Routes.Store },
          goBack: Routes.Products,
        });
      },
    },
  );

  const addToCurrentCartMutation = useMutation(
    async (quantity) =>
      wixCient.currentCart.addToCurrentCart({
        lineItems: [
          {
            quantity,
            catalogReference: cartCatalogReference(
              product,
              selectedVariant,
              selectedProductOptions,
            ),
          },
        ],
      }),
    {
      onSuccess: (response) => {
        queryClient.setQueryData(["currentCart"], response.cart);
        setAddToCartSnackBarVisible(true);
      },
    },
  );

  const inStock = productInStock(product, selectedVariant, requestedQuantity);
  const allProductOptionsSelected = (product.productOptions ?? []).every(
    (productOption) => productOption.name in selectedProductOptions,
  );

  const canBeAddedToCart = inStock && allProductOptionsSelected;

  return (
    <SimpleContainer
      navigation={navigation}
      title={collectionName}
      backIcon={true}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        styles={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.backContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <IconButton
              icon={"chevron-left"}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.backButtonText}>Back To {collectionName}</Text>
          </Pressable>
        </View>
        <Card style={styles.card} mode={"elevated"} elevation={0}>
          <WixMediaImage
            media={product.media.mainMedia.image.url}
            height={400}
            width={300}
          >
            {({ url }) => (
              <Card.Cover source={{ uri: url }} style={styles.cardImage} />
            )}
          </WixMediaImage>
          {selectedVariant?.variant?.sku && (
            <Card.Title
              title={""}
              subtitle={`SKU: ${selectedVariant?.variant?.sku}`}
              subtitleStyle={styles.productSku}
            />
          )}
          {product.productOptions.map((productOption) => (
            <View style={styles.variantsContainer}>
              <Dropdown
                label={productOption.name}
                options={productOption.choices.map((choice) => ({
                  label: choice.description,
                  value: choice.description,
                }))}
                value={selectedProductOptions[productOption.name]}
                onSelect={(value) => {
                  setSelectedProductOptions((selectedProductOptions) => {
                    const newSelectedProductOptions = {
                      ...selectedProductOptions,
                      [productOption.name]: value,
                    };
                    if (typeof value === "undefined") {
                      delete newSelectedProductOptions[productOption.name];
                    }
                    return newSelectedProductOptions;
                  });
                }}
                mode="outlined"
              />
            </View>
          ))}

          <Card.Title
            title={product.name}
            titleNumberOfLines={2}
            subtitle={
              selectedVariant?.variant?.convertedPriceData?.formatted
                ?.discountedPrice || null
            }
            titleVariant="displaySmall"
            titleStyle={styles.productTitle}
          />

          <Card.Content>
            <View style={styles.flexJustifyStart}>
              {!allProductOptionsSelected ? (
                <Text style={{ color: "#B22D1D" }}>
                  Please select all product options
                </Text>
              ) : !inStock ? (
                <Text style={{ color: "#B22D1D" }}>Out of Stock</Text>
              ) : (
                <>
                  <Text style={{ fontSize: 13, marginBottom: 8 }}>
                    Quantity
                  </Text>
                  <NumericInput
                    value={requestedQuantity}
                    onChange={(val) => setRequestQuantity(val)}
                    min={1}
                    style={{
                      width: 100,
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  />
                </>
              )}
            </View>

            <Button
              mode="contained"
              onPress={() =>
                addToCurrentCartMutation.mutateAsync(requestedQuantity)
              }
              loading={addToCurrentCartMutation.isLoading}
              style={[
                styles.flexGrow1Button,
                {
                  backgroundColor: !canBeAddedToCart
                    ? theme.colors.surfaceDisabled
                    : "#403f2a",
                },
              ]}
              buttonColor={theme.colors.secondary}
              disabled={!canBeAddedToCart}
            >
              Add to Cart
            </Button>
            <Button
              mode="contained"
              onPress={() => buyNowMutation.mutateAsync(requestedQuantity)}
              loading={buyNowMutation.isLoading}
              style={[
                styles.flexGrow1Button,
                {
                  // backgroundColor: "transparent",
                  borderColor: !canBeAddedToCart
                    ? theme.colors.surfaceDisabled
                    : "#403f2a",
                  marginTop: 0,
                },
              ]}
              icon={"shopping-outline"}
              textColor={theme.colors.surface}
              contentStyle={{
                backgroundColor: canBeAddedToCart
                  ? theme.colors.secondary
                  : theme.colors.surfaceVariant,
              }}
              disabled={!canBeAddedToCart}
            >
              Buy Now
            </Button>
            <RenderHtml
              style={styles.flexJustifyStart}
              source={{ html: description }}
              contentWidth={width}
            />
          </Card.Content>
        </Card>

        {product.additionalInfoSections.map((section) => (
          <List.Accordion
            title={section.title}
            key={section.title}
            style={{ paddingHorizontal: 20, backgroundColor: "#fdfbef" }}
            right={(props) => (
              <IconButton
                icon={`${props.isExpanded ? "minus" : "plus"}`}
                {...props}
              />
            )}
            titleStyle={{ fontSize: 20, fontFamily: "Fraunces-Regular" }}
          >
            <RenderHtml
              contentWidth={width}
              baseStyle={{ paddingHorizontal: 35 }}
              source={{ html: section.description ?? "" }}
            />
          </List.Accordion>
        ))}

        <Portal>
          <Snackbar
            visible={addToCartSnackBarVisible}
            onDismiss={() => setAddToCartSnackBarVisible(false)}
            style={{ backgroundColor: "#FDFBEF" }}
            action={{
              label: "View Cart",
              labelStyle: { color: "#403F2B" },
              onPress: () => {
                navigation.navigate(Routes.Cart);
              },
            }}
            label
            duration={5000}
          >
            <Text style={{ color: "#403F2B" }}>Added to Cart</Text>
          </Snackbar>
        </Portal>
      </ScrollView>
    </SimpleContainer>
  );
}

function cartCatalogReference(
  product,
  selectedVariant,
  selectedProductOptions,
) {
  return {
    catalogItemId: product._id,
    appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
    options: product.manageVariants
      ? {
          variantId: selectedVariant?._id,
        }
      : { options: selectedProductOptions },
  };
}

function productInStock(product, selectedVariant, requestedQuantity) {
  if (product.stock.inventoryStatus === products.InventoryStatus.OUT_OF_STOCK) {
    return false;
  }

  if (!product.manageVariants) {
    return true;
  }

  if (!selectedVariant) {
    return false;
  }

  return (
    selectedVariant.stock.inStock &&
    selectedVariant.stock.quantity >= requestedQuantity
  );
}
