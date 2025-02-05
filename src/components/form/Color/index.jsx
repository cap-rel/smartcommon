import { HexColorPicker } from "react-colorful";
import { useStates } from "../../../hooks";
import { Input, Label } from '../../form';
import { Icon } from "../../others"; 
import rgbHex from 'rgb-hex';
import hexRgb from 'hex-rgb';
import { isNumber } from "../../../globals/functions";
import { defaultColors } from "./data";
import { propTypes } from "./props";

export const Color = ({
    label = null,
    id = null,
    help = null,
    picker = false,
    alertLabel = null,
    readOnly = false,
    required = false, // TODO
    disabled = false, // TODO
    value,
    onChange = () => {},
    className = null,
    color = null, // TODO
}) => {
    const { states, set } = useStates({
        isColorPickerOpened: false,
        hexInput: "",
        redInput: "",
        greenInput: "",
        blueInput: ""
    })

    const classicColors = Object.entries(defaultColors).map(([colorKey, color]) => color.middle);

    const { isColorPickerOpened, hexInput, redInput, greenInput, blueInput } = states;

    const finalValue = value || "#00000000"

    const { red, green, blue } = hexRgb(finalValue);

    return (
        <>
            <div className={`row-v-center gap-4 ${className}`}>
                <button 
                    onClick={() => set("isColorPickerOpened", true)}
                    style={{ backgroundColor: value, borderColor: value }}
                    className={`
                        cursor-pointer rounded-full h-6 w-6 border-2
                        ${!value && "border-smt"}
                    `}
                />
                {label && <span>{label}</span>}
            </div>
            <div className={`${isColorPickerOpened ? "alert-smt opacity-100 duration-300" : "fixed opacity-0"}`}>
                <div className={`${isColorPickerOpened ? "col-full-center" : "hidden"}`} onClick={(e) => e.stopPropagation()}> 
                    <div className={`rounded-md bg-smt p-12 relative`}>
                        <button 
                            onClick={() => set("isColorPickerOpened", false)}
                            className={`bg-smt p-1 rounded-full button-smt text-soft-smt text-2xl absolute right-2 top-2`}
                        >
                            <Icon library={`io5`} name={`IoClose`}/>
                        </button>
                        <div className={`col gap-6`}>
                        <Label label={alertLabel || label}>
                                <div className={`grid grid-cols-9 gap-4`}>
                                    {[...classicColors, null].map((defaultColor, DCI) =>
                                        <button
                                            key={DCI}
                                            className={`
                                                relative rounded-full w-8 h-8 duration-100 border-2
                                                ${!defaultColor && "border-smt"}
                                            `}
                                                // ${value === defaultColor && "border-dark dark:border-light"}
                                            style={{ 
                                                backgroundColor: defaultColor,
                                                // borderColor: (value !== defaultColor && defaultColor) && defaultColor 
                                                borderColor: defaultColor 
                                            }}
                                            onClick={() => onChange(!defaultColor ? null : defaultColor)}
                                        >
                                            <Icon 
                                                library={`fa6`} name={`FaCheck`}
                                                className={`${defaultColor ? "text-white" : "text-light-text"} dark:text-white text-lg absolute-full-center ${value !== defaultColor && "hidden"}`}
                                            />
                                        </button>
                                    )}
                                </div>
                            </Label>
                            {picker && 1 == 2 && 
                                <div className={`row gap-6`}>
                                    <div>
                                        <HexColorPicker 
                                            color={finalValue}
                                            onChange={value => !disabled && onChange(value)}
                                        />
                                    </div>
                                    <div className="col gap-6 text-smt">
                                        {/* {alertLabel || label && <span className="font-semibold text-base">{alertLabel || label}</span>} */}
                                        <Label label={`HEX`}>
                                            <div className={`row-v-center gap-2`}>
                                                <Input
                                                    placeholder={value || "Pas de couleur"}
                                                    value={hexInput}
                                                    onChange={value => !disabled && set("hexInput", value)}
                                                    className={`flex-grow`}
                                                />
                                                <button
                                                    className={`font-semibold button-smt rounded-md p-2 text-white dark:text-primary border border-primary bg-primary dark:bg-primary-10`}
                                                    onClick={() => (!disabled && hexInput) && onChange(hexInput)}
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </Label>
                                        <Label label={`RGB`}>
                                            <div className={`row-v-center gap-2`}>
                                                <Input
                                                    placeholder={red}
                                                    value={redInput}
                                                    onChange={value => (!disabled && value.length <= 3) && set("redInput", value)}
                                                    className={`w-16`}
                                                />
                                                <Input
                                                    placeholder={green}
                                                    value={greenInput}
                                                    onChange={value => (!disabled && value.length <= 3) && set("greenInput", value)}
                                                    className={`w-16`}
                                                />
                                                <Input
                                                    placeholder={blue}
                                                    value={blueInput}
                                                    onChange={value => (!disabled && value.length <= 3) && set("blueInput", value)}
                                                    className={`w-16`}
                                                />
                                                <button
                                                    className={`button-smt font-semibold rounded-md p-2 text-white dark:text-primary border border-primary bg-primary dark:bg-primary-10`}
                                                    onClick={() => {
                                                        if (!disabled && (redInput || greenInput || blueInput)) {
                                                            const isNumberInvalid = (number) => (!number || !isNumber(number) || number < 0 || number > 255);                                                        
                                                            const r = Number(isNumberInvalid(Number(redInput)) ? red : redInput);
                                                            const g = Number(isNumberInvalid(Number(greenInput)) ? green : greenInput);
                                                            const b = Number(isNumberInvalid(Number(blueInput)) ? blue : blueInput);

                                                            onChange(`#${rgbHex(r, g, b)}`)
                                                            set("redInput", "");
                                                            set("greenInput", "");
                                                            set("blueInput", "");
                                                        }
                                                    }}
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </Label>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

Color.propTypes = propTypes;