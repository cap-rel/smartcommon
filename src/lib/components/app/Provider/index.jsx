import { AnimatePresence } from "framer-motion";
import { LibProvider } from "../LibProvider";
import { NavigationProvider } from "../NavigationProvider";
import { ApiProvider } from "../ApiProvider";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    <LibProvider value={{ config }}>
      {/* <NavigationProvider> */}
        <ApiProvider>
          <AnimatePresence mode="wait">
          {children}
          </AnimatePresence>
        </ApiProvider>
      {/* </NavigationProvider> */}
    </LibProvider>
  );
};