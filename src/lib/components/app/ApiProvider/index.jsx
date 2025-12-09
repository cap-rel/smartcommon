import { createContext } from "react";

import { useApiContext } from "lib/hooks";

export const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
    return (
        <ApiContext.Provider value={useApiContext}>
            {children}
        </ApiContext.Provider>
    );
};