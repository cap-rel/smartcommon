import { ReduxProvider, I18nextProvider, Head, Router } from "./components";

import { Toaster } from "../lib";

export const App = () => {
  return (
    // <ReduxProvider>
      <I18nextProvider>
        <Head />
        <Router />
        <Toaster />
      </I18nextProvider>
    // </ReduxProvider>
  );
};