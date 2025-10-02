import { isNil, toArray } from "../../utils";
import { themes } from "../../themes";

export const useThemes = (componentKey) => {
  if (isNil(themes)) {
      throw new Error("Il n'y a pas de variants");
    }

  const { theme, th = {} } = themes;

  const themeVariant = th?.[theme]?.[componentKey];

  return isNil(themeVariant) ? [] : toArray(themeVariant);
};