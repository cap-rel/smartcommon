import { useListDnD, useStates } from "../../../hooks";
import { BooleanDol, FormItemDol, IconDol, LabelDol, SelectDol, FilterTagItemDol, InputDol } from "../../../dol";
import { useEffect, useMemo } from "react";
import { isEmpty } from "../../../../globals/functions";

const SmartActionsDol = (props) => {
    const { value, onChange, attributes } = props;

    const EMPTY_VALUES_MAP = useMemo(()=> ({
        boolean      : false, // TODO switch/checkbox
        checkbox     : false, // TODO remettre le vrai checkbox
        multiCheckbox: [],
        radio        : "",
        select       : "",
        multiSelect  : [],
        array        : [],

        varchar      : "",
        mail         : "",
        password     : "", 
        phone        : "",
        ip           : "",
        url          : "",
        link         : "",
        date         : "",
        datetime     : "",
        time         : "",
        timestamp    : "", // TODO

        stock        : "",
        int          : "",
        reel         : "",
        price        : "",
        pricey       : "",
        
        double       : "",
        duration     : "",

        text         : "", 
        html         : "",

        address      : "", // TODO
        gps          : "", // TODO
        file         : [], // TODO
        audio        : [], // TODO
        video        : [], // TODO
        photo        : [], // TODO
        signature    : "", // TODO
        drawing      : "", // TODO

        color        : "",
        multiColor   : {},
        icon         : "",
        multiIcon    : {},

        stepper      : "", // TODO
        rating       : "", // TODO
        range        : "", // TODO
        // case "fk": return "";
    
    }), []);

    const { states, set } = useStates({
        selectedFormAttribute: "",
        addedFormAttribute: "",
        draggedFormAttributeIndex: null,
        formAttributes: {}
    });

    const { onDragStart, onDragOver, onDrop } = useListDnD(set);

    const { selectedFormAttribute, addedFormAttribute, draggedFormAttributeIndex, formAttributes } = states;

    const attributesSelect = Object.entries(attributes).map(([key, attribute]) => ({ label: attribute.label, value: key }))

    return (
        <div className={`col gap-6`}>
            <div className={`p-4 bg-[#fe4c02] bg-opacity-10 rounded-md border border-[#fe4c02] row-v-center gap-4 text-base`}>
                <IconDol library={`md`} icon={`MdInfoOutline`} className={`text-[#fe4c02] text-xl flex-shrink-0`} />
                <ul className={`col gap-1`}>
                    {/* <li className={`text-justify`}></li> */}
                    <li className={`text-justify`}>Vous pouvez préremplir le formulaire en donnant une valeur par défaut aux attributs</li>
                </ul>
            </div>
            <div className={`row-v-center gap-6`}>
                <SelectDol 
                    value={addedFormAttribute}
                    onChange={value => set("addedFormAttribute", value)}
                    options={attributesSelect.filter(attribute => !Object.keys(formAttributes).includes(attribute.value))}
                    placeholder={`Sélectionner un attribut ...`}
                />
                <button 
                    onClick={() => {
                        set("formAttributes", { ...formAttributes, [addedFormAttribute]:  EMPTY_VALUES_MAP[attributes[addedFormAttribute].type]});
                        set("addedFormAttribute", "");
                    }}
                    className={`text-white self-center dark:text-[#fe4c02] bg-[#fe4c02] dark:bg-opacity-10 border border-[#fe4c02] row-v-center gap-2 px-4 py-2 rounded-md uppercase button-dol font-semibold`}
                >
                    <IconDol library={`fa6`} icon={`FaPlus`} className={`mx-auto`} />
                    <span>Ajouter au formulaire</span>
                </button>
            </div>
            <LabelDol label={`Formulaire`}>
            {!isEmpty(formAttributes) 
                ? <ul className={`col gap-4 w-full`}>
                    {Object.entries(formAttributes).map(([key, formAttribute], FAI) => 
                        <li 
                            key={FAI}
                            data-index={FAI}
                            onDragOver={(e) => onDragOver(e, "draggedFormAttributeIndex", draggedFormAttributeIndex, `formAttributes`, formAttributes)}
                            onDrop={(e) => onDrop("draggedFormAttributeIndex")}
                            className={`
                                relative w-full py-2 px-4 bg-dol rounded-md border-2 row-between-center gap-6
                                ${draggedFormAttributeIndex == FAI ? "border-dashed border-[#fe4c02]" : "border-dol"}
                            `}
                        >
                            <div className={`
                                absolute bg-dol inset-0 z-10 rounded-md
                                ${draggedFormAttributeIndex == FAI ? "" : "hidden"}
                            `}/>
                            <span className={`w-48 truncate`}>{attributes[key].label}</span>
                            <span>Défaut: {formAttribute}</span>
                            <div className={`row-v-center gap-2 text-lg`}>
                                <button 
                                    onClick={() => set("selectedFormAttribute", key)}
                                    className={`bg-dol p-2 rounded-full button-dol text-yellow-500`}
                                >
                                    <IconDol library={`md`} icon={`MdEdit`}/>
                                </button>
                                <button 
                                    onClick={() => {
                                        const newFormAttributes = { ...formAttributes};
                                        delete newFormAttributes[key];
                                        set(`formAttributes`, newFormAttributes);
                                    }}
                                    className={`bg-dol p-2 rounded-full button-dol text-red-500`}
                                >
                                    <IconDol library={`fa`} icon={`FaTrash`}/>
                                </button>
                                <button 
                                    data-index={FAI}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, "draggedFormAttributeIndex")}
                                    className={`bg-dol p-2 rounded-full button-dol`}
                                >
                                    <IconDol library={`fa`} icon={`FaArrowsAlt`}/>
                                </button>
                            </div>
                        </li>
                    )}
                </ul>
                : <span>Formulaire vide</span>
            }
            </LabelDol>
            <div className={`${selectedFormAttribute ? "alert-dol opacity-100 duration-200" : "fixed opacity-0"}`}>
                <div className={`${selectedFormAttribute ? "absolute-full-center bg-dol rounded-md" : "hidden"}`}> 
                    <div className={`relative text-base p-12`}>
                        <button 
                            onClick={() => set("selectedFormAttribute", null)}
                            className={`bg-dol p-1 rounded-full button-dol text-soft-dol text-2xl absolute right-4 top-4`}
                        >
                            <IconDol library={`io5`} icon={`IoClose`}/>
                        </button>
                        <FormItemDol 
                            value={formAttributes[selectedFormAttribute]}
                            onChange={value => set(`formAttributes.${selectedFormAttribute}`)}
                            { ...attributes[selectedFormAttribute]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

};

export default SmartActionsDol;