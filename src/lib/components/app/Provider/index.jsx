import { AnimatePresence } from "framer-motion";

import { ApiProvider, GlobalStatesProvider, LibConfigProvider, ReduxProvider, NavigationProvider, Router, Toaster, ErrorBoundary, UpdatePrompt, DebugConsole } from "lib/components";

export const Provider = (props) => {
  const { children, config, onError, errorFallback, ErrorFallbackComponent, pwaUpdate } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
  <ErrorBoundary onError={onError} fallback={errorFallback} FallbackComponent={ErrorFallbackComponent}>
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
            {pwaUpdate && <UpdatePrompt {...pwaUpdate} />}
            {import.meta.env.DEV && <DebugConsole />}
          </ApiProvider>
        </GlobalStatesProvider>
      </ReduxProvider>
    </LibConfigProvider>
  </ErrorBoundary>
  );
};