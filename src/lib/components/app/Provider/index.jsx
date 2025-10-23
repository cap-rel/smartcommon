import { createContext } from "react";

export const LibContext = createContext();

export const Provider = (props) => {
  const { children, mergedClass, config, variants, themes, theme, i18n } = props;
  
  return (
    <LibContext.Provider value={{ mergedClass, config, variants, themes, theme, i18n }}>
      {children}
    </LibContext.Provider>
  );
};  
  // const dispatch = useDispatch();

    // const initVariables = variables => {
    //     Object.keys(variables ?? {}).forEach(key => html.style.removeProperty(key));
    // };

    // const setVariables = variables => {
    //     Object.entries(variables ?? {}).forEach(entries => html.style.setProperty(...entries));
    // };

    // useEffect(() => {
    //     dispatch(saveSettings({ lastTheme: theme }));

    //     const currentTheme = themes?.[theme] ?? {};
    //     const lastTheme = themes?.[lastTh] ?? {};

    //     if ("default" in lastTheme) {
    //         initVariables(lastTheme.default?.variables);
    //         initVariables(lastTheme.dark?.variables);
    //     } else {
    //         initVariables(lastTheme.variables);
    //     }

    //     let current = "default";
    //     let last = "dark";

    //     if (darkMode) {
    //         current = "dark";
    //         last = "default"
    //         html.classList.add("dark");
    //     } else {
    //         html.classList.remove("dark");
    //     }

    //     const currentVariables = currentTheme[current]?.variables;
    //     const lastVariables = currentTheme[last]?.variables;

    //     if ("default" in currentTheme) {
    //         const variablesToInit = Object.fromEntries(Object.entries(lastVariables ?? {}).filter(([key, value]) => !Object.keys(currentVariables ?? {}).includes(key)));

    //         setVariables(currentVariables);
    //         initVariables(variablesToInit);
    //     } else {
    //         setVariables(currentTheme.variables);
    //     }

    // }, [theme, themes, darkMode]);