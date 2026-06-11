import { HomeScreen } from "../../screens/home/HomeScreen";
import { StoreScreen } from "../../screens/store/StoreScreen";
import { CartScreen } from "../../screens/store/cart/CartScreen";
import { MemberAreaScreen } from "../../screens/members/MemberAreaScreen/MemberAreaScreen";
import Routes from "../../routes/routes";

export const tabs = [
  {
    name: Routes.Home,
    component: HomeScreen,
    icon: "home-outline",
  },
  {
    name: Routes.Store,
    component: StoreScreen,
    icon: "view-grid-outline",
  },
  {
    name: Routes.Profile,
    component: MemberAreaScreen,
    icon: "account-outline",
  },
  {
    name: Routes.Cart,
    component: CartScreen,
    icon: "cart-outline",
  },
];
