import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import * as Linking from "expo-linking";
import _, { isInteger } from "lodash";
import * as React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import { wixCient } from "../../../authentication/wixClient";
import { SimpleContainer } from "../../../components/Container/SimpleContainer";
import { ErrorView } from "../../../components/ErrorView/ErrorView";
import { InputPrefix } from "../../../components/Input/InputPrefix";
import { CartListItem } from "../../../components/List/CartListItem";
import { LoadingIndicator } from "../../../components/LoadingIndicator/LoadingIndicator";
import { PrefixText } from "../../../components/PrefixText/PrefixText";
import Routes from "../../../routes/routes";
import { styles } from "../../../styles/store/cart/styles";
import { CheckoutScreen } from "../checkout/CheckoutScreen";
import { CheckoutThankYouScreen } from "../checkout/CheckoutThankYouScreen";
import { usePrice } from "../price";

const Stack = createNativeStackNavigator();

const EmptyCart = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Your cart is empty</Text>
      <Button
        onPress={() => navigation.navigate(Routes.Store, {})}
        mode="contained"
        style={{ marginTop: 10 }}
        theme={{ colors: { primary: "#403f2b" } }}
      >
        Go to products
      </Button>
    </View>
  );
};

function CartItem({ item, currency }) {
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation(
    async (quantity) => {
      quantity <= 0 ? (quantity = 1) : quantity;
      if (isInteger(quantity) === false) {
        quantity = Math.round(quantity);
      }
      return wixCient.currentCart.updateCurrentCartLineItemQuantity([
        {
          _id: item._id,
          quantity,
        },
      ]);
    },
    {
      onSuccess: (response) => {
        queryClient.setQueryData(["currentCart"], response.cart);
      },
    },
  );

  const removeMutation = useMutation(
    async () => {
      return wixCient.currentCart.removeLineItemsFromCurrentCart([item._id]);
    },
    {
      onSuccess: (response) => {
        queryClient.setQueryData(["currentCart"], response.cart);
      },
    },
  );
  return (
    <CartListItem
      name={item.productName.translated}
      price={usePrice({
        amount: Number.parseFloat(item.price?.amount) * item.quantity,
        currencyCode: currency,
      })}
      image={item.image}
      quantity={item.quantity}
      quantityOnEdit={updateQuantityMutation.isLoading}
      quantityHandlerChange={(quantity) =>
        updateQuantityMutation.mutateAsync(quantity)
      }
      removeHandler={() => removeMutation.mutateAsync()}
    />
  );
}

function CartView() {
  const [userNote, setUserNote] = React.useState("");
  const [userDiscount, setUserDiscount] = React.useState("");
  const [triggerInvalidCoupon, setTriggerInvalidCoupon] = React.useState(false);
  const [checkoutRedirect, setCheckoutRedirect] = React.useState(false);
  const theme = useTheme();
  const navigation = useNavigation();

  const currentCartQuery = useQuery(["currentCart"], () => {
    try {
      return wixCient.currentCart.getCurrentCart();
    } catch (e) {
      return console.error(e);
    }
  });

  const checkoutMutation = useMutation(
    async () => {
      setCheckoutRedirect(true);
      let currentCheckout =
        await wixCient.currentCart.createCheckoutFromCurrentCart({
          channelType: currentCart.ChannelType.OTHER_PLATFORM,
        });
      if (userNote !== "") {
        currentCheckout.buyerNote = userNote;
      }
      if (userDiscount !== "") {
        currentCheckout.discountCode = userDiscount;
      }

      if (userDiscount !== "") {
        try {
          currentCheckout = await wixCient.checkout.updateCheckout(
            currentCheckout.checkoutId,
            currentCheckout,
            {
              couponCode: userDiscount,
            },
          );
        } catch (e) {
          setTriggerInvalidCoupon(true);
          setCheckoutRedirect(false);
          return undefined;
        }
      }

      const { redirectSession } =
        await wixCient.redirects.createRedirectSession({
          ecomCheckout: { checkoutId: currentCheckout.checkoutId },
          callbacks: {
            thankYouPageUrl: Linking.createURL("/store/checkout/thank-you"),
          },
        });

      return redirectSession;
    },
    {
      onSuccess: (redirectSession) => {
        if (!redirectSession) return;
        navigation.navigate(Routes.Checkout, {
          redirectSession,
          cameFrom: "CartView",
        });
        setCheckoutRedirect(false);
      },
    },
  );

  if (currentCartQuery.isLoading) {
    return (
      <SimpleContainer navigation={navigation} title={"My Cart"}>
        <LoadingIndicator />
      </SimpleContainer>
    );
  }

  if (currentCartQuery.isError) {
    if (!currentCartQuery.error.message.includes("OWNED_CART_NOT_FOUND")) {
      return <ErrorView message={currentCartQuery.error.message} />;
    } else {
      return (
        <SimpleContainer navigation={navigation} title={"My Cart"}>
          <ScrollView
            style={{ flexGrow: 1, height: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
            }}
            keyboardShouldPersistTaps="always"
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={currentCartQuery.isFetching}
                onRefresh={currentCartQuery.refetch}
              />
            }
          >
            <EmptyCart />
          </ScrollView>
        </SimpleContainer>
      );
    }
  }

  const subTotal = usePrice({
    amount: currentCartQuery.data.lineItems.reduce((acc, item) => {
      return acc + Number.parseFloat(item.price?.amount) * item.quantity;
    }, 0),
    currencyCode: currentCartQuery.data.currency,
  });

  const userAddNoteHandler = _.debounce((text) => {
    setUserNote(text);
  }, 250);

  const userAddDiscountHandler = _.debounce((text) => {
    setTriggerInvalidCoupon(false);
    setUserDiscount(text);
  }, 250);

  const handleCheckout = () => {
    if (checkoutRedirect) {
      return;
    }
    !checkoutRedirect ? checkoutMutation.mutateAsync() : {};
  };

  return (
    <SimpleContainer navigation={navigation} title={"My Cart"}>
      <ScrollView
        style={{ flexGrow: 1, height: "100%" }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="always"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={currentCartQuery.isFetching}
            onRefresh={currentCartQuery.refetch}
          />
        }
      >
        {currentCartQuery?.data?.lineItems?.length === 0 ? (
          <EmptyCart navigation={navigation} />
        ) : (
          <View
            style={{
              flexGrow: 1,
              justifyContent: "flex-start",
            }}
          >
            {currentCartQuery.data.lineItems.map((item, index) => (
              <View key={item._id}>
                <CartItem
                  currency={currentCartQuery.data.currency}
                  key={item._id}
                  item={item}
                />
                <Surface
                  style={{
                    margin: 10,
                    height: 1,
                    backgroundColor: "#c7c7bd",
                  }}
                  mode="elevated"
                  elevation={0}
                  children={null}
                />
              </View>
            ))}
            <InputPrefix
              iconName={"tag-outline"}
              style={{ margin: 10, borderWidth: 0 }}
              placeholder={"Enter your promo code"}
              onChangeText={userAddDiscountHandler}
              placeholderTextColor={"#403f2b"}
              error={triggerInvalidCoupon}
              errorMessage={`${userDiscount} is not a valid coupon code`}
            />
            <Surface
              style={{
                margin: 10,
                height: 1,
                backgroundColor: "#c7c7bd",
              }}
              mode="elevated"
              elevation={0}
              children={null}
            />
            <InputPrefix
              iconName={"note-text-outline"}
              style={{ margin: 10, borderWidth: 0 }}
              placeholder={"Add a note"}
              onChangeText={userAddNoteHandler}
              placeholderTextColor={"#403f2b"}
              outlineStyle={{ borderWidth: 1, borderColor: "#403f2b" }}
            />
            <Surface
              style={{
                margin: 10,
                height: 1,
                backgroundColor: "#c7c7bd",
              }}
              mode="elevated"
              elevation={0}
              children={null}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ margin: 10, color: "#403f2b" }}>Subtotal</Text>
                <Text style={{ margin: 10, color: "#403f2b" }}>{subTotal}</Text>
              </View>
            </View>
            <Surface
              style={{
                margin: 10,
                height: 1,
                backgroundColor: "#c7c7bd",
              }}
              mode="elevated"
              elevation={0}
              children={null}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ margin: 10, color: "#403f2b", fontSize: 18 }}>
                Total
              </Text>
              <Text style={{ margin: 10, color: "#403f2b", fontSize: 18 }}>
                {subTotal}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={handleCheckout}
              loading={checkoutRedirect}
              contentStyle={{ color: "#fdfbef" }}
              style={styles.checkoutButton}
              buttonColor={theme.colors.secondary}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </Button>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingBottom: 20,
              }}
            >
              <PrefixText icon="lock">Secure Checkout</PrefixText>
            </View>
          </View>
        )}
      </ScrollView>
    </SimpleContainer>
  );
}

export function CartScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={"CartView"}
    >
      <Stack.Screen name="CartView" component={CartView} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="CheckoutThankYou"
        component={CheckoutThankYouScreen}
      />
    </Stack.Navigator>
  );
}
