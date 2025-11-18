import { Provider, Toaster } from "lib/components";

import { I18nextProvider, Head, Router } from "dev/components";

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