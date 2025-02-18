import * as React from "react";
import { useRef } from "react";
import { WebView } from "react-native-webview";
import { SimpleContainer } from "../../../components/Container/SimpleContainer";
import { LoadingIndicator } from "../../../components/LoadingIndicator/LoadingIndicator";
import { styles } from "../../../styles/store/checkout/checkout-screen/styles";
import Routes from "../../../routes/routes";

export function CheckoutScreen({ navigation, route }) {
  const { redirectSession, cameFrom } = route?.params || {};
  if (!redirectSession) {
    navigation.navigate(Routes.Cart);
    return null;
  }

  const goBack = () => {
    webviewRef.current.stopLoading();
    if (cameFrom !== "CartView") navigation.replace("CartView");
    navigation.goBack();
    navigation.navigate(cameFrom);
  };

  const [loading, setLoading] = React.useState(true);
  const webviewRef = useRef(null);

  const loadWebView = () => (
    <WebView
      style={styles.container}
      setSupportMultipleWindows={false}
      ref={webviewRef}
      contentMode={"mobile"}
      source={{ uri: redirectSession?.fullUrl }}
      goBack={() => navigation.navigate(Routes.Cart)}
      onLoad={() => setLoading(false)}
      scalesPageToFit={true}
      bounces={false}
      scrollEnabled={false}
      nestedScrollEnabled={true}
      overScrollMode={"never"}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <>
      <SimpleContainer
        title={"Checkout"}
        navigation={navigation}
        onBackPress={goBack}
        backIcon={true}
        styles={{ backgroundColor: "white" }}
      >
        {loading && <LoadingIndicator />}
        {loadWebView()}
      </SimpleContainer>
    </>
  );
}
