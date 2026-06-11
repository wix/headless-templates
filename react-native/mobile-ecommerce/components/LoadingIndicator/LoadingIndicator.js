import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export const LoadingIndicator = ({ loadingMessage = undefined, ...props }) => (
  <View style={[styles.container, props.styles]}>
    <ActivityIndicator {...props} />
    {loadingMessage && <Text>{loadingMessage}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
