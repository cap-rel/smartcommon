import React, { useEffect, useState } from "react";
import useStates from "../useStates";
import { Checkbox, FormItem, Input, Select } from "../../dol";
import { isEmpty } from "../../globals/functions";

export const useForm = (form) => {
    const setInitialFormValues = (components) => {
        return components.reduce((acc, component) => {
            if (component.type !== "flex" && component.type !== "tabs") {
                acc[component.id] = component.default || "";
                // { 
                    // prefix: component.inputPrefix || null, 
                    // root: component.default || "", 
                    // suffix: component.inputSuffix || null
                // };
            }

            if (component.children) {
                Object.assign(acc, setInitialFormValues(component.children));
            }

            return acc;
        }, {});
    }

    const setInitialSelectedTabs = (components) => {
        return components.reduce((acc, component) => {
            if (component.type === "tabs") {
                acc[component.id] = component.children[0].id
            }

            if (component.children) {
                Object.assign(acc, setInitialSelectedTabs(component.children));
            }

            return acc;
        }, {});
    }

    const setInitialOpacityTransitionsTabs = (components) => {
        return components.reduce((acc, component) => {
            if (component.type === "tabs") {
                acc[component.id] = false;
            }

            if (component.children) {
                Object.assign(acc, setInitialSelectedTabs(component.children));
            }

            return acc;
        }, {});
    }

    const { states, set } = useStates({
        formValues        : setInitialFormValues(form),
        selectedTabs      : setInitialSelectedTabs(form),
        opacityTransitions: {
                                tabs: setInitialOpacityTransitionsTabs(form)
                            }
    });

    useEffect(() => {

    }, []);

    const setPadding = (parent, component) => {
        return (
            (!isEmpty(parent) && parent.divide) 
                && (parent.direction === "row" 
                    ? (parent.children[0] === component ? "pr-4" : (parent.children[parent.children.length - 1] ? "pl-4" : "px-4")) 
                    : (parent.direction === "column" 
                        && (parent.children[0] === component ? "pb-4" : (parent.children[parent.children.length - 1] ? "pt-4" : "py-4"))))
        )
    }

    const multiple = ["select", "multiSelect", "multiCheckbox", "checkbox", "radio", "array", "boolean"];
    const checkbox = ["checkbox", "multiCheckbox"];
    const select = ["select", "multiSelect"];
    const radio = ["radio"];
    const textarea = ["text"];
    const editor = ["html"];

    const renderComponent = (component, parent) => {
        const { id, type, direction, title, width, tabs, children } = component;
        const basisOnRow = (parent && parent.direction === "row") && `${width || 100 / parent.children.length}%`;
        const widthOnCol = (parent && parent.direction === "column") && ((width && width > 0 && width <= 100) ? `${width}%` : "auto");
    
        switch (type) {
            case "flex":
                return (
                    <div 
                        key={id} 
                        className={`col gap-4`} 
                        style={{ flexBasis: basisOnRow, width: widthOnCol }}
                    >
                        {title && <span className={`text-dol font-semibold`}>{title}</span>}
                        <div 
                            className={`flex ${title ? "gap-4" : "gap-6"}`}
                                // ${component.divide 
                                //     ? (direction === "row" 
                                //         ? "divide-x" 
                                //         : (direction === "column" ? "divide-y" : "gap-4")) 
                                //     : "gap-4"
                                // }
                            style={{ flexDirection: direction }}
                        >
                            {children.map(child => renderComponent(child, component))}
                        </div>
                    </div>
                );
            case "tabs":
                return (
                    <div 
                        key={id} 
                        className="col border-2 divide-y-2 rounded-md" 
                        style={{ flexBasis: basisOnRow, width: widthOnCol }}
                    >
                        <div className={`row-v-center gap-4 px-4 py-2`}>
                            {title && <span className={`text-dol font-semibold`}>{title}</span>}
                            <div className={`row-v-center gap-2`}>
                                {tabs.map((tab, TI) => 
                                    <button
                                        onClick={() => {
                                            if (states.selectedTabs[id] !== children[TI].id) {
                                                set(`opacityTransitions.tabs.${id}`, false);
                                                const timeout = setTimeout(() => {
                                                    set(`selectedTabs.${id}`, children[TI].id);
                                                    set(`opacityTransitions.tabs.${id}`, true);
                                                    return clearTimeout(timeout);
                                                }, 10);
                                            }
                                        }}
                                        className={`p-2 rounded-md
                                            ${states.selectedTabs[id] === children[TI].id ? "text-primary border-primary bg-soft-dol" : "bg-dom button-dol"}
                                        `}
                                    >
                                        {tab}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={`p-4 ${states.opacityTransitions.tabs[id] ? "opacity-100 duration-300" : "opacity-0"}`}>
                            {children.map((child, CI) => 
                                <div className={`${states.selectedTabs[id] !== child.id && "hidden"}`}>
                                    {renderComponent(child, component)}
                                </div>
                            )}
                        </div>
                    </div>
                );  
            default:
                return (
                    <div style={{ flexBasis: basisOnRow, width: widthOnCol }}>
                        <FormItem
                            key={id}
                            value={states.formValues[id]}
                            onChange={(newState) => set(`formValues.${id}`, newState)}
                            { ...component}
                        />
                    </div>
                );
               
        }
    };

    const buildForm = () => { return form.map(component => renderComponent(component, null)) };

    return { formValues: states.formValues, buildForm };
};