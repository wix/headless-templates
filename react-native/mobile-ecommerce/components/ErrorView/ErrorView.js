import { StyleSheet, Text, View } from "react-native";

export const ErrorView = ({ message }) => (
  <View style={styles.container}>
    <Text>Error: {message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
