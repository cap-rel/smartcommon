import { isEmpty } from "../../../../globals/functions";
import { HelpDol, IconDol, LabelDol } from "../..";
import { useEffect, useRef, useState } from "react";
// import SignaturePad from 'react-signature-pad-wrapper';
// import { SignaturePad } from "signature-pad-package";
import SignatureCanvas from 'react-signature-canvas'
import { useStates, useWindow } from "../../../hooks";
import { propTypes } from "./props";

// TODO faire le required
// TODO faire le disabled

const SignatureDol = ({
  label = null,
  id = null,
  help = null,
  settings = null,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {

const labelProps = { id, label, required, help, className };
const inputProps = { id, required, disabled };

const padRef = useRef(null);

const { states, set } = useStates({
  isSignatureValidated: false,
  signature: "",
})

const { isSignatureValidated } = states;

const { darkMode, windowDimension } = useWindow();

  return (
    <LabelDol { ...labelProps}>
      <div className={`col gap-2`}>
        <div className={`relative`}>
          <SignatureCanvas 
            ref={padRef}
            backgroundColor={`white`}
            penColor={`black`}
            canvasProps={{
              // width: windowDimension.width - 32,
              // height: 200,
              className: "rounded-md w-full h-52"
            }} 
          />
          <div className={`${!isSignatureValidated && "hidden"} absolute inset-0 rounded-md col-full-center bg-black-70`}>
            <span className={`text-white text-2xl`}>Signé</span>
          </div>
        </div>
        <div className={`row-between-center`}>
          <button
            className={`bg-error p-2 rounded-md text-white button-dol`}
            onClick={e => {
              e.preventDefault();
              set("isSignatureValidated", false);
              padRef.current.clear();
            }}
          >
            Supprimer
          </button>
          <button
            disabled={isSignatureValidated}
            className={`bg-success p-2 rounded-md text-white ${isSignatureValidated ? "brightness-50 cursor-not-allowed" : "button-dol"}`}
            onClick={e => {
              e.preventDefault();
              set("isSignatureValidated", true);
              onChange(padRef.current.toDataURL());
            }}
          >
            Valider
          </button>
        </div>
      </div>
    </LabelDol>
  )
};

SignatureDol.propTypes = propTypes;

export default SignatureDol;
