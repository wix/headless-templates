import { ScrollView } from "react-native-gesture-handler";

export const DismissKeyboardScrollView = ({ children, ...props }) => {
  return (
    <ScrollView
      keyboardShouldPersistTaps="never"
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};
