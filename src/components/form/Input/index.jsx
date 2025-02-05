import { useEffect, useMemo, useRef, useState } from "react";
import { isArrayOfObjects, isEmpty, isObject, isUndefined } from "../../../globals/functions";
import { Label } from "../../form";
import { Help, Icon } from "../../others";
import { useStates, useWindow } from "../../../hooks";
import { propTypes } from "./props";

// TODO Potentiellement améliorer le système de préfixe et suffixe par défaut
// TODO Faire les pattern
// TODO Faire les cas particuliers comme les prix, ...
// TODO Faire le timestamp

//   useEffect(() => {
//     // Valider les props à chaque changement
//     InputSchema
//       .validate(props, { abortEarly: false }) // abortEarly: false pour obtenir toutes les erreurs
//       .then(() => {
//         setValidationError(null);  // Si tout est valide, aucune erreur
//       })
//       .catch((err) => {
//         // Si validation échoue, afficher les erreurs
//         setValidationError(err.errors);
//       });
//   }, [props]);

const DEFAULT_PROPS_TYPE_MAP = {
  varchar  : { type: "text"          , placeholder: null , pictogram: null                                      , min: null, max: null, size: null, pattern: null },
  mail     : { type: "email"         , placeholder: null , pictogram: { library: "md" , name: "MdEmail"        }, min: null, max: null, size: null, pattern: null },
  password : { type: "password"      , placeholder: null , pictogram: { library: "fa6", name: "FaLock"         }, min: null, max: null, size: null, pattern: null },
  phone    : { type: "tel"           , placeholder: null , pictogram: { library: "fa6", name: "FaPhone"        }, min: null, max: null, size: null, pattern: null },
  url      : { type: "url"           , placeholder: null , pictogram: { library: "fa" , name: "FaLink"         }, min: null, max: null, size: null, pattern: null },
  link     : { type: "url"           , placeholder: null , pictogram: { library: "fa" , name: "FaLink"         }, min: null, max: null, size: null, pattern: null },
  ip       : { type: "text"          , placeholder: null , pictogram: { library: "fa6", name: "FaNetworkWired" }, min: null, max: null, size: null, pattern: null },
  date     : { type: "date"          , placeholder: null , pictogram: { library: "fa6", name: "FaCalendarDays" }, min: null, max: null, size: null, pattern: null },
  timestamp: { type: "date"          , placeholder: null , pictogram: { library: "fa6", name: "FaCalendarDays" }, min: null, max: null, size: null, pattern: null },
  time     : { type: "time"          , placeholder: null , pictogram: { library: "io5", name: "IoTime"         }, min: null, max: null, size: null, pattern: null },
  datetime : { type: "datetime-local", placeholder: null , pictogram: { library: "fa6", name: "FaCalendarDays" }, min: null, max: null, size: null, pattern: null },
  // week     :
  // month    :
};

export const Input = ({
    label = null,
    id = null,
    help = null,
    type,
    placeholder,
    pictogram,
    min,
    size,
    max,
    pattern,
    required = false,
    readOnly = false,
    disabled = false,
    // value,
    onChange = () => {},
    className = null,
    color = null,
    note = false
}) => {

  const { 
    type       : defaultType,
    placeholder: defaultPlaceholder,
    pictogram  : defaultPictogram,
    min        : defaultMin,
    max        : defaultMax,
    size       : defaultSize,
    pattern    : defaultPattern 
  } = DEFAULT_PROPS_TYPE_MAP[type] || {};

  const finalPlaceholder = placeholder ?? defaultPlaceholder;
  const finalPictogram   = pictogram   ?? defaultPictogram;
  const finalMin         = min         ?? defaultMin;
  const finalMax         = max         ?? defaultMax;
  const finalSize        = size        ?? defaultSize;
  const finalPattern     = pattern     ?? defaultPattern;

  const labelProps = { id, label, required, help, className, note };
  const inputProps = { id, placeholder: finalPlaceholder, minLength: finalMin, maxLength: finalMax, size: finalSize, pattern: finalPattern, required, readOnly, disabled };

  const { states, set } = useStates({
    isPasswordVisible: false
  })

  const { isPasswordVisible } = states;

  const textareaRef = useRef(null);

  const handleInput = () => {
    // Réinitialise la hauteur pour recalculer
    textareaRef.current.style.height = "auto";
    // Ajuste la hauteur au contenu
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  const Input = () => note ? <textarea></textarea> : <input />;

  const [value, setValue] = useState("");

  return (
   
   <Label { ...labelProps}>

        <div 
          className={`
            rounded-md relative
            ${disabled && "brightness-96 cursor-not-allowed"}
          `}
        >
          {/* {disabled &&
            <div className="absolute inset-0 bg-black opacity-5"/>
          } */}

          {finalPictogram && 
            <div className={`text-2xl absolute-v-center left-2 text-primary`}>
              <Icon
                library={isObject(finalPictogram) ? finalPictogram.library : "fa"}
                name={isObject(finalPictogram) ? finalPictogram.icon : finalPictogram}
              />
            </div>
          }

          <textarea
            ref={textareaRef}
            onInput={handleInput}
            rows={1}
            value={value}
            type={type === "password" ? (isPasswordVisible ? "text" : "password") : defaultType}
            onChange={e => (!readOnly && !disabled) && setValue(e.target.value)}
            className={`
              outline-none bg-light dark:bg-dark-soft py-2 placeholder-smt flex-grow w-full resize-none overflow-hidden
              ${finalPictogram ? "pl-10" : "pl-4"}
              ${(type === "link" || type === "password") ? "pr-9" : "pr-2"}
              ${!note && "hidden"}
            `}
            { ...inputProps}
          ></textarea>
          <input
            type={type === "password" ? (isPasswordVisible ? "text" : "password") : defaultType}
            value={value}
            onChange={e => (!readOnly && !disabled)  && setValue(e.target.value)}
            className={`
              outline-none bg-light dark:bg-dark-soft py-2 placeholder-smt flex-grow w-full focus:ring-1 ring-primary focus:border-primary border border-smt rounded-md truncate
              ${finalPictogram ? "pl-10" : "pl-2"}
              ${(type === "link" || type === "password") ? "pr-9" : "pr-2"}
              ${note && "hidden"}
            `}
            { ...inputProps}
          />
          

          {/* {type === "timestamp" &&
             <input
              type={type === "password" ? (isPasswordVisible ? "text" : "password") : defaultProps.type}
              value={value}
              onChange={(e) => !disabled && onChange(e.target.value)}
              className={`
                outline-none bg-transparent dark:bg-dark-soft border border-smt py-2 focus:border-primary placeholder-smt flex-grow rounded-md truncate w-full
                ${finalPictogram ? "pl-9" : "pl-2"}
                ${(type === "link" || type === "password") ? "pr-9" : "pr-2"}
              `}
              { ...inputProps}
            />
          } */}

          {type === "password" &&
            <button 
              className={`absolute-v-center right-2 text-xl text-soft-smt`}
              onClick={(e) => {
                e.preventDefault();
                set("isPasswordVisible", !isPasswordVisible)
              }}
            >
              <Icon library={`fa6`} name={isPasswordVisible ? "FaEyeSlash" : "FaEye"} />
            </button>
          }

          {type === "link" &&
            <a
              href={value}
              className={`absolute-v-center right-2 text-xl text-soft-smt`}
            >
              <Icon library={`md`} name={`MdAdsClick`} />
            </a>
          }

        </div>

    </Label>
  )
};

Input.propTypes = propTypes;