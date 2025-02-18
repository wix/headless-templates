import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
} from "react-native";
import { Toast } from "../../components/Toast/Toast";
import { HeroSection } from "../../components/Hero/HeroSection";
import { styles } from "../../styles/home/styles";
import { MainAnimatedBar } from "../../components/Header/MainAnimatedBar";
import { ShopCollectionsHome } from "../../components/ShopCollectionsHome/ShopCollectionsHome";
import { MissionSectionHome } from "../../components/MissionSectionHome/MissionSectionHome";
import { FollowUsHome } from "../../components/FollowUsHome/FollowUsHome";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useRef } from "react";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

export const HomeScreen = ({ navigation }) => {
  const searchRef = useRef(null);
  const scrollY = new Animated.Value(0);
  const diffClamp = Animated.diffClamp(scrollY, 0, 200);
  const translateY = diffClamp.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -200],
    extrapolate: "clamp",
  });

  useEffect(() => {
    navigation.addListener("focus", () => {
      Platform.OS === "android" &&
        StatusBar.setBackgroundColor("#FEFBEF", false);
      StatusBar.setBarStyle("dark-content", false);
    });
  }, [navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen}>
        <MainAnimatedBar translateY={translateY} searchRef={searchRef} />
        <ScrollView
          style={styles.scrollView}
          alwaysBounceVertical={false}
          bounces={false}
          bouncesZoom={false}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            scrollY.setValue(e.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.spacer} />
          <Toast
            message={`Free shipping on all\ninternational orders over 35$ 📦`}
          />
          <HeroSection navigation={navigation} />
          <ShopCollectionsHome navigation={navigation} />
          <MissionSectionHome />
          <FollowUsHome />
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
