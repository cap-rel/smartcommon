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
                relative rounded-full w-11 h-6 duration-200 flex-shrink-0
                ${cursor}
                ${checked ? "bg-primary" : "bg-slate-300"}
                ${classNames.input}
            `}
        >
            <div className={`
                absolute top-1 left-1 rounded-full size-4 duration-200
                ${checked ? "translate-x-5 bg-white dark:bg-primary" : "bg-light dark:bg-dark-soft"}
                ${classNames.circle}
            `}/>
        </div>
    );
};