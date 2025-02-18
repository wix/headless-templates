import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.8,
    height: 200,
  },
  ImageContainer: {
    position: "absolute",
    zIndex: -1,
    width: "100%",
    height: "100%",
  },
  Image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  title: {
    fontSize: 40,
    fontFamily: "Fraunces-Regular",
    textAlign: "center",
    color: "#fff",
    position: "relative",
    zIndex: 1,
  },
});

export const ImageCard = ({ imageSrc, title }) => {
  return (
    <View style={styles.view}>
      <View style={styles.ImageContainer}>
        <Image source={imageSrc} style={styles.Image} />
        <View style={styles.overlay}></View>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};
