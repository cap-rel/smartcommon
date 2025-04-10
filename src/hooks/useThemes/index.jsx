import { useContext } from "react";
import { isArray, isNil, toArray } from "../../globals";
import { ThemesContext } from "../../components";

export const useThemes = (componentKey) => {
  const context = useContext(ThemesContext);

  if (isNil(context)) {
    throw new Error('useThemes doit être utilisé avec le ThemesProvider');
  }

  const { theme, themes = {} } = context;

  const themeVariant = themes?.[theme]?.[componentKey];

  return isNil(themeVariant) ? [] : toArray(themeVariant);
};