import { createContext } from "react";

export const VariantsContext = createContext(null);

export const VariantsProvider = (props) => {
    const { variants, children } = props;

    return ( 
        <VariantsContext.Provider value={variants}>
            {children}
        </VariantsContext.Provider>
    );
};