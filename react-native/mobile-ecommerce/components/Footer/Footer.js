import { Linking, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/home/footer/styles";

export const Footer = () => {
  return (
    <View style={styles.view}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: -10,
        }}
      >
        <Text style={styles.text}>
          © 2035 by Re.Vert. Powered and secured by
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://wix.com")}>
          <Text style={styles.text_pressable}>Wix</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
