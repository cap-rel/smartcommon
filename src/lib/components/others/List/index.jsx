import { Input } from "../../form";
import { defaultProps, propTypes } from "./props";
import { useVariantMerger } from "../../../hooks";
import { IoSearch } from "react-icons/io5";

export const List = props => {
    const { variantProps, mergeProps } = useVariantMerger("List", props);

    const {
        id,
        responsive = true,
    } = variantProps;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            "data-component": "List",
            className: `
                flex flex-col bg-soft-bg p-app-base gap-app-base shadow-md
                lg:col-span-full lg:rounded-app-md
            `
        }))}>
            <Input { ...mergeProps("SearchbarInput", props => ({
                inputIcon: IoSearch,
                placeholder: "Rechercher ...",
                ...props
            }))} />
        </div>
    );
};

List.propTypes = propTypes;
List.defaultProps = defaultProps;