import hexToRgba from "hex-to-rgba";
import { isEmpty, isUndefined } from "../../../../globals/functions";
import { IconDol, LabelDol } from "../../../dol";
import { useWindow } from "../../../hooks";

export const RadioImgDol = (props) => {
  const {
    label, 
    id,
    help,
    name,
    inputId,  
    required, 
    disabled,
    options, 
    value,
    onChange,   
    className,
    color
  } = props;


  const labelProps = { id, label, required, help, className };
  const radioProps = { required, disabled };

  const finalName = !isUndefined(name) ? name : (!isUndefined(inputId) && inputId);

  const { darkMode } = useWindow();

  return (
    <LabelDol { ...labelProps}>
        <div className={`grid grid-cols-4 gap-4`}>
            {options.map((option, OI) =>
                <label 
                    key={OI}
                    htmlFor={finalName + OI}
                    className={`col gap-2 px-4 py-2 border rounded-md border-dol`}
                    style={{ backgroundColor: darkMode ? option.colors.dark : option.colors.light }}
                >
                    <div 
                        className={`border-x-2 border-b-2 border-t-4 relative row h-16 rounded-md`}
                        style={{ 
                            borderColor: option.colors.primary,
                            // background: `linear-gradient(to right, ${hexToRgba(option.colors.primary)}, ${hexToRgba(option.colors.dark)})`
                        }}
                    >
                        {/* <div className={`rounded-l-md flex-grow`} style={{ backgroundColor: option.colors.primary }} />
                        {option.colors.secondary && <div className={`h-full flex-grow`} style={{ backgroundColor: option.colors.secondary }} />}
                        <div className={`h-full flex-grow`} style={{ backgroundColor: "white" }} />
                        <div className={`rounded-r-md h-full flex-grow`} style={{ backgroundColor: "gray" }} /> */}
                        <div 
                            className={`flex-grow h-full`} 
                             style={{ backgroundColor: hexToRgba(option.colors.primary, darkMode ? 0.4 : 1) }}
                        />
                        <div 
                            className={`flex-grow h-full`}
                            // style={{ backgroundColor: option.colors.dark }}
                        />

                        <div className={`absolute inset-0 p-2`}>
                            <div 
                                className={`border-2 h-full row bg-dol relative`} 
                                style={{ 
                                    borderColor: option.colors.secondary || option.colors.primary,
                                    backgroundColor: darkMode ? option.colors.dark : option.colors.light
                                    // background: `linear-gradient(to left, ${hexToRgba(option.colors.secondary || option.colors.primary, 0.5)}, ${hexToRgba(option.colors.dark)})`
                                }}
                            >
                                <div 
                                    className={`flex-grow h-full`}
                                    // style={{ backgroundColor: option.colors.dark }}
                                />
                                <div 
                                    className={`flex-grow h-full`} 
                                    // style={{ backgroundColor: hexToRgba(option.colors.primary || option.colors.primary, 0.2) }} 
                                />
                                <IconDol library={`io5`} icon={`IoClose`} className={`absolute top-0.5 right-0.5`} style={{ color: option.colors.primary }}/>
                                <IconDol library={`fa6`} icon={`FaArrowPointer`} className={`absolute-v-center left-1`} style={{ color: option.colors.secondary || option.colors.primary }}/>
                            </div>
                        </div>
                    </div>
                    <div className={`row-v-center gap-2`}>
                        <input
                            type={`radio`}
                            name={finalName}
                            id={finalName + OI}
                            value={option.value}
                            checked={value === option.value}
                            onChange={e => !disabled && onChange(e.target.value)}
                            className={`hidden`}
                            { ...radioProps}
                        />
                        <span 
                            className={`relative h-4 w-4 border rounded-full duration-100 ${value === option.value ? "border-primary" : "bg-transparent border-dol"}`} 
                            style={{ backgroundColor: value === option.value && option.colors.primary}}
                        >
                            <span className={`absolute-full-center h-2 w-2 bg-white rounded-full duration-100 ${value === option.value ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        <span className={`${value === option.value ? "text-dol" : "text-soft-dol"} duration-200`}>
                            {option.label}
                        </span>
                    </div>
                </label>
            )}
        </div>
    </LabelDol>
  );
};