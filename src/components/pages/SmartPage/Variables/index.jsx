import { useEffect } from "react";
import { useStates } from "../../../../hooks";
import { MdOutlineReplay } from "react-icons/md";
import { isEmpty } from "../../../../globals/functions";
import { Resizable } from "re-resizable";
import { FaClipboardCheck, FaRegClipboard } from "react-icons/fa6";
import { FaRegSave, FaSave } from "react-icons/fa";

// TODO Use var() for variables

export const Variables = () => {
    const getVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(`${variable}`);

    const variablesName = [
        "--color-primary",
        "--color-secondary",
        "--color-success",
        "--color-error", 
        "--color-warning",
        "--color-softest", 
        "--color-softer",
        "--color-soft", 
        "--color-strong",
        "--color-stronger", 
        "--color-strongest",
    ]

    const { states, set } = useStates({
        searchbarContent: "",
        variables: Object.fromEntries(variablesName.map(variableName => [variableName, { variableMode: false, default: getVariable(variableName), value: getVariable(variableName) }])),
        searchedVariables: "",
        isVariablesCopied: false,
        isVariablesSaved: false
    })

    const { searchbarContent, variables, searchedVariables, isVariablesCopied, isVariablesSaved } = states;

    const handleVariableOnChange = (value, variable, variableName) => {        
        const currentValue = variable.variableMode ? getVariable(value) : value;

        set(`variables.${variableName}.value`, value);
        document.documentElement.style.setProperty(`${variableName}`, currentValue);
    };

    const toggleVariableMode = (variable, variableName) => {
        set(`variables.${variableName}.variableMode`, !variable.variableMode);
        const currentValue = variable.variableMode ? variable.value : getVariable(variable.value);

        document.documentElement.style.setProperty(`${variableName}`, currentValue);
    } 

    const resetVariable = (value, variableName) => {
        set(`variables.${variableName}.variableMode`, false);
        set(`variables.${variableName}.value`, value);
        document.documentElement.style.setProperty(`${variableName}`, value);
    };

    const resetAllVariables = () => {
        const resetVariables = Object.fromEntries(Object.entries(variables).map(([variableName, variable]) => [variableName, { variableMode: false, value: variable.default, default: variable.default }]));
        set("variables", resetVariables);
        Object.entries(variables).forEach(([variableName, variable]) => document.documentElement.style.setProperty(`${variableName}`, variable.default));
    };

    const copyVariablesToClipboard = () => {
        set("isVariablesCopied", !isVariablesCopied);
    };

    const saveToLocalStorage = () => {
        set("isVariablesSaved", !isVariablesSaved);
    };

    // useEffect(() => console.log(variables), [variables]);

    return (
        <Resizable 
            enable={{ left: true, right: false, top: false, bottom: false }}
            className={`col min-w-40 bg-softest h-full overflow-y-auto`}
        >
            <div className={`sticky top-0 col`}>
                <div className={`text-strongest text-lg uppercase p-4 font-semibold truncate`}>
                    Variables Tailwind CSS
                </div>
                <div className={`row items-center gap-4 text-sm px-4 pb-2`}>
                    <button 
                        onClick={copyVariablesToClipboard}
                        className={`cursor-pointer text-lg duration-200 ${isVariablesCopied ? "text-secondary" : "text-stronger"}`}
                    >
                        {isVariablesCopied ? <FaClipboardCheck /> : <FaRegClipboard />}
                    </button>
                    <button 
                        title={`Sauvegarder les variables localement`}
                        onClick={saveToLocalStorage}
                        className={`cursor-pointer text-lg duration-200 ${isVariablesSaved ? "text-secondary" : "text-stronger"}`}
                    >
                        {isVariablesSaved ? <FaSave /> : <FaRegSave />}
                        {/* <FaSave className={`absolute-full-center duration-200 ${isVariablesSaved ? "opacity-100" : "opacity-0"}`} />
                        <FaRegSave className={`absolute-full-center duration-200 ${isVariablesSaved ? "opacity-0" : "opacity-100"}`} /> */}
                    </button>
                    <input
                        value={searchbarContent}
                        onChange={e => set("searchbarContent", e.target.value)}
                        className={`grow px-2 pb-1 text-sm outline-none border-b-2 border-soft focus:border-secondary rounded-none duration-100 min-w-0`}
                        placeholder={`Rechercher une variable...`}
                    />
                    <button 
                        onClick={resetAllVariables}
                        className={`text-stronger cursor-pointer text-lg`}
                    >
                        <MdOutlineReplay />
                    </button>
                </div>
            </div>
            <ul className={`col text-sm divide-y divide-soft border-y border-soft`}>
                {Object.entries(variables).map(([variableName, variable], VI) => {
                    return (
                        <li key={`variable${VI}`} className={`row items-center gap-2 odd:bg-softer px-4 py-2`}>
                            <button 
                                onClick={() => toggleVariableMode(variable, variableName)}
                                className={`${variable.variableMode ? "bg-secondary text-white border-secondary active:brightness-soft" : "bg-softest text-stronger hover:brightness-soft active:brightness-strong border-soft"} border-2 duration-100 cursor-pointer rounded-md text-[10px] p-0.5 italic font-extrabold`}
                            >
                                var
                            </button>
                            <div className={`text-stronger italic line-clamp-1`}>{variableName} :</div>
                            <input 
                                onChange={e => handleVariableOnChange(e.target.value, variable, variableName)}
                                value={variable.value}
                                className={`text-strongest appearance-none border-none outline-none grow italic truncate min-w-0`}
                            />
                            <button 
                                onClick={() => resetVariable(variable.default, variableName)}
                                className={`text-stronger cursor-pointer text-lg`}
                            >
                                <MdOutlineReplay />
                            </button>
                        </li>
                    )
                  
                 } )}
            </ul>
        </Resizable>
    );
};