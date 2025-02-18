import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

export const IconGrid = ({ data }) => {
  const screenWidth = Dimensions.get("window").width;
  const imagesPerRow = screenWidth / 150;

  const renderItems = () => {
    return data.map((item, index) => (
      <View key={index} style={styles.itemContainer}>
        {item.svg}
        <Text style={styles.text}>{item.text}</Text>
      </View>
    ));
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < data.length; i += imagesPerRow) {
      rows.push(
        <View key={i / imagesPerRow} style={styles.row}>
          {renderItems().slice(i, i + imagesPerRow)}
        </View>,
      );
    }
    return rows;
  };

  return <View style={styles.container}>{renderRows()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  itemContainer: {
    alignItems: "center",
    margin: 5,
  },
  image: {
    width: 50, // Adjust the width as needed
    height: 50, // Adjust the height as needed
    borderRadius: 25, // Adjust the borderRadius as needed
  },
  text: {
    marginTop: 5,
    fontSize: 11,
    color: "#333",
  },
});
