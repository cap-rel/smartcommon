import { applyFunctionIfNotNil } from "../../../../utils";

export const Icon = (props) => {
    const {
        icon,
        checked,
        onClick,
        disabled,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("checkedIcon", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick, e);
            },
            style: { transition: "color 200ms, filter 100ms" },
            className: `text-app-xl shrink-0 ${checked ? "text-primary" : "text-strong-bg"} ${disabled ? "brightness-soft" : "active:brightness-soft"}`
        }))}>
            {icon}
        </div>
    );
};