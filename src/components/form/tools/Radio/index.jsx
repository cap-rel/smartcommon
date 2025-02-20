import { Icon } from "../../../others";

export const Radio = ({
    cursor = "cursor-pointer",
    checked,
    onClick,
    classNames = {
        input: null,
        circle: null
    }
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                relative duration-50 size-4 rounded-full border-2 flex-shrink-0 box-content
                ${cursor}
                ${checked ? "border-primary" : "border-smt"}
            `}
        >
            <div className={`
                absolute top-1 left-1 duration-50 bg-primary rounded-full
                ${checked ? "size-2 opacity-100" : "opacity-0 size-0"}
                ${classNames.circle}
            `}/>
        </div>
    );
};