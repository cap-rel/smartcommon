import { Select, Input, Icon } from "../../dol";

export const IconInput = (props) => {
    const {
        id,
        label,
        color,
        value,
        onChange,
        disabled,
        required,
        className
    } = props;

    const reactLibraries = [
        { label: "Font Awesome 5", value: "fa" },
        { label: "Font Awesome 6", value: "fa6" },
        { label: "Ionicons 4", value: "io" },
        { label: "Ionicons 5", value: "io5" },
        { label: "Material Design Icons", value: "md" },
    ]

    return (
        <div className={`col gap-4 ${className}`}>
            {label && <label htmlFor={id} className={`text-dol font-semibold`}>{label}</label>}
            <div className={`row-v-center border border-dol rounded-md self-start`}>
                <div className={`col divide-y divide-dol`}>
                    <div className={`relative text-dol bg-soft-dol button-dol rounded-tl-md border-r border-dol`}>
                        <select 
                            value={value.library}
                            onChange={(e) => onChange({ ...value, library: e.target.value })}
                            className={`py-2 pl-2 pr-7 appearance-none bg-soft-dol w-full rounded-tl-md`}
                        >
                            <option disabled={true} value={""}>Librairie ...</option>
                            {reactLibraries.map((library, LI) => 
                                <option key={LI} value={library.value}>{library.label}</option>
                            )}
                        </select>
                        <span className={`absolute-v-center right-2 z-10 pointer-events-none`}>
                            <Icon library={`io`} icon={`IoIosArrowDown`} />
                        </span>
                    </div>
                    <input
                        className={`rounded-bl-md bg-transparent p-2 outline-none placeholder-dol border-r border-dol`}
                        placeholder={`Icône ...`}
                        type={"varchar"} value={value.icon}
                        onChange={(e) => onChange({ ...value, icon: e.target.value })}
                    />
                </div>
                <span className={`text-5xl w-18 text-primary`}>
                    <Icon library={value.library} icon={value.icon} className={`mx-auto`} />
                </span>
            </div>
        </div>
    );
};