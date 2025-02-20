import { useState } from "react";
import { isEmpty } from "../../../globals/functions";
import { Help, Icon } from "../../others";
import { propTypes } from "./props";

// TODO Faire les pattern

export const Array = ({
  label = null,
  id = null,
  help = null,
  placeholder = null,
  min = 0,
  size = null,
  max = null,
  variant,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {
  const finalPlaceholder = placeholder || "Ecrire ici pour ajouter ..."

  const [newTag, setNewTag] = useState("");

  return (
    <div className={`gap-2 col`}>
        {label && <label htmlFor={id} className={`font-semibold text-soft-smt`}>{label}</label>}     
        <div 
          className={`
            bg-smt row-v-center border dark:border-gray-600 
            rounded-md flex-grow ${disabled && "brightness-75 cursor-not-allowed"} p-2
          `}
        >


          {/* Tags */}
          <div className="flex-grow gap-2 wrap">
            {value.map((tag, TI) => (
              <div key={TI} className="gap-2 p-2 rounded-md border bg-primary-20 border-primary row-v-center">
                <p className="font-semibold text-primary">{tag}</p>
                <Icon 
                  library={`rx`}
                  name={`RxCross2`}
                  className="text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    const newTags = [...value];
                    newTags.splice(TI, 1);
                    onChange(newTags);
                  }}
                />
              </div>
            ))}

            {/* Textarea */}
            <input
              id={id}
              placeholder={finalPlaceholder}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.target.value.trim() && e.key === "Enter") {
                  onChange([...value, e.target.value.trim()]);
                  setNewTag("");
                }
              }}
              className={`flex-grow p-2 rounded-md border outline-none focus:ring-1 ring-primary bg-soft-smt border-smt placeholder-smt`}
            />
          </div>

        </div>
        </div>

  )
};

Array.propTypes = propTypes;
