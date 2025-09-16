import { useContext } from "react";
import { VariantsContext } from "../../components/app/VariantsProvider/VariantsContext";
import { isNil } from "../../globals";

export const useVariants = (componentKey) => {
    const context = useContext(VariantsContext);

    if (isNil(context)) {
      throw new Error('useVariants doit être utilisé avec le VariantsProvider');
    }

    return context[componentKey];
};