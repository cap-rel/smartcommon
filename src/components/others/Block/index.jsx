import { twMerge } from "tailwind-merge";
import { isEmpty } from "../../../globals/functions";

export const Block = ({
    title,
    header,
    footer,
    containerProps,
    titleProps,
    headerProps,
    blockProps,
    footerProps,
    ...props
}) => {
    const blockPs = { ...props, ...blockProps };
    const { children } = blockPs;

    return (
        <div
            { ...containerProps}
            className={twMerge(`col gap-4 p-4`, containerProps?.className)}
        >
            {isEmpty(title) && 
                <div
                    { ...labelProps}
                    className={twMerge(`text-strong-text font-semibold text-lg`, labelProps?.className)}
                >
                    {title}
                </div>
            }
            {isEmpty(header) && 
                <div
                    { ...headerProps}
                    className={twMerge(`text-soft-text`, headerProps?.className)}
                >
                    {header}
                </div>
            }
            <div 
                { ...blockPs}
                className={twMerge(`col gap-4 bg-strong p-4 border border-soft-border`, blockPs?.className)}
            >
                {children}
            </div>
            {isEmpty(footer) && 
                <div
                    { ...footerProps}
                    className={twMerge(`text-soft-text text-sm italic`, footerProps?.className)}
                >
                    {footer}
                </div>
            }
        </div>
    );
}