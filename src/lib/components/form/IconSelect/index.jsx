// import { useEffect, useMemo, useRef } from "react";
// import * as fa from "react-icons/fa";
// import * as fa6 from "react-icons/fa6";
// import * as io from "react-icons/io";
// import * as io5 from "react-icons/io5";
// import * as md from "react-icons/md";
// import { Label } from "../../form";
// import { Icon } from "../../others";
// import { useStates } from "../../../hooks";
// import { cleanForComparison, isUndefined } from "../../../utils/functions";
// import { propTypes } from "./props";

// // OLD CODE but maybe useful in the future

// export const IconSelect = ({
//     label = null,
//     id = null,
//     help = null,
//     placeholder = null,
//     readOnly = false,
//     required = false,
//     disabled = false,
//     value,
//     onChange = () => {},
//     color = null,
//     className = null
// }) => {
//     const libraries = {fa, fa6, io, io5, md};
//     const icons = useMemo(() => {
//         const init = [];
//         Object.entries(libraries).forEach(([key, library]) => {
//             init.push(
//                 ...Object.values(library).map((icon => ({
//                     library: key,
//                     icon: icon.name,
//                 })))
//             );        });
//         return init;
//     }, []);

//     const { states, set } = useStates({
//         input: "",
//         isInputFocused: false
//     })

//     const { input, isInputFocused } = states;

//     const inputRef = useRef(null);

//     useEffect(() => {
//         if (value) {
//             if (isUndefined(libraries[value.library]) || isUndefined(libraries[value.library][value.icon])) {
//                 onChange(null);
//             }
//         }
//     }, [value]);

//     const labelProps = { id, label, required, help, className };
//     const textareaProps = { id, placeholder, required, disabled };

//     return (
//         <Label { ...labelProps}>
//             <div className={`relative`}>
//                 <input
//                     id={id}
//                     ref={inputRef}
//                     onFocus={() => set("isInputFocused", true)}
//                     onBlur={() => set("isInputFocused", false)}
//                     value={input}
//                     name={name}
//                     onChange={e => set("input", e.target.value)}
//                     placeholder={placeholder || "Nom de l'icône ..."}
//                     className={`${value && "hidden"} outline-none focus:border-primary rounded-md bg-light dark:bg-dark-soft w-full border focus:ring-1 ring-primary border-smt py-2 pl-2 pr-8 placeholder-smt`}
//                 />
//                 <div className={`${!value && "hidden"} row-v-center gap-2 rounded-md w-full bg-light dark:bg-dark-soft border border-smt pl-2 py-2 pr-7`}>
//                     <Icon { ...value} className={`text-xl text-primary`}/>
//                     <p className={`text-left truncate`}>{value?.icon}</p>
//                     <p>({value?.library})</p>
//                 </div>
                
//                 <button
//                     onClick={() => {
//                         // inputRef.current.focus();
//                         onChange(null);
//                     }}
//                     className={`absolute-v-center text-soft-smt text-xl right-2 z-10 ${!value && "pointer-events-none"} flex-shrink-0`}
//                 >
//                     <Icon library={value ? "io5" : "io"} name={value ? "IoClose" : "IoIosArrowDown"} />
//                 </button>
//                 {(!value && isInputFocused && input.length >= 3) &&
//                     <ul className={`absolute top-[calc(100%+8px)] z-20 right-0 left-0 col rounded-md border border-smt bg-smt max-h-80 overflow-y-auto`}>
//                         {icons.filter(icon => cleanForComparison(icon.icon).includes(cleanForComparison(input))).map(icon => 
//                             <li
//                                 onMouseDown={() => {
//                                     onChange(icon);
//                                 }}
//                                 className={`gap-2 px-2 py-1 cursor-pointer row-v-center button-smt bg-soft-smt`}
//                             >
//                                 <Icon { ...icon} className={`text-primary`}/>
//                                 <p className={`flex-grow text-left truncate`}>{icon.icon}</p>
//                                 <p className={`italic`}>{icon.library}</p>
//                             </li>
//                         )}
//                     </ul>
//                 }
//             </div>
//         </Label>
//     );
// };

// IconSelect.propTypes = propTypes;