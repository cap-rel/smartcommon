import { Button } from "../../others";
import { Label } from "../Label";
import { useEffect, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas'
import { useStates } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaEraser, FaSignature, FaUser } from "react-icons/fa6";
import { isNil, mergeProps } from "../../../globals/functions";
import toast from "react-hot-toast";

import { signaturePropTypes } from "./props";
import { signatureVariants } from "./variants";
import { Input } from "../Input";
import { Address } from "../Address";

// TODO faire le required
// TODO faire le disabled

// TODO Settings prop

export const Signature = ({
  id,
  label,
  placeholder = "Signer ici...",
  penColor = "black",
  help,
  icon,
  required,
  readOnly,
  disabled,
  compressionOptions,

  name,
  defaultValue,
  value,
  onChangeValue = () => {},

  variant = "smart",

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  headerAndSignatureContainerProps,
  headerProps,
  clearButtonProps,
  titleProps,
  validateButtonProps,
  signatureContainerProps,
  signatureProps,
  ...props
}) => {
  const signaturePs = { ...props, ...signatureProps };

  const LabelPs = { id, label, help, disabled, required, readOnly, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps };

  const padRef = useRef(null);

  const { states, set } = useStates({
    localValue: defaultValue ?? "",
    isSignatureOpen: false,
  });

  const { localValue, isSignatureOpen } = states;

  const currentValue = value ?? localValue;

  const setValue = (newValue) => {
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  const validate = (e) => {
    e.preventDefault();
    if (padRef.current.isEmpty()) {
      return toast("La signature est vide...");
    }

    setValue(padRef.current.toDataURL());

    toast.success("Signature validée...");
    padRef.current.off();
  };

  const clear = (e) => {
    e.preventDefault();
    padRef.current.on();
    setValue("");
    padRef.current.clear();
  };

  const propParams = {};

  return (
    <Label { ...LabelPs}>
      <input
        name={name}
        onChange={() => {}}
        value={currentValue}
        className={`hidden`}
      />
      <div { ...mergeProps(
        {}, `rounded-md col gap-2 border border-border bg-soft-bg p-4`,
        headerAndSignatureContainerProps, signatureVariants, variant, "headerAndSignatureContainerProps", propParams
      )}>
        {/* <div 
          { ...signatureContainerProps}
          className={twMerge(`relative`, signatureContainerProps?.className)}
        > */}

          <div { ...mergeProps(
            {}, `flex justify-between items-center -mt-2`,
            headerProps, signatureVariants, variant, "headerProps", propParams
          )}>
            <Button
              icon={<FaEraser />}
              variant={`iconButton`}
              className={`text-error -ml-2`}
              onClick={clear}
            />
            <div { ...mergeProps(
              {}, `font-semibold text-strong-text`,
              titleProps, signatureVariants, variant, "titleProps", propParams
            )}>
              {placeholder}
            </div>
            <Button
              icon={<FaSignature />}
              variant={`iconButton`}
              className={`text-success -mr-2`}
              onClick={validate}
            />
          </div>
          <div { ...mergeProps(
            {}, `bg-medium-bg rounded-md h-60`,
            signatureContainerProps, signatureVariants, variant, "signatureContainerProps", propParams
          )}>
            <SignatureCanvas 
              backgroundColor={`transparent`}
              penColor={`black`}
              canvasProps={{
                className: twMerge(`rounded-md w-full h-full`, signatureProps?.className)
              }}
              { ...signaturePs}
              ref={padRef}
            />
          </div>
          <Input
            icon={<FaUser />}
            required
            placeholder={`Nom du signataire`}
            // inputContainerProps={{ className: "bg-medium-bg" }}
          />
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
