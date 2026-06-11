import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heroSection: {
    width: "100%",
    flexGrow: 1,
    display: "flex",
    justifyContent: "start",
  },
  heroImageContainer: {
    position: "absolute",
    zIndex: -1,
    width: "100%",
    height: "100%",
  },
  heroImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the alpha value for transparency
  },
  heroText: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start",
    zIndex: 1, // Ensure the text is above the overlay
    flex: 1,
  },
  heroTitle: {
    fontSize: 86,
    color: "#FFFDC3",
    fontWeight: "bold",
    fontFamily: "Fraunces-Regular",
  },
  heroSubtitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "300",
    fontFamily: "Fraunces-Regular",
    maxWidth: "50%",
    textAlign: "center",
  },
  heroShopNow: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Fraunces-Regular",
    height: "20%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroButton: {
    marginTop: 20,
    backgroundColor: "#403F2B",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  heroButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
