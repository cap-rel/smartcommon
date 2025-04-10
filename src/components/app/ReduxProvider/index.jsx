import { Provider } from "react-redux";

export const ReduxProvider = (props) => {
  const { store, children } = props;

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};