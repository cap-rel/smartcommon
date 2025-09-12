import { VariantsContext } from "./VariantsContext";

export const VariantsProvider = (props) => {
    const { variants, children } = props;

    return ( 
        <VariantsContext.Provider value={variants}>
            {children}
        </VariantsContext.Provider>
    );
};