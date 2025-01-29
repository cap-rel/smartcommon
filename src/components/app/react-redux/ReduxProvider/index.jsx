import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
import { store } from "../../../../reduxStore"; // persistor

const ReduxProvider = (props) => {
  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        {props.children}
      {/* </PersistGate> */}
    </Provider>
  );
};

export default ReduxProvider;
