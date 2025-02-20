export const Switch = ({
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
                relative rounded-full w-13 h-7 duration-200 flex-shrink-0
                ${cursor}
                ${checked ? "bg-primary" : "bg-gray-300"}
                ${classNames.input}
            `}
        >
            <div className={`
                absolute top-1 left-1 rounded-full size-5 duration-200
                ${checked ? "translate-x-6 bg-white dark:bg-primary" : "bg-light dark:bg-dark-soft"}
                ${classNames.circle}
            `}/>
        </div>
    );
};