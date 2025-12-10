import { useContext } from "react";

import { ApiContext } from "lib/components";

export * from "./context";

export const useApi = () => useContext(ApiContext) ?? {};