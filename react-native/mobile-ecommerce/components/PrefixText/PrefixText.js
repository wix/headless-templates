import { Text, View } from "react-native";
import { Icon } from "react-native-paper";

export const PrefixText = ({ children, icon, iconColor, style }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Icon
        source={icon}
        size={20}
        color={`${iconColor ? iconColor : "#403f2b"}`}
      />
      <Text style={[style, { marginLeft: 5 }]}>{children}</Text>
    </View>
  );
};
