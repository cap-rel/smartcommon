import { useMemo } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { reducers } from "lib/global-state";
import { useLibConfig } from "lib/hooks";

/**
 * This component is a wrapper of the actual Redux provider component,
 * which allows to separate and configure the store properly.
*/
export const ReduxProvider = (props) => {
    const { children } = props;

    const { globalState } = useLibConfig();

    const providedReducers = globalState?.reducers ?? {};

    const store = useMemo(
        () => configureStore({ reducer: { ...reducers, ...providedReducers } }),
        [providedReducers]
    );

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}