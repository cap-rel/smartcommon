import { Head, I18nextProvider, ReduxProvider, Router, Toaster } from "./components/app";

import config from "../skels/SmartIntervention/config"
import { useEffect } from "react";
import { isEmpty } from "./globals/functions";
import { useNavigator, useWindow } from "./components/hooks";
import hexToRgba from 'hex-to-rgba';

const App = () => {
  // useEffect(() => {
  //   if (!isEmpty(config.app.colors.primary)) {
  //     document.documentElement.style.setProperty('--primary-color', config.app.colors.primary);
  //     document.documentElement.style.setProperty('--primary-color-rgb', hexToRgba(config.app.colors.primary));
  //   }
  //   if (!isEmpty(config.app.colors.secondary)) {
  //     document.documentElement.style.setProperty('--secondary-color', config.app.colors.secondary);
  //     document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgba(config.app.colors.secondary));
  //   }
  // }, []);

  return (
    <ReduxProvider>
      <I18nextProvider>
          <Head app={config.app} />
          <Router config={config} />
          <Toaster config={config} />
          <svg width="0" height="0">
            <defs>
              <linearGradient id="gradientSvg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "var(--primary-color)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "var(--secondary-color)", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
      </I18nextProvider>
    </ReduxProvider>
  );
};

export default App;