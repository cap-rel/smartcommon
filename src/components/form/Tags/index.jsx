import { useState } from "react";
import { isEmpty } from "../../../../globals/functions";
import { Help, Icon } from "../../../dol";
import { RxCross2 } from "react-icons/rx";
import { propTypes } from "./props";

// TODO Faire les pattern

export const Tags = ({
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
    <div className={`col gap-2`}>
        {label && <label htmlFor={id} className={`text-soft-dol font-semibold`}>{label}</label>}     
        <div 
          className={`
            bg-dol row-v-center border dark:border-gray-600 
            rounded-md flex-grow ${disabled && "brightness-75 cursor-not-allowed"} p-2
          `}
        >


          {/* Tags */}
          <div className="wrap gap-2 flex-grow">
            {value.map((tag, TI) => (
              <div key={TI} className="bg-primary-20 border border-primary row-v-center gap-2 rounded-md p-2">
                <p className="text-primary font-semibold">{tag}</p>
                <Icon 
                  library={`rx`}
                  icon={`RxCross2`}
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
              className={`flex-grow border focus:ring-1 ring-primary outline-none bg-soft-dol border-dol rounded-md p-2 placeholder-dol`}
            />
          </div>

        </div>
        </div>

  )
};

Tags.propTypes = propTypes;
