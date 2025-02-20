import { useEffect } from "react";
import { Head, I18nextProvider, ReduxProvider, Router, Toaster } from "./components/app";
import { useWindow } from "./hooks";

export const App = () => {
//   const { darkMode } = useWindow()
//   useEffect(() => {
//     const htmlClasses = document.querySelector("html").classList;
//     if (htmlClasses.contains("dark")) {
//       htmlClasses.remove("dark")
//     } else {
//       htmlClasses.add("dark");
//     }
// }, [darkMode]);

  return (
    <ReduxProvider>
      <I18nextProvider>
          <Head />
          <Router />
          <Toaster />

          {/* For linear-gradient on borders */}
          {/* <svg width="0" height="0">
            <defs>
              <linearGradient id="gradientSvg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg> */}

      </I18nextProvider>
    </ReduxProvider>
  );
};