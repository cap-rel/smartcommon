import { applyFunctionIfNotNil } from "../../../../utils";

export const Radio = (props) => {
    const {
        checked,
        onClick,
        disabled,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("radio", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick, e);
            },
            style: { transition: "border 200ms, background-color 200ms, filter 100ms" },
            className: `relative size-6 rounded-full shrink-0 ${checked ? "border-8 border-primary bg-soft-bg" : "border border-strong-bg bg-strong-bg inset-shadow-sm"} ${disabled ? "brightness-soft" : "active:brightness-soft"}`
        }))}/>
    );
};