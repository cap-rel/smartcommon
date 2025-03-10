import { Button } from "../../others";
import { Label } from "../Label";
import { useEffect, useRef } from "react";
// import SignaturePad from 'react-signature-pad-wrapper';
// import { SignaturePad } from "signature-pad-package";
import SignatureCanvas from 'react-signature-canvas'
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { FaEraser, FaSignature } from "react-icons/fa6";
import { isEmpty, isNil } from "../../../globals/functions";
import toast from "react-hot-toast";

// TODO faire le required
// TODO faire le disabled

// TODO Settings prop

export const Signature = ({
  label,
  labelRow = false,
  help,
  settings,
  onValueChange = () => {},

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  inputProps,
  signatureContainerProps,
  relativeContainerProps,
  signatureProps,
  filterProps,
  buttonContainerProps,
  clearButtonProps,
  clearButtonIconProps,
  clearButtonLabelProps,
  validateButtonProps,
  validateButtonIconProps,
  validateButtonLabelProps,
  ...props
}) => {
  const inputPs = { ...props, ...inputProps };
  const { required, readOnly, disabled, id, value } = inputPs;

  const inputPsForLabel = { disabled, required, readOnly, id };

  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

  const padRef = useRef(null);

  const { states, set } = useStates({
    isSignatureValidated: false,
    localValue: "",
  })

  const { isSignatureValidated, localValue } = states;

  const realValue = value ?? localValue;

  const validate = (e) => {
    e.preventDefault();
    if (padRef.current.isEmpty()) {
      return toast("La siganture est vide...")
    }
    
    set("isSignatureValidated", true);
    const newValue = padRef.current.toDataURL();
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  const clear = (e) => {
    e.preventDefault();
    if (isSignatureValidated) {
      set("isSignatureValidated", false);
      if (isNil(value)) {
        set("localValue", "");
      } else {
        onValueChange("");
      }
    } else {
      padRef.current.clear();
    }
  };

  return (
    <Label { ...allLabelPs}>
      <input
        { ...inputPs}
        onChange={() => {}}
        value={realValue}
        className={twMerge(`hidden`, inputPs?.className)}
      />
      <div
        { ...signatureContainerProps} 
        className={twMerge(`rounded-md col`, signatureContainerProps?.className)}
      >
        <div 
          { ...relativeContainerProps}
          className={twMerge(`relative`, relativeContainerProps?.className)}
        >
          <SignatureCanvas 
            backgroundColor={`white`}
            penColor={`black`}
            canvasProps={{
              className: twMerge(`rounded-t-md bg-strong border border-b-0 border-soft-border w-full h-50`, signatureProps?.className)
            }}
            { ...signatureProps}
            ref={padRef}
          />
          <div 
            { ...filterProps}
            className={twMerge(`${!isSignatureValidated && "hidden"} absolute inset-0 text-2xl text-white rounded-t-md col-full-center bg-black/50`, filterProps?.className)}
          >
            Signé
          </div>
        </div>
        <div
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
        </div>
      </div>
    </Label>
  )
};

Signature.propTypes = propTypes;
