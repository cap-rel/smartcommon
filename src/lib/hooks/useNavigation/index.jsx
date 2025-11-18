import { useContext } from "react";

import { NavigationContext } from "lib/components";

export const useNavigation = () => useContext(NavigationContext);