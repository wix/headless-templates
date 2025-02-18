import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect } from "react";

export const SimpleHeader = ({
  navigation,
  title,
  backIcon = false,
  onBackPress,
}) => {
  useEffect(() => {
    navigation.addListener("focus", () => {
      Platform.OS === "android" &&
        StatusBar.setBackgroundColor("#c3c198", false);
      StatusBar.setBarStyle("dark-content", false);
    });
  }, [navigation]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  return (
    <View style={styles.headerContent}>
      <View
        style={[
          styles.headerTextContainer,
          {
            marginRight: backIcon ? 50 : 0,
          },
        ]}
      >
        <Text style={styles.headerText}>{title}</Text>
      </View>
      {backIcon && (
        <View>
          <IconButton
            icon={"arrow-left-thin"}
            size={36}
            style={styles.backIcon}
            onPress={handleBackPress}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#c3c198",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: StatusBar.currentHeight,
  },
  headerText: {
    color: "#403f2b",
    fontSize: 40,
    fontWeight: "normal",
    textAlign: "center",
    fontFamily: "Fraunces-Regular",
    letterSpacing: 1.5,
    position: "relative",
    marginVertical: 10,
  },
  backIcon: {
    width: 50,
    height: 50,
    paddingTop: StatusBar.currentHeight,
  },
});
