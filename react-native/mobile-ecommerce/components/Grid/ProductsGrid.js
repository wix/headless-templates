import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WixMediaImage } from "../../WixMediaImage";
import { memo, useMemo } from "react";

const screenWidth = Dimensions.get("window").width;

const ProductCard = ({ item, onPress }) => {
  return useMemo(() => {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.card}
          onPress={() => {
            onPress(item);
          }}
        >
          <WixMediaImage
            media={item.media.mainMedia.image.url}
            width={screenWidth / 2 - 20}
            height={screenWidth / 2}
          >
            {({ url }) => {
              return (
                <Image
                  style={[
                    styles.image,
                    {
                      width: screenWidth / 2 - 20, // Adjust the width as needed
                      height: screenWidth / 2,
                    },
                  ]}
                  source={{
                    uri: url,
                  }}
                />
              );
            }}
          </WixMediaImage>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.title}>
              {item.convertedPriceData?.formatted?.price}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }, [item]);
};
export const ProductsGrid = memo(({ data, scrollOffsetY, onPress }) => {
  return (
    <FlatList
      scrollEventThrottle={16}
      data={data}
      numColumns={2}
      keyExtractor={(item, index) => index.toString()}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
        {
          useNativeDriver: false,
        },
      )}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      bounces={false}
      renderItem={({ item }) => {
        return <ProductCard item={item} onPress={onPress} />;
      }}
    ></FlatList>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    elevation: 0,
    width: "100%",
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  image: {
    borderRadius: 25,
    backgroundColor: "#f1ede6",
  },
  title: {
    textAlign: "left",
    fontSize: 16,
    paddingTop: 10,
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
});
