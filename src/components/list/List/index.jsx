import { twMerge } from "tailwind-merge";

export const List = ({
    list = [],
    listItem = () => {},
    groupedBy,
    listProps,
    ...props
}) => {
    const listPs = { ...props, ...listProps };
    return (
        <div
            { ...listPs}
            className={twMerge(`col gap-4`, listPs?.className)}
        >
            <div className={`text-soft-text font-semibold`}>
                {list.length} éléments
            </div>
            <div className={`col divide-y-auto`}>
                {list.map((item, II) => listItem(item))}
            </div>
        </div>
    );
};