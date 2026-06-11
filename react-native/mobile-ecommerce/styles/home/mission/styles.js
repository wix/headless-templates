import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  view: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginHorizontal: "auto",
    marginVertical: 0,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#DDDDCC",
  },
  missionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#403F2B",
    fontFamily: "Fraunces-Regular",
    textAlign: "center",
  },
  missionText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#403F2B",
    textAlign: "center",
    width: "80%",
    lineHeight: 25,
  },
});
