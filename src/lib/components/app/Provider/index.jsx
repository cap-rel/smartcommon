import { createContext } from "react";
import { I18nextProvider } from "../I18nextProvider";

export const LibContext = createContext();

export const Provider = (props) => {
  const { children, mergedClass, config, variants, themes } = props;
  
  return (
    <LibContext.Provider value={{ config }}>
      {children}
    </LibContext.Provider>
  );
};

// TODO find an object to manage mergedClass
// const mergedClass = {
//   duration: ["test", "app", "app-xs"]
// }

// TODO voir la correspondance entre les themes, les variantes et les themes css

// TODO a voir si on met une variante dans une variante

// Pour ignorer les variantes d'un theme => !t ou ["!t"]
// Pour ignorer les variantes d'un theme => !t-variant ou ["!t-variant"]
// Pour ignorer les variantes par défaut => "!d" ou ["!d"]
// Pour ignorer une variante par défaut en particulier => "!d-variant" ou ["!d-variant"]
const config = {
  // Thème sélectionné
  theme: "",
  // Thèmes fournis par le dev => { theme1: {}, theme2: {} }
  themes: {},
  // Variantes fournis par le dev => { Button: { variant1, variant2 } }
  variants: {},
  // Configuration des composants (pour l'instant, il n'y a que les variantes (array, string ou object))
  components: {
    Button: {
      variant: ""
    },
    Spinner: ""
  },
  // Classes qui doivent être prises en compte par le twMerge. Si une classe n'a pas l'air de fonctionner en dev, on la met la dedans
  mergedClass: "",
  // Par défaut en anglais, oui ou non smartcommon est traduit donc utilisation des function de i18next
  translated: true
};

// Deux moyens de faire configurer les variantes des composants par défaut:
// 
// - Configurer par défaut

const useSC = () => {
  return { themes, variants, SCVariantsOnly, SCThemesOnly }
};

// i18n => download JSON files or copy JSON from the site

// useVariantMerge => mergeProps, variantProps, mergeQuickProps, setParams ?
// Provider
// useConfig ou useSmartCommon
