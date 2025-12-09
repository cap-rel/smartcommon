import { AnimatePresence } from "framer-motion";

import { ApiProvider, LibConfigProvider, NavigationProvider, ReduxProvider } from "lib/components";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    
  <LibConfigProvider value={config}>
    <ReduxProvider>
      <ApiProvider>
        {/* <NavigationProvider> */}
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        {/* </NavigationProvider> */}
      </ApiProvider>
    </ReduxProvider>
  </LibConfigProvider>
  );
};