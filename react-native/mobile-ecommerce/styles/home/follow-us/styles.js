import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
export const styles = StyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginHorizontal: "auto",
    paddingVertical: 40,
    marginVertical: 0,
    backgroundColor: "#E8E59B",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Fraunces-Regular",
    color: "#403F2B",
  },
  subtitle: {
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: "Fraunces-Regular",
    color: "#403F2B",
  },
  carouselItem: {
    flex: 1,
    borderRadius: 15,
    justifyContent: "center",
    width: screenWidth * 0.7,
    height: screenWidth * 0.8,
  },
  carouselItemImage: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.8,
    borderRadius: 15,
  },
});
