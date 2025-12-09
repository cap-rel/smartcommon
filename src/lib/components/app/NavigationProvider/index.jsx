import { createContext } from "react";

import { useNavigationContext } from "lib/hooks";

export const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  return (
    <NavigationContext.Provider value={useNavigationContext}>
      {children}
    </NavigationContext.Provider>
  );
};