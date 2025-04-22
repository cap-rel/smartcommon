import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";
import { isNil } from "../../../globals";

// TODO open or toggle

export const Overlay = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("overlay", props);
    const { isOpen, close = () => {} } = variantProps;

    return (
        <div { ...mergeProps("overlay", props => ({
            ...props,
            onClick: e => {
                const onClick = props.onClick;
                if (!isNil(onClick)) {
                    onClick(e);
                }
                close();
            },
            className: `fixed z-40 bg-black/50 inset-0 duration-(--quick) ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`
        }))} />
    );
};

Overlay.propTypes = propTypes;