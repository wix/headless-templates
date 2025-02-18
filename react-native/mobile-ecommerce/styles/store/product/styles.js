import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  backButtonText: {
    textAlign: "center",
    fontSize: 15,
  },
  card: {
    marginHorizontal: 20,
    flex: 1,
    height: "100%",
  },
  cardImage: {
    marginHorizontal: 20,
    height: 400,
    borderRadius: 0,
  },
  productSku: {
    margin: 0,
    padding: 0,
  },
  productTitle: {
    fontFamily: "Fraunces-Regular",
    fontSize: 40,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    height: "100%",
  },
  content: {
    paddingHorizontal: 1,
  },
  flexGrow1Button: {
    flexGrow: 1,
    marginVertical: 20,
    // backgroundColor: '#403f2a',
  },
  flexJustifyCenter: {
    marginTop: 20,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  flexJustifyStart: {
    marginTop: 20,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignItems: "flex-start",
  },
  variantsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
});
