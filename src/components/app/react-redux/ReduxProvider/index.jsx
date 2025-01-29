import { Provider } from "react-redux";
import { store } from "../../../../reduxStore";

const ReduxProvider = (props) => {
  return (
    <Provider store={store}>
        {props.children}
    </Provider>
  );
};

export default ReduxProvider;
