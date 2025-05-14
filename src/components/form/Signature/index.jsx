import { Button } from "../../others";
import { Label } from "../Label";
import { useEffect, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas'
import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaEraser, FaSignature, FaUser } from "react-icons/fa6";
import { applyFunctionIfNotNil, isNil } from "../../../globals/functions";
import toast from "react-hot-toast";

import { signaturePropTypes } from "./props";
import { signatureVariants } from "./variants";
import { Input } from "../Input";
import { Address } from "../Address";

// TODO faire le required
// TODO faire le disabled

// TODO Settings prop

// id,
// label,
// placeholder = "Signer ici...",
// penColor = "black",
// help,
// icon,
// required,
// readOnly,
// disabled,
// compressionOptions,

// name,
// defaultValue,
// value,
// onChangeValue = () => {},

// variant = "smart",

// containerProps,
// labelContainerProps,
// labelProps,
// requiredStarProps,
// helpProps,
// headerAndSignatureContainerProps,
// headerProps,
// clearButtonProps,
// titleProps,
// validateButtonProps,
// signatureContainerProps,
// signatureProps,

export const Signature = (props) => {
  const { variantProps, mergeProps, mergeQuickProps, setParams } = useVariantToProps("signature", props);

  const { extractedLabelProps, filteredProps } = useLabel(variantProps);

  const {
    id,
    name,
    defaultValue,
    value,
    onChange,
  } = filteredProps; 

  const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

  const padRef = useRef(null);

  const validateCanvas = () => {
    if (padRef.current.isEmpty()) {
      return toast("La signature est vide...");
    }

    setValue(padRef.current.toDataURL());

    toast.success("Signature validée...");
    padRef.current.off();
  };

  const eraseCanvas = () => {
    padRef.current.on();
    setValue("");
    padRef.current.clear();
  };

  return (
    <Label 
      { ...extractedLabelProps}
      mergeProps={mergeProps}
    >
      <input
        name={name}
        onChange={() => {}}
        value={currentValue}
        hidden
      />
      <div { ...mergeProps("header", props => ({
        ...props,
        className: `rounded-md flex flex-col gap-app-base border border-border bg-soft-bg p-app-base`
      }))}>
        {/* <div 
          { ...signatureContainerProps}
          className={twMerge(`relative`, signatureContainerProps?.className)}
        > */}

          <div { ...mergeProps("header", props => ({
            ...props,
            className: `flex justify-between items-center -m-app-xs`
          }))}>

            <Button { ...mergeProps("EraseButton", props => ({
              icon: <FaEraser />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg text-error text-app-lg rounded-app-xl p-app-xs`
              },
              onClick: e => {
                e.preventDefault();
                eraseCanvas();
                applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
              }
            }))} />

            <div { ...mergeProps("title", props => ({
              ...props,
              className: `font-app-semibold text-strong-text`
            }))}>
              Signature
            </div>

            <Button { ...mergeProps("ValidateButton", props => ({
              icon: <FaSignature />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                className: `bg-soft-bg text-success text-app-lg p-app-xs rounded-app-xl`
              },
              onClick: e => {
                e.preventDefault();
                validateCanvas();
                applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
              }
            }))} />
           
          </div>
          {/* <div className="flex flex-col gap-app-base"> */}

          <div { ...mergeProps("signatureContainer", props => ({
            ...props,
            className: `bg-strong-bg h-60 inset-shadow-sm`
          }))}>
            <SignatureCanvas { ...mergeProps("Signature", props => ({
              backgroundColor: `transparent`,
              penColor: `black`,
              ...props,
              ref: padRef,
              canvasProps: {
                className: `size-full`
              }
            }))} />
          </div>
          <Input { ...mergeProps("SignerInput", props => ({
            icon: <FaUser />,
            ...props,
            inputProps: {
              placeholder: "Nom du signataire",
              ...props.inputProps,
            }
          }))} />
                    {/* </div> */}
            
          
        {/* </div> */}
        {/* <div
          { ...buttonContainerProps}
          className={twMerge(`row-v-center rounded-b-md rounded-t-none`, buttonContainerProps?.className)}
        >
          <Button
            { ...clearButtonProps}
            onClick={clear}
            className={twMerge(`flex-1 p-2 rounded-none rounded-bl-md bg-error col-h-center gap-1 rounded-tl-none`, clearButtonProps?.className)}
          >
            <FaEraser
              { ...clearButtonIconProps}
              className={twMerge(`text-3xl`, clearButtonIconProps?.className)}
            />
            <div
              { ...clearButtonLabelProps}
              className={twMerge(`italic font-semibold`, clearButtonLabelProps?.className)}
            >
              Effacer
            </div>
          </Button>
          <Button
            { ...validateButtonProps}
            disabled={isSignatureValidated}
            onClick={validate}
            className={twMerge(`flex-1 p-2 rounded-none rounded-br-md bg-success col-full-center gap-1 rounded-tr-none`, validateButtonProps?.className)}
          >
            <FaSignature
              { ...validateButtonIconProps}
              className={twMerge(`text-3xl`, validateButtonIconProps?.className)}
            />
            <div
              { ...validateButtonLabelProps}
              className={twMerge(`italic font-semibold`, validateButtonLabelProps?.className)}
            >
              Valider
            </div>
          </Button>
        </div> */}
      </div>
    </Label>
  )
};

Signature.propTypes = signaturePropTypes
