import { AnimatePresence } from "framer-motion";

import { ApiProvider, GlobalStatesProvider, LibConfigProvider, ReduxProvider, NavigationProvider, Router, Toaster, ErrorBoundary, UpdatePrompt, DebugConsole, DebugWarnings, ThemeApplier } from "lib/components";

export const Provider = (props) => {
  const { children, config, onError, errorFallback, ErrorFallbackComponent, pwaUpdate, debug } = props;
  // theme: "light" (default) | "dark" | "auto" (follows the OS).
  const themeMode = config?.theme;
  // router: "browser" (default) | "hash". basename for the browser router.
  // Lets a PWA served under a subpath / using hash deep links keep the single
  // <Provider> instead of hand-rolling its own router stack.
  const routerType = config?.router ?? "browser";
  const routerBasename = config?.basename;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
  <ErrorBoundary onError={onError} fallback={errorFallback} FallbackComponent={ErrorFallbackComponent}>
    <LibConfigProvider value={config}>
      <ThemeApplier mode={themeMode} />
      <ReduxProvider>
        <GlobalStatesProvider>
          <ApiProvider>
            <Router type={routerType} basename={routerBasename}>
              <NavigationProvider>
                <AnimatePresence mode="wait">
                  {children}
                </AnimatePresence>
              </NavigationProvider>
            </Router>
            <Toaster />
            {pwaUpdate && <UpdatePrompt {...pwaUpdate} />}
            {debug && <DebugConsole />}
            {debug && <DebugWarnings />}
          </ApiProvider>
        </GlobalStatesProvider>
      </ReduxProvider>
    </LibConfigProvider>
  </ErrorBoundary>
  );
};
