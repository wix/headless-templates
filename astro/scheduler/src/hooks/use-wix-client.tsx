import { useContext } from "react";
import { WixClientContext } from "../components/WixClientContext";

export const useWixClient = () => {
  return useContext(WixClientContext);
};
