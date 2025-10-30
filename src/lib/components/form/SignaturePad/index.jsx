import { Button } from "../../others";
import { Label } from "../tools/Label";
import { useEffect, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas'
import { useFile, useLabel, useStates, useValue, useVariantMerger } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaEraser, FaSignature, FaUser } from "react-icons/fa6";
import { applyFunctionIfFunction, applyFunctionIfNotNil, isNil, locate, isEmpty } from "../../../utils/functions";
import toast from "react-hot-toast";

import { propTypes } from "./props";
import { Input } from "../Input";
import { AddressInput } from "../AddressInput";

export const SignaturePad = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("SignaturePad", props);

  const {
    id,
    name,
    defaultValue,
    value,
    onChange,

    disabled,
    required,
    readOnly,

    onError = () => {},
  } = variantProps; 

  const { currentValue, setValue } = useValue(defaultValue ?? { src: "", gpsPoints: [null, null], signer: "" }, value, onChange);

  const { states, set } = useStates({
    isSignatureValidated: false
  });

  const { isSignatureValidated } = states;

  const padRef = useRef(null);

  const blocked = disabled || readOnly;

  useEffect(() => {
    if (!isNil(padRef.current) && blocked) {
      padRef.current.off();
    }
  }, [padRef.current, blocked]);

  const validateCanvas = async () => {
    if (isSignatureValidated) {
      return toast("La signature est déjà validée... Pour refaire la signature cliquez sur la gomme")
    }

    if (padRef.current.isEmpty()) {
      return toast("La signature est vide...");
    }

    if (!blocked) {
      padRef.current.off();
      set("isSignatureValidated", true);

      setValue({ ...currentValue, src: padRef.current.toDataURL() });
      toast.success("Signature validée...");

      locate(
        coords => setValue({ ...currentValue, gpsPoints: coords }),
        error => toast.error("Echec de géolocatisation de la capture.")
      );

    }
  };

  const eraseCanvas = () => {
    // if (isSignatureValidated) {
    //   set("isSignatureValidated", false);
    //   padRef.current.on();
    //   setValue({ ...currentValue, src: "" });
    // }
    
    padRef.current.clear();
    setValue({ ...currentValue, src: "" });
  };

  const errors = {
    required: { 
      condition: required && isEmpty(currentValue.src),
      message: "Ce champ est requis." 
    },
  };

  useEffect(() => {
    Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
  }, [currentValue]);

  return (
    <Label 
      { ...variantProps}
      errors={errors}
      mergeProps={mergeProps}
    >
      <input
        name={name}
        onChange={() => {}}
        value={currentValue.src}
        hidden
      />
      <input
        name={name}
        onChange={() => {}}
        value={currentValue.signer}
        hidden
      />
      {/* TODO gpsPoints is possibly not an array */}
      {/* <input
        name={name}
        onChange={() => {}}
        value={currentValue.gpsPoints[0]}
        hidden
      />
      <input
        name={name}
        onChange={() => {}}
        value={currentValue.gpsPoints[1]}
        hidden
      /> */}

      <div { ...mergeProps("mainContainer", props => ({
        ...props,
        className: `rounded-md flex flex-col gap-app-base border border-border bg-soft-bg p-app-base`
      }))}>
    
        <div { ...mergeProps("header", props => ({
          ...props,
          className: `flex justify-between items-center -m-app-xs`
        }))}>

          <Button { ...mergeProps("EraseButton", props => ({
            icon: FaEraser,
            ...props,
            disabled: blocked,
            buttonProps: {
              ...props.buttonProps,
              className: `bg-soft-bg text-error text-app-lg rounded-app-xl p-app-xs`
            },
            onClick: e => {
              e.preventDefault();
              eraseCanvas();
              applyFunctionIfNotNil(props.onClick, e); 
            }
          }))} />

          <div { ...mergeProps("title", props => ({
            ...props,
            className: `font-app-semibold text-strong-text`
          }))}>
            Signature
          </div>

          <Button { ...mergeProps("ValidateButton", props => ({
            icon: FaSignature,
            ...props,
            disabled: blocked,
            buttonProps: {
              ...props.buttonProps,
              // className: `bg-soft-bg text-success text-app-lg p-app-xs rounded-app-xl`
              className: "opacity-0 text-app-lg p-app-xs"
            },
            onClick: e => {
              e.preventDefault();
              // validateCanvas();
              // applyFunctionIfNotNil(props.onClick, e);
            },
          }))} />
          
        </div>

          <div { ...mergeProps("signatureContainer", props => ({
            ...props,
            className: `bg-strong-bg h-60 inset-shadow-sm`
          }))}>
            <SignatureCanvas { ...mergeProps("Pad", props => ({
              backgroundColor: `transparent`,
              penColor: `black`,
              clearOnResize: false,
              ...props,
              ref: padRef,
              canvasProps: {
                ...props.canvasProps,
                className: `size-full`
              },
              onEnd: () => {
                setValue({ ...currentValue, src: padRef.current.toDataURL() });
              }
            }))} />
          </div>
          <Input { ...mergeProps("SignerInput", props => ({
            // inputIcon: <FaUser />,
            placeholder: "Nom du signataire",
            ...props,
            required: props.required ?? required,
            disabled: props.disabled ?? disabled,
            readOnly: props.readOnly ?? readOnly,
            value: currentValue.signer,
            onChange: value => setValue({ ...currentValue, signer: value }),
            inputContainerProps: {
              ...props.inputContainerProps,
              className: `rounded-none border-0 border-b-2 has-[input:focus]:ring-0 pt-0`
            },
            inputProps: {
              ...props.inputProps,
              className: `text-center`
            }
          }))} />
  
      </div>
    </Label>
  )
};

SignaturePad.propTypes = propTypes
