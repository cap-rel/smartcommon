import { Provider } from "react-redux";
import { store, persistor } from "../../../../lib/hooks/useDb/tests/store";
import { PersistGate } from "redux-persist/integration/react";

export const ReduxProvider = (props) => {
  const { children } = props;

  return (
    <Provider store={store}> {/* store={redux} */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};