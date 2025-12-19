import { AnimatePresence } from "framer-motion";

import { ApiProvider, GlobalStatesProvider, LibConfigProvider, ReduxProvider, NavigationProvider, Router, Toaster } from "lib/components";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    
  <LibConfigProvider value={config}>
    <ReduxProvider>
      <GlobalStatesProvider>
        <ApiProvider>
          <Router>
            <NavigationProvider>
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </NavigationProvider>
          </Router>
          <Toaster />
        </ApiProvider>
      </GlobalStatesProvider>
    </ReduxProvider>
  </LibConfigProvider>
  );
};