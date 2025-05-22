import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./languages/en.json";
import fr from "./languages/fr.json";

const resources = {
  en,
  fr,
};

i18n.use(initReactI18next).init({
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export { i18n, resources };
