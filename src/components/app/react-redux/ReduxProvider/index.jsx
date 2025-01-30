import { Provider } from "react-redux";
import { store } from "../../../../reduxStore";

export const ReduxProvider = (props) => {
  return (
    <Provider store={store}>
        {props.children}
    </Provider>
  );
};