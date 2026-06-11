import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { styles } from "../../styles/home/follow-us/styles";
import Carousel from "react-native-reanimated-carousel";
import { data } from "../../data/followUs/data";
import { useCallback } from "react";

export const FollowUsHome = (callback, deps) => {
  const width = Dimensions.get("window").width;
  const handlePress = useCallback(async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const handleonProgressChange = useCallback((progress) => {
    // detect device scroll
  }, []);
  return (
    <View style={styles.view}>
      <Text style={styles.title}>Follow Us</Text>
      <Text style={styles.subtitle}>{`@Re.vert`}</Text>
      <Carousel
        loop
        width={width * 0.7}
        height={width}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={1000}
        snapEnabled={false}
        scrollEnabled={false}
        overscrollEnabled={true}
        onProgressChange={handleonProgressChange}
        mode="parallax"
        renderItem={({ index }) => {
          return (
            <View style={styles.carouselItem}>
              <Pressable onPress={handlePress.bind(this, data[index].link)}>
                <Image
                  style={styles.carouselItemImage}
                  source={{
                    uri: data[index].uri,
                  }}
                />
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
};
