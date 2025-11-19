import { Provider, Toaster } from "lib/components";

import { I18nextProvider, Head, Router } from "dev/components";
import { API_URL } from "lib/utils";

export const App = () => {
  return (
    <Provider config={{ api: { url: API_URL } }}>
      <I18nextProvider>
        <Head />
        <Router />
        <Toaster />
      </I18nextProvider>
    </Provider>
  );
};