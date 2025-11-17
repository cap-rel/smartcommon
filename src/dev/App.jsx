import { ReduxProvider, I18nextProvider, Head, Router } from "./components";

import { Provider, Toaster } from "../lib";

export const App = () => {
  return (
    <Provider>
      <I18nextProvider>
        <Head />
        <Router />
        <Toaster />
      </I18nextProvider>
    </Provider>
  );
};