import { Icon } from "../../../others";

export const Checkbox = ({
    cursor = "cursor-pointer",
    checked,
    onClick,
    classNames = {
        input: null,
        checkIcon: null
    }
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                relative duration-100 size-5 rounded-md flex-shrink-0
                ${cursor}
                ${checked ? "bg-primary" : "bg-slate-300"}
                ${classNames.input}
            `}
        >
            <Icon
                library={`fa6`}
                name={`FaCheck`}
                className={`
                    size-3 duration-100 text-white dark:text-primary
                    ${checked ? "absolute-full-center opacity-100" : "opacity-0 absolute-h-center bottom-0"}
                    ${classNames.checkIcon}
                `}
            />
        </div>
    );
};