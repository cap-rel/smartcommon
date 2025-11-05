import { useContext } from "react";
import { ApiContext } from "../../components";

export const useAuth = () => useContext(ApiContext);