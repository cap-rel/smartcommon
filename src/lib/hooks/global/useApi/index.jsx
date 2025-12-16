import { useContext } from "react";

import { ApiContext } from "lib/components";

export { useApiContext } from "./context";

export const useApi = () => useContext(ApiContext) ?? {};