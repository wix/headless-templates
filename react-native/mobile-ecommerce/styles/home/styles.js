import { StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flexDirection: "column",
    height: "100%",
    width: "100%",
    backgroundColor: "#FEFBEF",
  },
  scrollView: {
    flexGrow: 1,
  },
  spacer: {
    marginTop: 100 + StatusBar.currentHeight,
  },
});
