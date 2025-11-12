import { Input } from "../../form";
import { defaultProps, propTypes } from "./props";
import { useVariantMerger } from "../../../hooks";
import { IoSearch } from "react-icons/io5";
import { Button } from "../../little";
import { RxCaretSort } from "react-icons/rx";
import { isEmpty, isNil } from "../../../utils";
import { useEffect } from "react";

export const List = props => {
    const { variantProps, mergeProps } = useVariantMerger("List", props);

    const {
        id,
        title,
        pagination = false,
        sortProps = [],
        searchProps = [],
        responsive = true,
        children
    } = variantProps;

    const customerData = [
        { id: 0, name: "Bill", age: 35, email: "bill@company.com" },
        { id: 1, name: "Donna", age: 32, email: "donna@home.org" },
    ];

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: `
                flex flex-col gap-app-xs my-app-base
                lg:col-span-full lg:my-0
            `
            // lg:px-app-base lg:py-app-sm lg:bg-soft-bg lg:rounded-app-md lg:shadow-md
        }))}>
            {title && 
                <div { ...mergeProps("title", props => ({
                    ...props,
                    className: `
                        font-app-semibold text-strong-text text-app-base mx-app-base
                    `
                    // lg:mx-0
                }))}>
                    {title}
                </div>
            }
            <div { ...mergeProps("itemsContainer", props => ({
                ...props,
                "data-component": "List",
                className: `
                    flex flex-col bg-soft-bg p-app-base gap-app-base shadow-md rounded-app-md
                `
                //  lg:shadow-none lg:p-0
            }))}>
                {(!isEmpty(sortProps) || !isEmpty(searchProps)) &&
                    <div { ...mergeProps("controlsContainer", props => ({
                        ...props,
                        className: `
                            flex gap-app-base justify-between
                        `
                    }))}>
                        <Input { ...mergeProps("SearchInput", props => ({
                            inputIcon: IoSearch,
                            placeholder: "Rechercher ...",
                            ...props,
                            containerProps: {
                                ...props.containerProps,
                                className: "grow"
                            } 
                        }))} />
                        <Button
                            icon={RxCaretSort}
                        />
                    </div>
                }
                {children}
                {isEmpty(children) &&
                    <div { ...mergeProps("noElement", props => ({
                        ...props,
                        className: "text-soft-text text-center italic "
                    }))}>
                        Aucun élément trouvé
                    </div>
                }
                {/* {!isNil(pagination) && 
                    <div { ...mergeProps("pagination", props => ({
                    ...props
                    }))}>
                        <div { ...mergeProps("")}>

                        </div>
                    </div>
                } */}
            </div>
        </div>
    );
};

List.propTypes = propTypes;
List.defaultProps = defaultProps;