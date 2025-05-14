export const CheckedIcon = ({
    checked,
    icon,
    onClick,
    ...props
}) => {
    return (
        <div 
            style={{ transition: "color 200ms, filter 100ms" }}
            className={`text-app-xl shrink-0 active:brightness-sof ${checked ? "text-primary" : "text-strong-bg"}`}
            onClick={onClick}
        >
            {icon}
        </div>
    );
};