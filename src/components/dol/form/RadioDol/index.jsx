import { IconDol } from "../../../dol";
import { propTypes } from "./props";

const RadioDol = ({
    label = null,
    id = null,
    help = null,
    name,
    options,
    variant,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    return (
        <>
            <div id={id} className={`col gap-2`}>
                {label && <span className={`text-dol font-semibold`}>{label}</span>}
                <div className={`wrap-v-center gap-2`}>
                    {options.map((option, OI) => 
                        <label
                            key={name + OI}
                            htmlFor={name + OI}
                            className={`
                                relative row-full-center border py-2 px-4 rounded-md duration-100
                                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                                ${value === option ? (!color && "bg-primary dark:bg-primary-20 dark:border-primary") : "bg-light-soft border-dol dark:bg-transparent"}
                            `}
                            style={{ backgroundColor: (color && value === option) && color }}
                        >
                            <input
                                id={name + OI}
                                type={`radio`}
                                value={option}
                                name={name}
                                checked={value === option}
                                disabled={disabled}
                                onChange={(e) => !disabled && onChange(e.target.value)}
                                className={`hidden`}
                            />
                            <span className={`
                                duration-100
                                ${value === option ? "text-white dark:text-primary" : "text-soft-dol"}
                            `}>
                                {option}
                            </span>
                            {disabled && <div className={`absolute inset-0 z-10 bg-black-10 dark:bg-white-10 rounded-md`}/>}
                        </label>
                    )}
                </div>
            </div>
        </>
    );
};

RadioDol.propTypes = propTypes;

export default RadioDol;