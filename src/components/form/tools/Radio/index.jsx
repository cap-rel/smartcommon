import { twMerge } from "tailwind-merge";
import { mergeProps } from "../../../../globals";

export const Radio = ({
    checked,
    variants,
    variant,
    
    radioProps,
    // radioCircleProps,
    ...props
}) => {
    const radioPs = { ...props, ...radioProps };

    const variantParams = { isChecked: checked };

    return (
        <div
            { ...mergeProps(
                { transition: "border 200ms, background-color 200ms, filter 100ms" }, 
                `relative duration-50 size-6 rounded-full active:brightness-soft shrink-0 ${checked ? "border-8 border-primary bg-soft-bg" : "border border-strong-bg bg-strong-bg"}`,
                radioPs, variants, variant, radioProps, variantParams
            )}
        />
        //     <div 
        //         { ...radioCircleProps}
        //         className={twMerge(`absolute-full-center duration-200 bg-primary rounded-full ${checked ? "opacity-100 size-4" : "opacity-0 size-0"}`, radioCircleProps?.className)}
        //     /> 
        // </div>
    );
};