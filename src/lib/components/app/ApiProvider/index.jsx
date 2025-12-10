import { useApiContext } from "lib/hooks";
import { ApiContext } from "./context";

export const ApiProvider = ({ children }) => {
    const api = useApiContext();

    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
};