import { AnimatePresence } from "framer-motion";
import { LibProvider } from "../LibProvider";
import { NavigationProvider } from "../NavigationProvider";

export const Provider = (props) => {
  const { children, config } = props;
  // TODO voir à quoi sert réellement AnimatePresence car ça fonctionne sans
  return (
    <LibProvider value={{ config }}>
      <NavigationProvider>
        <AnimatePresence mode="wait">
        {children}
        </AnimatePresence>
      </NavigationProvider>
    </LibProvider>
  );
};