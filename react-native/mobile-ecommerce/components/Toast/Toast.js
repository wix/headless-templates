import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { IconButton } from "react-native-paper";

export const Toast = ({ message }) => {
  const [visible, setVisible] = useState(true);
  const fadeAnim = new Animated.Value(1);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  useEffect(() => {
    if (!visible) {
      fadeAnim.setValue(1);
    }
  }, [visible, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        { display: visible ? "flex" : "none" },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
      <IconButton
        icon="close"
        size={20}
        style={styles.closeButton}
        onPress={handleClose}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E7E59B",
    padding: 10,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  toastText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
    position: "absolute",
    right: 10,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
});
