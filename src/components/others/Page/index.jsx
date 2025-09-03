import { useEffect } from "react";
import { useStates, useVariantToProps } from "../../../hooks";

export const Page = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("page", props);

    const { children } = variantProps;

    const { states, set } = useStates({
        init: false
    });

    const { init } = states;

    useEffect(() => set("init", true), []);

    return (
        <div { ...mergeProps("page", props => ({
            ...props,
            className: `fixed inset-0 bg-medium-bg overflow-y-auto text-strong-text text-app-sm duration-(--medium) ${init ? "opacity-100" : "opacity-0"}`
        }))}>
            {children}
        </div>
    );
}