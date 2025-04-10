import { createContext, useEffect } from "react";
import { getVariable, isNil, setVariable } from "../../../globals";

export const ThemesContext = createContext(null);

export const ThemesProvider = (props) => {
    const { themes, theme, children } = props;

    useEffect(() => {
        const variables = themes?.[theme]?.variables ?? [];        
        Object.entries(variables).forEach(([key, value]) => setVariable(key, value));
    }, []);    

    return ( 
        <ThemesContext.Provider value={{ themes, theme }}>
            {children}
        </ThemesContext.Provider>
    );
};