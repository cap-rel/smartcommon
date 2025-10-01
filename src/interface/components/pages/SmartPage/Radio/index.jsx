export const Radio = ({
    checked,
    label,
    onClick
}) => {
    return (
        <div className={`row gap-2 items-center`}>
            <div
                onClick={onClick}
                style={{ transition: "border-color 200ms, background-color 200ms, filter 100ms" }}
                className={`relative cursor-pointer duration-50 size-4 border-2 rounded-full active:brightness-soft shrink-0 ${checked ? "border-primary" : "border-strong"}`}
            >
                <div className={`absolute-full-center duration-200 bg-primary rounded-full ${checked ? "opacity-100 size-2" : "opacity-0 size-0"}`}/>
            </div>
            <div 
                onClick={onClick}
                className={`text-sm text-stronger cursor-pointer`}
            >
                {label}
            </div>
        </div>
      
    );
};