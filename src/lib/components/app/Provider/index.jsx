import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";

import { ApiProvider, GlobalStatesProvider, LibConfigProvider, ReduxProvider, NavigationProvider, Router, Toaster, ErrorBoundary, UpdatePrompt } from "lib/components";

const LazyDebugConsole = lazy(() => import("lib/components/others/DebugConsole").then(m => ({ default: m.DebugConsole })));

export const Provider = (props) => {
  const { children, config, onError, errorFallback, ErrorFallbackComponent, pwaUpdate, debug } = props;
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
            {debug && <Suspense fallback={null}><LazyDebugConsole /></Suspense>}
          </ApiProvider>
        </GlobalStatesProvider>
      </ReduxProvider>
    </LibConfigProvider>
  </ErrorBoundary>
  );
};
