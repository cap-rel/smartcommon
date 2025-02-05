import { isEmpty } from "../../../globals/functions";
import { Label } from "../../form";
import { Icon } from "../../others";
import { useRef, useState } from "react";
import { propTypes } from "./props";

// TODO faire le required
// TODO faire le disabled

export const Drawing = ({
  label = null,
  id = null,
  help = null,
  rows = 10,
  settings = {},
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {
const labelProps = { id, label, required, help, className };
const inputProps = { id, name, required, disabled };

const padRef = useRef(null);

const [isSignatureValidated, setIsSignatureValidated] = useState(false); 

  return (
    <Label { ...labelProps}>
      <div className="row relative border h-64 w-full">
        {/* <SignaturePad 
          ref={padRef} 
          options={{ 
            minWidth: 2, 
            maxWidth: 3, 
            penColor: "black", 
            backgroundColor: "white" 
          }}
        /> */}
        <div className="col absolute right-0 top-0">
          <button
            onClick={() => {
              if (isSignatureValidated) {
                setIsSignatureValidated(false);
                onChange("");
              } else {
                padRef.current.clear();
              }
            }}                    
            className={`button-smt z-10 p-2 bg-red-500`}
          >
            <Icon
              library={`im`}
              name={`ImCross`}
              className={`text-white text-xl`}
            />
          </button>
          <button
            onClick={() => {
              setIsSignatureValidated(true);
              onChange(padRef.current.toDataURL());
            }}
            className={`button-smt p-2 bg-green-500 `}
          >
            <Icon
              library={`fa`}
              name={`FaCheck`}
              className={`text-white text-xl`}
            />
          </button>
        </div>
        {isSignatureValidated && <><div className="absolute inset-0 bg-black opacity-60"></div>
        <p className="absolute-full-center text-white font-semibold text-2xl">Signé</p></>}
      </div>
    </Label>
  )
};

Drawing.propTypes = propTypes;