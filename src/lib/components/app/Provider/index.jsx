import { AnimatePresence } from "framer-motion";
import { LibConfigProvider } from "../LibConfigProvider";
import { ReduxProvider } from "../ReduxProvider";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    
  <LibConfigProvider value={config}>
    <ReduxProvider>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </ReduxProvider>
  </LibConfigProvider>
  );
};