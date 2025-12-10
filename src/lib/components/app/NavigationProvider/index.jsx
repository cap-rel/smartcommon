import { createContext } from "react";

import { useNavigationContext } from "lib/hooks";

export const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const nav = useNavigationContext();

  return (
    <NavigationContext.Provider value={nav}>
      {children}
    </NavigationContext.Provider>
  );
};