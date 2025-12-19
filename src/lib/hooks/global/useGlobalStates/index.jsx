import { useContext } from "react";

import { GlobalStatesContext } from "lib/components";

export { useGlobalStatesContext } from "./context";

export const useGlobalStates = () => useContext(GlobalStatesContext) ?? {};