import { applyFunctionIfNotNil } from "../../../../utils";

export const Switch = (props) => {
    const {
        checked,
        onClick,
        disabled,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("switch", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick, e);
            },
            style: { transition: "background-color 200ms, filter 100ms" },
            className: `relative rounded-full w-11 h-6 shrink-0 ${checked ? "bg-primary" : "bg-strong-bg inset-shadow-sm"} ${disabled ? "brightness-soft" : "active:brightness-soft"}`
        }))}>
            <div { ...mergeProps("switchCircle", props => ({
                ...props,
                className: `absolute top-1 left-1 rounded-full size-4 duration-(--quick) bg-soft-bg ${checked ? "translate-x-5" : "shadow-md"}`
            }))} />
        </div>
    );
};