import { isEmpty, isNil } from "../../../../globals";
import { IoMdInformationCircleOutline } from "react-icons/io";

// IDEA Mini-popup for help

export const Label = (props) => {
    const { 
        mergeProps,
        // id,
        label,
        icon,
        help,
        prefix,
        suffix,
        required,
        formSubmitted,
        errors = {},
        children,
    } = props;

    const currentErrors = Object.values(errors).filter(error => error.condition);

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: `flex flex-col gap-app-sm min-w-0`
        }))}>

            {!isNil(label) && 
                <div { ...mergeProps("labelContainer", props => ({
                    ...props,
                    className: `gap-app-xs flex items-center`
                }))}>

                    {!isNil(icon) && 
                        <div { ...mergeProps("icon", props => ({
                            ...props,
                            className: ``
                        }))}>
                            {icon}
                        </div>
                    }

                    <label { ...mergeProps("label", props => ({
                        ...props,
                        className: `font-app-semibold`,
                        // htmlFor: id
                    }))}>
                        {label}
                    </label>

                    {required && 
                        <div { ...mergeProps("star", props => ({
                            ...props,
                            className: `text-error`
                        }))}>
                            *
                        </div>
                    }

                    {/* {help && <Help content={help} />} */}
                </div>
            }
            
            <div { ...mergeProps("childrenContainer", props => ({
                ...props,
                className: `flex gap-app-xs`
            }))}>

                {!isNil(prefix) &&
                    <div { ...mergeProps("prefix", props => props)}>
                        {prefix}
                    </div>
                }

                {children}

                {!isNil(suffix) &&
                    <div { ...mergeProps("suffix", props => props)}>
                        {suffix}
                    </div>
                }

            </div>

            {(help || (!isEmpty(currentErrors) && formSubmitted)) &&
                <div { ...mergeProps("footer", props => ({
                    ...props,
                    className: `${(formSubmitted && !isEmpty(currentErrors)) ? "text-error" : "text-soft-text"} flex gap-app-xxs text-app-xs italic`
                }))}>
                    <IoMdInformationCircleOutline { ...mergeProps("helpIcon", props => ({
                        ...props,
                        className: `text-app-md`
                    }))} />
                    <div { ...mergeProps("helpAndErrorsContainer", props => ({
                        ...props,
                        className: `flex flex-col`
                    }))}>
                        <div { ...mergeProps("help", props => props)}>{help}</div>
                        {formSubmitted &&
                            currentErrors.map((error, EI) => {
                                const { condition, message } = error;
                                if (condition) {
                                    return (
                                        <div key={`error${EI}`} { ...mergeProps("error", props => props)}>
                                            {message}
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                </div>
            }

        </div>
    );
}