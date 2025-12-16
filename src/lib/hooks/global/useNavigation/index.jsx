import { useContext } from "react";

import { NavigationContext } from "lib/components";

export * from "./context";

export const useNavigation = () => useContext(NavigationContext) ?? {};