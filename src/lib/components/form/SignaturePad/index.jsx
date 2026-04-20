import toast from "react-hot-toast";
import SignaturePadLib from "signature_pad";
import { useEffect, useRef } from "react";
import { FaEraser, FaSignature } from "react-icons/fa6";
import { isEmpty } from "lodash";

import { Button, Label, Input } from "lib/components";
import { useStates, useField, useVariantMerger } from "lib/hooks";
import { applyFunctionIfNotNil, locate } from "lib/utils/functions";

import { propTypes } from "./props";

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
  } = variantProps;

  const errors = (currentValue) => ({
    required: {
      condition: required && isEmpty(currentValue?.src),
      message: "Ce champ est requis."
    },
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({
    name,
    defaultValue: defaultValue ?? { src: "", signer: "" },
    value,
    onChange,
    errors
  });

  const initialStates = {
    isSignatureValidated: false
  };

  const { states, set } = useStates({ initialStates, debug: false });

  const { isSignatureValidated } = states;

  const canvasRef = useRef(null);
  const padRef = useRef(null);

  // Refs used to keep onEnd always reading the freshest value/setter,
  // since the SignaturePad instance is created once at mount.
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;
  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  const blocked = disabled || readOnly || isFormSubmitting;

  // Mount: set up the underlying signature_pad instance on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "transparent",
      penColor: "black",
      onEnd: () => {
        setValueRef.current({ ...currentValueRef.current, src: pad.toDataURL() });
      }
    });
    padRef.current = pad;

    return () => {
      pad.off();
      padRef.current = null;
    };
  }, []);

  // Enable/disable drawing based on readOnly/disabled/submitting state
  useEffect(() => {
    const pad = padRef.current;
    if (!pad) {
      return;
    }
    if (blocked) {
      pad.off();
    } else {
      pad.on();
    }
  }, [blocked]);

  const validateCanvas = async () => {
    if (isSignatureValidated) {
      return toast("La signature est déjà validée... Pour refaire la signature cliquez sur la gomme");
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
    padRef.current?.clear();
    setValue({ ...currentValue, src: "" });
  };

  return (
    <Label
      { ...variantProps}
      showErrors={isFormSubmitted}
      errors={filteredErrors}
      mergeProps={mergeProps}
    >
      <input
        name={name}
        onChange={() => {}}
        value={currentValue?.src ?? ""}
        hidden
      />
      <input
        name={name}
        onChange={() => {}}
        value={currentValue?.signer ?? ""}
        hidden
      />

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
          <canvas { ...mergeProps("Pad", props => ({
            ...props,
            ref: canvasRef,
            className: `size-full touch-none`
          }))} />
        </div>

        <Input { ...mergeProps("SignerInput", props => ({
          // inputIcon: <FaUser />,
          placeholder: "Nom du signataire",
          ...props,
          required: props.required ?? required,
          disabled: props.disabled ?? disabled,
          readOnly: isFormSubmitting || (props.readOnly ?? readOnly),
          value: currentValue?.signer ?? "",
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
