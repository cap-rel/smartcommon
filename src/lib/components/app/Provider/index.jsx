import { AnimatePresence } from "framer-motion";

import { ApiProvider, LibConfigProvider, ReduxProvider, Router, Toaster } from "lib/components";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    
  <LibConfigProvider value={config}>
    <ReduxProvider>
      <ApiProvider>
        <Router>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </Router>
        <Toaster />
      </ApiProvider>
    </ReduxProvider>
  </LibConfigProvider>
  );
};