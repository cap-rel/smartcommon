import { useNavigationContext } from "lib/hooks";
import { NavigationContext } from "./context";

export const NavigationProvider = ({ children }) => {
  const nav = useNavigationContext();

  return (
    <NavigationContext.Provider value={nav}>
      {children}
    </NavigationContext.Provider>
  );
};