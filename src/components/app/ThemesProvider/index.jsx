import { useEffect } from "react";
import { setVariable } from "../../../globals";
import { ThemesContext } from "./ThemesContext";

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