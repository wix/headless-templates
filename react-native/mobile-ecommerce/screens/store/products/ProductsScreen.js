import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useRef } from "react";
import { Animated, SafeAreaView, View } from "react-native";
import { wixCient } from "../../../authentication/wixClient";
import { ErrorView } from "../../../components/ErrorView/ErrorView";
import { ProductsGrid } from "../../../components/Grid/ProductsGrid";
import { ProductsHeader } from "../../../components/Header/ProductsHeader";
import { LoadingIndicator } from "../../../components/LoadingIndicator/LoadingIndicator";
import { styles } from "../../../styles/store/products/styles";

export function ProductsScreen({ navigation, route }) {
  const {
    name: CollectionName,
    slug: CollectionSlug,
    _id: CollectionId,
    description: CollectionDescription,
  } = route.params.items;

  const productsResponse = useQuery(["products"], () =>
    wixCient.products.queryProducts().find(),
  );

  if (productsResponse.isLoading) {
    return <LoadingIndicator />;
  }

  if (productsResponse.isError) {
    return <ErrorView message={productsResponse.error.message} />;
  }
  const items = productsResponse.data.items.filter((product) =>
    product.collectionIds.includes(CollectionId),
  );
  const productPressHandler = (product) => {
    navigation.navigate("Product", {
      product,
      collectionName: CollectionName ?? product.name,
    });
  };

  const [animationState, setAnimationState] = React.useState({
    animation: new Animated.Value(0),
    visible: true,
  });

  const scrollOffsetY = useRef(animationState.animation).current;

  return (
    <>
      <SafeAreaView style={styles.safeView} />
      <View
        keyboardShouldPersistTaps="always"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <ProductsHeader
          animHeaderValue={scrollOffsetY}
          navigation={navigation}
          visible={animationState.visible}
          title={CollectionName}
          description={CollectionDescription}
          media={items[0]?.media?.mainMedia}
        />
        <ProductsGrid
          data={items}
          onPress={productPressHandler}
          navigation={navigation}
          scrollOffsetY={scrollOffsetY}
        />
      </View>
    </>
  );
}
