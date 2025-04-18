import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";

export const Overlay = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("overlay", props);
    const { isOpen, close = () => {} } = variantProps;

    return (
        <div { ...mergeProps("overlay", props => ({
            ...props,
            onClick: e => {
                props.onClick(e);
                close();
            },
            className: `fixed z-40 bg-black/50 inset-0 duration-(--medium) ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`
        }))} />
    );
};

Overlay.propTypes = propTypes;