import { useContext } from "react";

import { LibConfigContext } from "lib/components";

export const useLibConfig = () => useContext(LibConfigContext) ?? {};