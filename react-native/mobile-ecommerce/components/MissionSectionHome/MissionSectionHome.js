import { Text, View } from "react-native";
import { styles } from "../../styles/home/mission/styles";
import { IconGrid } from "../Grid/IconGrid";
import TrashBagSvg from "../../Icons/TrashBag";
import ZeroWaste from "../../Icons/ZeroWaste";
import Vegan from "../../Icons/Vegan";
import Recycled from "../../Icons/Recycled";
import FairTrade from "../../Icons/FairTrade";

export const MissionSectionHome = () => {
  return (
    <View style={styles.view}>
      <Text style={styles.missionTitle}>The Re.vert Mission</Text>
      <Text style={styles.missionText}>
        We believe in ethical and smart shopping. All of our products are
        carefully selected to ensure they align with our core values.
      </Text>
      <IconGrid
        data={[
          {
            svg: TrashBagSvg({ width: 75, height: 75 }),
            text: "Sustainable",
          },
          {
            svg: ZeroWaste({ width: 75, height: 75 }),
            text: "Zero Waste",
          },
          {
            svg: Vegan({ width: 75, height: 75 }),
            text: "Vegan",
          },
          {
            svg: Recycled({ width: 75, height: 75 }),
            text: "Recycled",
          },
          {
            svg: FairTrade({ width: 75, height: 75 }),
            text: "Fair Trade",
          },
        ]}
      />
    </View>
  );
};
