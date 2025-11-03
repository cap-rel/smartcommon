import { useContext } from "react";
import { NavigationContext } from "../../components";

export const useNavigation = () => useContext(NavigationContext);