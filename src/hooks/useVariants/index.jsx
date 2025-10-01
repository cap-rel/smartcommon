import { isNil } from "../../globals";
import { variants } from "../../variants";

export const useVariants = (componentKey) => {
    if (isNil(variants)) {
      throw new Error("Il n'y a pas de variants");
    }

    return variants[componentKey];
};