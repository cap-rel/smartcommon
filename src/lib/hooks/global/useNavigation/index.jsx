import { useContext } from "react";

import { NavigationContext } from "lib/components";

export { useNavigationContext } from "./context";

export const useNavigation = () => useContext(NavigationContext) ?? {};