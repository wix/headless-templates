import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    marginHorizontal: "auto",
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    marginVertical: 0,
    backgroundColor: "#FEFBEF",
    textAlign: "left",
  },
  text: {
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 15,
  },
  text_pressable: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
    padding: 0,
  },
  listItem: {
    margin: 0,
    padding: 0,
  },
  listItemTitle: {
    fontSize: 14,
    padding: 0,
    margin: 0,
    color: "#333",
    textDecorationLine: "underline",
  },
});
