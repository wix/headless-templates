import { Animated } from "react-native";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export const MainAnimatedBar = ({ translateY, searchRef }) => {
  const [showResults, setShowResults] = useState(false);
  const [transformY, setTransformY] = useState(translateY);

  useEffect(() => {
    setTransformY(showResults ? 0 : translateY);
  }, [showResults, translateY]);

  const handleShowResults = (value) => {
    setShowResults(value);
  };

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#FEFBEF",
        width: "100%",

        //for animation
        height: 0,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        transform: [{ translateY: transformY }],
      }}
    >
      <Header
        handleShowResults={handleShowResults}
        showResults={showResults}
        searchRef={searchRef}
      />
    </Animated.View>
  );
};
