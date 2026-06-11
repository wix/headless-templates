import { StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";

export const NumericInput = ({ value, onChange, min, max, style }) => {
  const [inputValue, setInputValue] = useState(value);
  const clamp = (value = 1, min = 1, max = 100000) =>
    Math.min(Math.max(value, min), max);
  const handleChange = (text) => {
    if (text === "") {
      setInputValue("");
      onChange("0");
      return;
    }
    const numericValue = parseInt(text.replace(/[^0-9]/g, ""));
    setInputValue(clamp(numericValue, min, max).toString());
    onChange(clamp(numericValue, min, max));
  };

  return (
    <View style={[styles.numericInputContainer, style]}>
      <TextInput
        value={inputValue.toString() || ""}
        onBlur={() => setInputValue(clamp(inputValue, min, max))}
        onChangeText={handleChange}
        keyboardType="numeric"
        style={styles.numericInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  numericInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  numericInput: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#eee",
    width: "100%",
    textAlign: "left",
    backgroundColor: "white",
    fontSize: 20,
    padding: 10,
  },
  numericInputButton: {
    padding: 10,
  },
  numericInputButtonText: {
    fontSize: 20,
  },
});
