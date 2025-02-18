import { StyleSheet, TextInput, View } from "react-native";
import { HelperText, Icon } from "react-native-paper";

export const InputPrefix = ({
  iconName,
  error = false,
  errorMessage = "",
  ...props
}) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          props.style,
          {
            borderColor: error ? "red" : "#403f2b",
          },
        ]}
      >
        <Icon source={iconName} size={24} color={"#403f2b"} />
        <TextInput style={styles.input} {...props} />
      </View>
      {error && (
        <HelperText type="error" visible={error}>
          {errorMessage}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#403f2b",
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#403f2b",
    marginLeft: 5,
  },
  error: {
    color: "red",
    fontSize: 12,
    paddingHorizontal: 20,
  },
});
