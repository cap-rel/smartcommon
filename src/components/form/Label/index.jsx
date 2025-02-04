import { useNavigator } from "../../../hooks";
import { Icon, Help } from "../../others";
import { propTypes } from "./props";

export const Label = ({
    id = null, 
    label = null, 
    required = false,
    help = null,
    className = null,
    note = false,
    children = null
}) => {
    const { deviceType } = useNavigator();

    return (
        <div className={`col ${deviceType === "desktop" ? "gap-4" : "gap-2"} ${className}`}>
            {label && 
                <div className={`row-v-center gap-2`}>
                    {note && <Icon library={`fa`} icon={`FaCircle`} className={`text-[8px] text-note`} />}
                    <label 
                        htmlFor={id}
                        className={`text-dol font-semibold`}
                    >
                        {label}
                    </label>
                    {required && <span className={`text-red-500`}>*</span>}
                    {help && <Help content={help} />}
                </div>
            }
            {children}
        </div>
    );
}

Label.propTypes = propTypes;