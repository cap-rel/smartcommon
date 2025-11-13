import { Provider } from "react-redux";
import { redux } from "../../../redux";

export const ReduxProvider = (props) => {
  const { children } = props;

  return (
    <Provider> {/* store={redux} */}
      {children}
    </Provider>
  );
};