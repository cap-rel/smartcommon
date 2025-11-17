import { useContext } from "react";
import { LibConfigContext } from "../../components";

export const useLibConfig = () => useContext(LibConfigContext) ?? {};