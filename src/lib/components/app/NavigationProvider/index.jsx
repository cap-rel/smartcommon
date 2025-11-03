import { createContext } from "react";

export const NavigationContext = createContext();

export const NavigationProvider = (props) => {
  const { children } = props;
  
  return (
    <NavigationContext.Provider>
      {children}
    </NavigationContext.Provider>
  );
};