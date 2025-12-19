import { useGlobalStatesContext } from "lib/hooks";
import { GlobalStatesContext } from "./context";

export const GlobalStatesProvider = (props) => {
    const { children } = props;
    
    const gst = useGlobalStatesContext();

    return (
        <GlobalStatesContext.Provider value={gst}>
            {children}
        </GlobalStatesContext.Provider>
    );
};