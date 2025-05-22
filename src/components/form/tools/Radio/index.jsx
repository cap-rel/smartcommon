import { applyFunctionIfNotNil } from "../../../../globals";

export const Radio = (props) => {
    const {
        checked,
        onClick,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("radio", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick ?? props.onClick, e);
            },
            style: { transition: "border 200ms, background-color 200ms, filter 100ms" },
            className: `relative size-6 rounded-full active:brightness-soft shrink-0 ${checked ? "border-8 border-primary bg-soft-bg" : "border border-strong-bg bg-strong-bg inset-shadow-sm"}`
        }))}/>
    );
};