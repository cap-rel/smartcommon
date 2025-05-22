import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";

export const Signature = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Signature", props);

    const { value } = variantProps;

    const { signature, signer, coordinates, signedAt } = value;

    return (
        <>
            <img { ...mergeProps("img", props => ({
                src: signature,
                ...props,
            }))} />
             {/* <div { ...mergeProps("Signature", props => ({
                ...props,
                ...mergeQuickProps(props, ["value", "icon"]),
                readOnly: true,
            }))}>

            </div> */}
        </>
       
    );
};

Signature.propTypes = propTypes;