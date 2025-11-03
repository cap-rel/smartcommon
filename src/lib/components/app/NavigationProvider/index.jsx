import { createContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const NavigationContext = createContext({
  history: [],
  pathname: null,
  prevPathname: null
});

export const NavigationProvider = (props) => {
  const { children } = props;
  
  const location = useLocation() ?? {};
  const { pathname } = location;

  const [history, setHistory] = useState([]);
  const locationNb = history.length;
//   const prevPathRef = useRef(null);

  useEffect(() => {
    setHistory(prevHistory => {
    //   if (prevHistory[prevHistory.length - 2] === location.pathname) {
    //     return prevHistory.slice(0, -1);
    //   }

      // Sinon, ajouter le nouveau chemin
      return [...prevHistory, location];
    });

    // prevPathRef.current = location.pathname;
  }, [pathname]);

  const prevPathname = locationNb > 1 ? history[locationNb - 2].pathname : null;

  return (
    <NavigationContext.Provider value={{ history, pathname, prevPathname }}>
      {children}
    </NavigationContext.Provider>
  );
};