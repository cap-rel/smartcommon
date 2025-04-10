import { useEffect } from "react";
import { Head, I18nextProvider, ReduxProvider, ThemesProvider, Toaster, VariantsProvider } from "./components/app";
import { useWindow } from "./hooks";
import { Router } from "./Router";
import { store } from "./reduxStore";
import { i18n } from "./i18n";
import { variants } from "./variants";
import { themes } from "./themes";

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

   {/* For linear-gradient on borders */}
            {/* <svg width="0" height="0">
              <defs>
                <linearGradient id="gradientSvg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg> */}

  return (
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <Head />
        <Router />
        <Toaster />
      </I18nextProvider>
    </ReduxProvider>
  );
};