import { Resizable } from "re-resizable";
import { MdOutlineReplay } from "react-icons/md";
import { FaClipboardCheck, FaRegClipboard } from "react-icons/fa6";
import { FaRegSave, FaSave } from "react-icons/fa";

import { useStates } from "lib/hooks";
import { convertCSSVar } from "lib/utils";

// TODO Use var() for variables

export const Variables = () => {
    const getVariable = (variableName) => getComputedStyle(document.documentElement).getPropertyValue(`${variableName}`);
    const setVariable = (variableName, value) => document.documentElement.style.setProperty(variableName, value);

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

    const initialStates = {
        searchbarContent: "",
        variables: Object.fromEntries(variablesName.map(variableName => [variableName, { default: getVariable(variableName), value: getVariable(variableName) }])),
        searchedVariables: "",
        isVariablesCopied: false,
        isVariablesSaved: false,
        isCopyButtonFocused: false
    };

    const { states, set } = useStates({ initialStates });

    const { searchbarContent, variables, searchedVariables, isVariablesCopied, isVariablesSaved, isCopyButtonFocused } = states;

    const handleVariableOnChange = (value, variableName) => { 
        set(`variables.${variableName}.value`, value);
        const { vars, newStr } = convertCSSVar(value);
        console.log(vars, newStr);
        const varsValue = vars.map(varName => getVariable(varName));
        const newValue = `${varsValue.join(" ")} ${newStr}`; 
        setVariable(variableName, newValue);
    };

    const resetVariable = (value, variableName) => {
        const { vars, newStr } = convertCSSVar(value);
        set(`variables.${variableName}.value`, value);
        setVariable(variableName, value);
    };

    const resetAllVariables = () => {
        const resetVariables = Object.fromEntries(Object.entries(variables).map(([variableName, variable]) => [variableName, { value: variable.default, default: variable.default }]));
        set("variables", resetVariables);
        Object.entries(variables).forEach(([variableName, variable]) => setVariable(variableName, variable.default));
    };

    const copyVariablesToClipboard = () => navigator.clipboard.writeText("test").then(() => set("isVariablesCopied", true));

    const saveToLocalStorage = () => {
        set("isVariablesSaved", !isVariablesSaved);
    };

    const handleCopyButtonOnBlur = () => set("isVariablesCopied", false);

    // useEffect(() => console.log(variables), [variables]);

    return (
        <Resizable 
            enable={{ left: true, right: false, top: false, bottom: false }}
            className={`col min-w-40 bg-softest h-full overflow-y-auto`}
        >
            <div className={`sticky top-0 col`}>
                <div className={`text-strongest text-lg uppercase p-6 pb-4 font-semibold truncate`}>
                    Variables Tailwind CSS
                </div>
                <div className={`row items-center gap-4 text-sm px-6 pb-4`}>
                    <button 
                        title={`Sauvegarder les variables`}
                        onClick={saveToLocalStorage}
                        className={`cursor-pointer text-lg duration-200 ${isVariablesSaved ? "text-secondary" : "text-stronger"}`}
                    >
                        {isVariablesSaved ? <FaSave /> : <FaRegSave />}
                    </button>
                    <button 
                        title={`Copier les variables`}
                        onBlur={handleCopyButtonOnBlur}
                        onClick={copyVariablesToClipboard}
                        className={`cursor-pointer text-lg duration-200 ${isVariablesCopied ? "text-secondary" : "text-stronger"}`}
                    >
                        {isVariablesCopied ? <FaClipboardCheck /> : <FaRegClipboard />}
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
                        <li key={`variable${VI}`} className={`row items-center gap-2 odd:bg-softer px-6 py-2`}>
                            <button 
                                title={`Sauvegarder les variables localement`}
                                onClick={saveToLocalStorage}
                                className={`cursor-pointer text-lg duration-200 ${isVariablesSaved ? "text-secondary" : "text-stronger"}`}
                            >
                                {isVariablesSaved ? <FaSave /> : <FaRegSave />}
                                {/* <FaSave className={`absolute-full-center duration-200 ${isVariablesSaved ? "opacity-100" : "opacity-0"}`} />
                                <FaRegSave className={`absolute-full-center duration-200 ${isVariablesSaved ? "opacity-0" : "opacity-100"}`} /> */}
                            </button>
                            <div className={`text-stronger italic line-clamp-1`}>{variableName} :</div>
                            <input 
                                onChange={e => handleVariableOnChange(e.target.value, variableName)}
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