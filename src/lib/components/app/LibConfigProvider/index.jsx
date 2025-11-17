import { createContext } from "react";
import { I18nextProvider } from "../I18nextProvider";

export const LibConfigContext = createContext();

export const LibConfigProvider = (props) => {
  const { children, value } = props;
  
  return (
    <LibConfigContext.Provider value={value}>
      {children}
    </LibConfigContext.Provider>
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
  // Configuration des composants (pour l'instant, il n'y a que les variantes (array, string ou object))
  // On pourrait rajouter les erreurs pour les composants de formulaire
  components: {
    // Thème sélectionné
    theme: "",
    // Thèmes fournis par le dev => { theme1: {}, theme2: {} }
    themes: {},
    // Variantes fournies par le dev => { Button: ["variant1", "variant2"] }. Si un thème existant est fourni, ils fusionnent (Button => Button)
    variants: {},
    tailwindCss: {
    // Classes qui doivent être prises en compte par le twMerge. Si une classe n'a pas l'air de fonctionner en dev, on la met la dedans
      mergedClass: "",
    },
    Button: {
      variant: ""
    },
    Spinner: ""
  },
  // Par défaut en anglais, oui ou non smartcommon est traduit donc utilisation des function de i18next
  i18n: {
    translated: true
  },
  storage: {
    db: {
      compression: {}
    },
    local: {
      compression: {}
    },
    session: {
      compression: {}
    }
  },
  globalState: {
    reducers: {}
  },
  auth: {
    api: {
      // l'url pourrait être une simple url (string) ou un objet d'url et on pourrait sélectionner la clé
      url: "",
      // Pour donner des clés à différents chemins
      paths: {},
      errors,
    }
  },
  // Pour le hook compression (useCompression ? useFile)
  compression: {

  },

};

// Deux moyens de faire configurer les variantes des composants par défaut:
// 
// - Configurer par défaut

// i18n => download JSON files or copy JSON from the site

// useVariantMerge => mergeProps, variantProps, mergeQuickProps, setParams ?
// Provider
// useConfig ou useSmartCommon ou useComponents
