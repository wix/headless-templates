import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import { WixMediaImage } from "../../WixMediaImage";
import { wixCient } from "../../authentication/wixClient";
import { data as StaticCollectionsData } from "../../data/staticCollectionsData/data";
import { data as StaticProductsData } from "../../data/staticdProductsData/data";
import Routes from "../../routes/routes";
import { styles } from "../../styles/home/shop-collection/shop-collection";
import { ImageCard } from "../Cards/ImageCard";
import { ErrorView } from "../ErrorView/ErrorView";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator";

const screenWidth = Dimensions.get("window").width;

export const ShopCollectionsHome = ({ navigation }) => {
  const carouselRef = useRef(null);
  const productsResponse = useQuery(["products"], () =>
    wixCient.products.queryProducts().find(),
  );
  const collectionsResponse = useQuery(["collections"], () =>
    wixCient.collections.queryCollections().find(),
  );

  if (productsResponse.isLoading || collectionsResponse.isLoading) {
    return <LoadingIndicator />;
  }

  if (productsResponse.isError) {
    return <ErrorView message={productsResponse.error.message} />;
  }

  if (collectionsResponse.isError) {
    return <ErrorView message={collectionsResponse.error.message} />;
  }

  const handleNext = () => {
    carouselRef.current?.next();
  };
  const handlePrev = () => {
    carouselRef.current?.prev();
  };
  const shopCollections = [...collectionsResponse.data.items];
  const preferredCollections =
    process.env.EXPO_PUBLIC_DISPLAY_COLLECTIONS_SLUGS.split(" ").map((slug) =>
      slug.toLowerCase(),
    );
  const displayedCollections =
    preferredCollections.length > 0
      ? shopCollections
          .filter((collection) =>
            preferredCollections.includes(collection.slug.toLowerCase()),
          )
          .sort(
            (a, b) =>
              preferredCollections.indexOf(a.slug.toLowerCase()) -
              preferredCollections.indexOf(b.slug.toLowerCase()),
          )
      : shopCollections.length >= 0
        ? shopCollections
            .slice(0, Math.min(3, shopCollections.length))
            .map((collection) => {
              switch (collection.slug.toLowerCase()) {
                case process.env.EXPO_PUBLIC_NEW_COLLECTION_SLUG:
                  return shopCollections[4] || collection;
                case "all-products":
                  return shopCollections[3] || collection;
                default:
                  return collection;
              }
            })
        : StaticCollectionsData.items;

  const newInCollection = shopCollections.find(
    (collection) =>
      collection.slug === process.env.EXPO_PUBLIC_NEW_COLLECTION_SLUG,
  );
  const newProducts = [...productsResponse.data.items].filter((product) =>
    product.collectionIds.includes(newInCollection?._id),
  );
  const filteredProducts =
    newProducts.length > 0 ? newProducts : StaticProductsData.items;
  return (
    <View style={styles.view}>
      <Text style={styles.title}>Shop Collections</Text>
      <View style={styles.collections}>
        {displayedCollections.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                marginVertical: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  navigation.navigate(Routes.Store, {
                    screen: Routes.Products,
                    params: { items: item },
                  });
                }}
              >
                {item.media?.mainMedia?.image?.url ? (
                  <WixMediaImage
                    media={item.media.mainMedia.image.url}
                    width={screenWidth * 0.8}
                    height={screenWidth * 0.8}
                  >
                    {({ url }) => {
                      return (
                        <ImageCard
                          imageSrc={{
                            uri: url,
                          }}
                          title={item.name}
                        />
                      );
                    }}
                  </WixMediaImage>
                ) : (
                  <ImageCard
                    imageSrc={require("../../assets/PlaceHolder.png")}
                    title={item.name}
                  />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.carouselContainer}>
        <Text
          style={[
            styles.title,
            {
              marginTop: 20,
            },
          ]}
        >
          New In
        </Text>
        <Carousel
          style={{
            position: "relative",
          }}
          loop
          width={screenWidth * 0.6}
          height={screenWidth}
          autoPlay={false}
          data={filteredProducts}
          scrollAnimationDuration={1000}
          ref={carouselRef}
          renderItem={({ index }) => {
            return (
              <View style={styles.carousel}>
                <Pressable
                  onPress={() => {
                    navigation.navigate(Routes.Store, {
                      screen: Routes.Product,
                      params: {
                        product: filteredProducts[index],
                        collectionName: filteredProducts[index].name,
                      },
                    });
                  }}
                >
                  <Image
                    style={styles.carouselImage}
                    source={{
                      uri:
                        filteredProducts[index]?.media?.mainMedia?.image?.url ||
                        `https://via.placeholder.com/${screenWidth / 2}`,
                    }}
                  />
                  <Text style={styles.carouselTitle}>
                    {filteredProducts[index].name}
                  </Text>
                  <Text style={styles.carouselPrice}>
                    {
                      filteredProducts[index].convertedPriceData.formatted
                        ?.price
                    }
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
        <View style={styles.indicators}>
          <TouchableOpacity
            onPress={handlePrev}
            style={styles.indicatorButtonLeft}
          >
            <IconButton icon={"chevron-left"} size={30} color={"#333"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.indicatorButtonRight}
          >
            <IconButton icon={"chevron-right"} size={30} color={"#333"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
