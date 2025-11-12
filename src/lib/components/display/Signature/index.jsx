import { propTypes } from "./props";
import { useStates, useVariantMerger } from "../../../hooks";
import { Popup } from "../../main";

export const Signature = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Signature", props);

    const { value } = variantProps;

    const { signature, signer, coordinates, signedAt } = value;

    const { states, set } = useStates({
        isPopupOpen: false
    });

    const { isOpen } = states;

    return (
        <>
            <img { ...mergeProps("img", props => ({
                src: signature,
                ...props,
            }))} />
            <Popup { ...mergeProps("Popup", props => ({
                ...props,
                className: "",
            }))}>

            </Popup>
        </>
       
    );
};

Signature.propTypes = propTypes;