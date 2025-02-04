import { useRef } from "react";
import { isEmpty } from "../../../globals/functions";
import { Label } from "../../form";
import { Icon } from "../../others";
import { propTypes } from "./props";

export const Files = ({
    label = null,
    id = null,
    help = null,
    min = 0,
    size = null,
    max = null,
    multiple = false,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
  const labelProps = { id, label, required, help, className };
  const inputProps = { id, type: "file", required, disabled };

  const inputRef = useRef(null);

  return (
    <Label { ...labelProps}>
        <div 
            onClick={() => inputRef.current.click()}
            className={`col-full-center gap-2 p-6 rounded-md border border-dol bg-light dark:bg-dark-soft cursor-pointer`}
        >
            <Icon
                library={`fa6`}
                icon={`FaFolderOpen`}
                className={`text-4xl text-primary`}
            />
            <div className={`row-v-center gap-2 text-soft-dol`}>
                <input
                    ref={inputRef}
                    onChange={e => !disabled && onChange(e.target.files[0])}
                    className={`appearance-none bg-transparent w-full file:hidden border-dol cursor-pointer`}
                    { ...inputProps}
                />
                <button 
                    className={`text-xl`}
                    onClick={e => {
                        e.stopPropagation();
                        inputRef.current.value = "";
                        onChange("");
                    }}
                >
                    <Icon
                        library={`io5`}
                        icon={`IoClose`}
                    />
                </button>
            </div>
        </div>
    </Label>
  );
};

// Files.propTypes = propTypes;