import { IoMdInformationCircleOutline } from "react-icons/io";
import { isNil, isEmpty, filter, map } from "lodash";

import { twMerge } from "lib/utils";

// IDEA Mini-popup for help

export const Label = (props) => {
    const {
        id,
        label,
        icon,
        help,
        prefix,
        suffix,
        required,
        showErrors,

        errors = {},
        error,
        children,
    } = props;

    // Label is a "dumb" slot component: it normally receives the `mergeProps`
    // produced by a parent's useVariantMerger (Input, Checker, Rater, ...).
    // When a consumer renders <Label> without it (a non-variant parent such as
    // FilesUploader), fall back to a passthrough that still applies each
    // element's default classes plus the consumer's matching `${slot}Props`,
    // instead of crashing on `mergeProps is not a function`.
    // Only failing rules are displayed, once the form has been submitted.
    const failingErrors = showErrors ? filter(errors, { condition: true }) : [];
    const hasError = !isNil(error) || !isEmpty(failingErrors);

    const mergeProps = props.mergeProps ?? ((slotKey, build) => {
        const slotProps = props[`${slotKey}Props`] ?? {};
        const built = build({ ...slotProps });
        return { ...built, className: twMerge(slotProps.className, built.className) };
    });

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
                        // htmlFor is omitted (undefined) when no id is provided,
                        // so React renders no attribute and nothing breaks for
                        // consumers that don't pass an id.
                        htmlFor: id,
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

            {(help || hasError) &&
                <div { ...mergeProps("footer", props => ({
                    ...props,
                    className: `${hasError ? "text-error" : "text-soft-text"} flex gap-app-xxs text-app-xs italic`
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
                        {!isNil(error) &&
                            <div { ...mergeProps("error", props => props)}>
                                {error}
                            </div>
                        }
                        {map(failingErrors, ({ message }, EI) => (
                            <div key={`error${EI}`} { ...mergeProps("error", props => props)}>
                                {message}
                            </div>
                        ))}
                    </div>
                </div>
            }

        </div>
    );
}