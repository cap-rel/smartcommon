import { isEmpty, isNil, mergeProps } from "../../../globals/functions";

// IDEA Mini-popup for help

// TODO help

export const Label = (props) => {
    const { 
        mergeProps,
        id,
        label,
        prefix,
        suffix,
        required,
        children,
    } = props

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: `flex flex-col gap-app-xs`
        }))}>

            {!isNil(label) && 
                <div { ...mergeProps("labelContainer", props => ({
                    ...props,
                    className: `gap-app-xs flex items-center`
                }))}>

                    <label { ...mergeProps("label", props => ({
                        ...props,
                        className: `text-strong-text`,
                        htmlFor: id
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
                    <div { ...mergeProps("prefix", props => ({
                        ...props,
                        className: `text-strong-text`
                    }))}>
                        {prefix}
                    </div>
                }

                {children}

                {!isNil(suffix) &&
                    <div { ...mergeProps("suffix", props => ({
                        ...props,
                        className: `text-strong-text`
                    }))}>
                        {suffix}
                    </div>
                }

            </div>

        </div>
    );
}