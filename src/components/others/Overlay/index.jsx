import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";
import { applyFunctionIfNotNil } from "../../../globals";

// TODO open or toggle

export const Overlay = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("overlay", props);
    const { id, isOpen, close = () => {}, onClick = () => {}, zIndex = 40 } = variantProps;

    return (
        <div { ...mergeProps("overlay", props => ({
            ...props,
            onClick: e => {
                close();
                applyFunctionIfNotNil(onClick ?? props.onClick, e);
            },
            style: { "--z-index": zIndex },
            className: `z-(--z-index) fixed bg-black/50 inset-0 duration-(--medium) ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`
        }))} />
    );
};

Overlay.propTypes = propTypes;