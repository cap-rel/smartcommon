import { applyFunctionIfNotNil } from "../../../../globals";

export const Icon = (props) => {
    const {
        icon,
        checked,
        onClick,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("icon", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick ?? props.onClick, e);
            },
            style: { transition: "color 200ms, filter 100ms" },
            className: `text-app-xl shrink-0 active:brightness-sof ${checked ? "text-primary" : "text-strong-bg"}`
        }))}>
            {icon}
        </div>
    );
};