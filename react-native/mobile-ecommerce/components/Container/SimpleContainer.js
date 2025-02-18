import { SafeAreaView, StyleSheet, View } from "react-native";
import { SimpleHeader } from "../Header/SimpleHeader";

export const SimpleContainer = ({
  children,
  navigation,
  title,
  backIcon = true,
  styles,
  onBackPress,
}) => {
  return (
    <>
      <SafeAreaView style={defaultStyles.safeArea} />
      <SimpleHeader
        navigation={navigation}
        title={title}
        backIcon={backIcon}
        onBackPress={onBackPress}
      />
      <View style={[defaultStyles.container, styles]}>{children}</View>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "#c3c198",
  },
  container: {
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#fdfbef",
    flex: 1,
  },
});
