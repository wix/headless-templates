import { Animated } from "react-native";
import { Header } from "./Header";

export const ProductAnimatedBar = (translateY, navigation) => {
  return (
    <Animated.View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#FEFBEF",
        width: "100%",
        //for animation
        height: translateY,
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        elevation: 4,
        zIndex: 1,
      }}
    >
      <Header />
    </Animated.View>
  );
};
