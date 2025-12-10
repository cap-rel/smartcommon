import { createContext } from "react";

import { useApiContext } from "lib/hooks";

export const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
    const api = useApiContext();

    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
};