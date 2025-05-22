import { FaCheck } from "react-icons/fa6";
import { applyFunctionIfNotNil } from "../../../../globals";

export const Checkbox = (props) => {
    const {
        checked,
        onClick,
        mergeProps,
    } = props;

    return (
        <div { ...mergeProps("checkbox", props => ({
            ...props,
            onClick: e => {
                applyFunctionIfNotNil(onClick ?? props.onClick, e);
            },
            style: { transition: "background-color 200ms, filter 100ms" },
            className: `relative size-6 rounded-md shrink-0 active:brightness-soft ${checked ? "bg-primary" : "bg-strong-bg inset-shadow-sm"}`
        }))}>
            <FaCheck { ...mergeProps("checkboxIcon", props => ({
                ...props,
                className: `size-4 absolute left-1 duration-200 text-white ${checked ? "bottom-1 opacity-100" : "bottom-0 opacity-0"}`
            }))} />
        </div>
    );
};