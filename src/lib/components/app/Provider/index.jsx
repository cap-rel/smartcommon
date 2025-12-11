import { AnimatePresence } from "framer-motion";

import { ApiProvider, LibConfigProvider, ReduxProvider, Toaster } from "lib/components";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    
  <LibConfigProvider value={config}>
    <ReduxProvider>
      <ApiProvider>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
        <Toaster />
      </ApiProvider>
    </ReduxProvider>
  </LibConfigProvider>
  );
};