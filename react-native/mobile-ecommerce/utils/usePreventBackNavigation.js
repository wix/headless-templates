import * as React from "react";

export function usePreventBackNavigation({ navigation }) {
  React.useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (e.data.action.type === "GO_BACK") {
          e.preventDefault();
        }
      }),
    [navigation],
  );
}
