import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { reducers } from "../../../global-state";
import { useLibConfig } from "../../../hooks";

/**
 * This component is a wrapper of the actual Redux provider component, 
 * which allows to separate and configure the store properly.
*/
export const ReduxProvider = (props) => {
    const { children } = props;

    const { globalState } = useLibConfig();

    const providedReducers = globalState?.reducers ?? {};

    const store = configureStore({ reducer: { ...reducers, ...providedReducers } });

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}