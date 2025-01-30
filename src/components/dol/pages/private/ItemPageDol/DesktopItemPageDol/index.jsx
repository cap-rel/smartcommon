import { useEffect } from "react";
import { useForm, useStates } from "../../../../../hooks";
import { InputDol, IconDol } from "../../../../../dol"
import { now } from "../../../../../../globals/functions";

export const DesktopItemPageDol = (props) => {
    const form = [
        {
            id: "0",
            type: "flex",
            direction: "column",
            // width: 100,
            children: [
                {   
                    id: "0_0",
                    type: "flex",
                    direction: "row",
                    divide: true,
                    children: [
    
                        {
                            id: "0_0_0",
                            label      : "Prénom",
                            default: "Paolo",
                            disabled: false,
                            placeholder: "",
                            basis: 10
                        },
                        {
                            id: "0_0_1",
                            type: "flex",
                            direction: "column",
                            basis: 70,
                            children: [
                                {
                                    id: "0_0_1_0",
                                    label      : "Nom de famille",  
                                    default: "Debaisieux",
                                    disabled: false,
                                    placeholder: "",
                                },
                                {
                                    id: "0_0_1_1",
                                    type: "flex",
                                    direction: "row",
                                    title: "Lieu de livraison",
                                    children: [
                                        {
                                            id: "0_0_1_1_0",
                                            label      : "Adresse",
                                            default: "1 Place Dassy",
                                            disabled: false,
                                            placeholder: "",
                                            basis: 25
                                        },
                                        {
                                            id: "0_0_1_1_1",
                                            label      : "Code Postal",
                                            default: "13013 Marseille",
                                            disabled: false,
                                            placeholder: "",
                                            basis: 25
                                        },
                                    ]
                                },
                            ]
                        },
                        
                    ]
                },
                {   
                    id: "0_1",
                    type: "flex",
                    direction: "row",
                    width: 40,
                    children: [
                        {
                            id: "0_1_0",
                            label: "Code Postal",
                            default: "13013 Marseille",
                            disabled: false,
                            placeholder: "",
                            basis: 20
                        },
                        {
                            id: "0_1_1",
                            label: "phone",
                            default: "0635303485",
                            disabled: false,
                            type: "phone",
                            // placeholder: "",
                            basis: 80
                        },
                    ]
                },
                {
                    id: "0_2",
                    label: "tel",  
                    type: "phone",
                    default: "0635303485",
                    width: 65,
                    disabled: false,
                },
                {
                    id: "0_3",
                    type: "flex",
                    direction: "row",
                    children: [
                        {
                            id: "0_3_0",
                            type: "tabs",
                            title: "Etapes du paiement",
                            tabs: ["Etape 1", "Etape 2"],
                            basis: 60,
                            children: [
                                {   
                                    id: "0_3_0_0",
                                    type: "flex",
                                    direction: "row",
                                    children: [
                                        {
                                            id: "0_3_0_0_0",
                                            label: "Code Postal",
                                            disabled: false,
                                            placeholder: "",
                                            basis: 20
                                        },
                                        {
                                            id: "0_3_0_0_1",
                                            label: "phone",
                                            disabled: false,
                                            type: "phone",
                                            // placeholder: "",
                                            basis: 80
                                        },
                                    ]
                                },
                                {   
                                    id: "0_3_0_1",
                                    type: "flex",
                                    direction: "column",
                                    children: [
                                        {
                                            id: "0_3_0_1_0",
                                            label: "Code Postal",
                                            disabled: false,
                                            placeholder: "",
                                        },
                                        {
                                            id: "0_3_0_1_1",
                                            label: "Adresse mail",
                                            disabled: false,
                                            type: "mail",
                                            // placeholder: "",
                                        },
                                    ]
                                }
                            ]
                        },
                        {
                            id: "0_3_1",
                            type: "tabs",
                            title: "Etapes du paiement",
                            tabs: ["Step 1", "Step 2"],
                            basis: 40,
                            children: [
                                {   
                                    id: "0_3_1_0",
                                    type: "flex",
                                    direction: "row",
                                    // basis: "0.5",
                                    children: [
                                        {
                                            id: "0_3_1_0_0",
                                            label: "Code Postal",
                                            disabled: false,
                                            placeholder: "",
                                            basis: 60
                                        },
                                        {
                                            id: "0_3_0_1",
                                            label: "phone",
                                            type: "phone",
                                            disabled: false,
                                            // placeholder: "",
                                            basis: 40
                                        },
                                    ]
                                },
                                {   
                                    id: "0_3_1_1",
                                    type: "flex",
                                    direction: "row",
                                    // basis: "0.5",
                                    children: [
                                        {
                                            id: "0_3_1_1_0",
                                            label: "Code Postal",
                                            placeholder: "",
                                            disabled: false,
                                            basis: 60
                                        },
                                        {
                                            id: "0_3_1_1_1",
                                            label: "phone",
                                            type: "phone",
                                            disabled: false,
                                            // placeholder: "",
                                            basis: 40
                                        },
                                    ]
                                },
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    const { formValues, buildForm } = useForm(form);

    const { states, set } = useStates({
        opacityTransitions: {
                                initial: false,
                                afterGettingData: false,
                            },
        formValues        : formValues,
        isGettingItem     : true
    });

    useEffect(() => {
        set("opacityTransitions.initial", true);
        setTimeout(() => {
            set("isGettingItem", false);
            set("opacityTransitions.afterGettingData", true);
        }, 1000);
    }, []);

    return (
        <div 
            className={`
                hidden lg:row gap-4 m-4 text-gray-500 text-sm absolute inset-0
                ${states.opacityTransitions.initial ? "duration-300 opacity-100" : "opacity-0"}
            `}
        >
            <div className={`col gap-4 basis-1/4`}>
                <div className={`
                    relative w-full bg-white rounded-md shadow-md p-4
                `}>
                    {states.isGettingItem && 
                    <div className="absolute z-10 inset-0 skeleton rounded-md bg-white"/>
                    // <div className="absolute inset-0 z-10 bg-white rounded-md">
                    //     <span className="absolute-full-center loading loading-spinner loading-lg text-[#3f51b5]"></span>
                    // </div>
                    }
                    {/* <div className={``}> */}
                    <div className={`
                        col-h-center gap-4
                        ${states.opacityTransitions.afterGettingData ? "duration-300 opacity-100" : "opacity-0"}
                    `}>
                        <IconDol 
                            library="md" 
                            icon="MdSell" 
                            className="text-3xl md:text-8xl text-[#3f51b5]"
                        />
                        <p className="text-xl">Vente <span className="font-semibold text-[#3f51b5]">#349812F5</span></p>
                        
                        <div className="w-full border-2 rounded-md text-gray-800">
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2">
                                <span className="basis-1/2 font-semibold pr-4">id</span>
                                <span className="basis-1/2 pl-4">357</span>
                            </div>
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2 bg-gray-100">
                                <span className="basis-1/2 font-semibold pr-4">Création</span>
                                <span className="basis-1/2 pl-4">10/08/2019 18:57</span>
                            </div>
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2">
                                <span className="basis-1/2 font-semibold pr-4">Dernière modification</span>
                                <span className="basis-1/2 pl-4">10/06/2024 12:35</span>
                            </div>
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2 bg-gray-100">
                                <span className="basis-1/2 font-semibold pr-4">Note</span>
                                <div className="basis-1/2 pl-4 rating rating-sm">
                                    <input type="radio" name="rating-6" className="mask mask-star-2 hover:cursor-default bg-[#3f51b5]" disabled/>
                                    <input type="radio" name="rating-6" className="mask mask-star-2 hover:cursor-default bg-[#3f51b5]" defaultChecked disabled/>
                                    <input type="radio" name="rating-6" className="mask mask-star-2 hover:cursor-default bg-[#3f51b5]" disabled/>
                                    <input type="radio" name="rating-6" className="mask mask-star-2 hover:cursor-default bg-[#3f51b5]" disabled/>
                                    <input type="radio" name="rating-6" className="mask mask-star-2 hover:cursor-default bg-[#3f51b5]" disabled/>
                                </div>
                            </div>
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2">
                                <span className="basis-1/2 font-semibold pr-4">Avis</span>
                                <span className="basis-1/2 pl-4">1742</span>
                            </div>
                            <div className="row-v-center h-full px-4 py-2 w-full divide-x-2 bg-gray-100">
                                <span className="basis-1/2 font-semibold pr-4">Catégories</span>
                                <div className="basis-1/2 pl-4 wrap-full-center gap-2">
                                    <span className="text-blue-800 py-1 px-2 tracking-wide font-bold bg-blue-200 rounded-full shadow-md uppercase">Homme</span>
                                    <span className="text-red-800 py-1 px-2 tracking-wide font-bold bg-red-200 rounded-full shadow-md uppercase">Ete</span>
                                    <span className="text-purple-800 py-1 px-2 tracking-wide font-bold bg-purple-200 rounded-full shadow-md uppercase">Fete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                </div>
                <div className={`
                    relative w-full p-4 bg-white shadow-md rounded-md overflow-auto
                `}>
                    {states.isGettingItem && 
                    <div className="absolute z-10 inset-0 skeleton rounded-md bg-white"/>
                    // <div className="absolute inset-0 z-10 bg-white rounded-md">
                    //     <span className="absolute-full-center loading loading-spinner loading-lg text-[#3f51b5]"></span>
                    // </div>
                    }
                    <div className={`
                        col gap-4
                        ${states.opacityTransitions.afterGettingData ? "duration-300 opacity-100" : "opacity-0"}
                    `}>
                        <div className="col gap-4">
                            <p className="font-bold">Actions classiques</p>
                            <div className="wrap-v-center gap-4">
                                <button className="button-dol row-full-center gap-2 shadow-md flex-grow bg-yellow-400 text-base px-4 py-2 rounded-md text-white">
                                    <IconDol
                                        library="md"
                                        icon="MdEdit"
                                        // className="text-2xl"
                                    />
                                    <p>Modifier</p>
                                </button>
                                <button className="button-dol row-full-center gap-2 shadow-md flex-grow bg-red-500 text-base px-4 py-2 rounded-md text-white">
                                    <IconDol
                                        library="fa6"
                                        icon="FaTrashCan"
                                        // className="text-2xl"
                                    />
                                    <p>Supprimer</p>
                                </button>
                            </div>
                        </div>
                        {/* <div className="col gap-4">
                            <p>Actions classiques page modifier</p>
                            <div className="wrap-v-center gap-2">
                                <button className="button-dol row-full-center gap-3 shadow-md flex-grow uppercase bg-green-400 p-3 rounded-md tracking-wide text-white">
                                    <IconDol
                                        library="md"
                                        icon="MdOutlineSaveAlt"
                                        className="text-2xl"
                                    />
                                    <p>Sauvegarder</p>
                                </button>
                                <button className="button-dol row-full-center gap-3 shadow-md flex-grow uppercase bg-gray-400 p-3 rounded-md tracking-wide text-white">
                                    <IconDol
                                        library="io5"
                                        icon="IoCloseSharp"
                                        className="text-2xl"
                                    />
                                    <p>Annuler</p>
                                </button>
                            </div>
                        </div> */}
                        <div className="col gap-4 font-bold">
                            <p>Actions rapides</p>
                            <div className="wrap-v-center gap-4">
                                <button className="button-dol shadow-md flex-grow bg-red-200 text-red-800 tracking-wide uppercase px-4 py-2 rounded-full">
                                    Refuser
                                </button>
                                <button className="button-dol shadow-md flex-grow bg-gray-200 text-gray-600 tracking-wide uppercase px-4 py-2 rounded-full">
                                    Annuler
                                </button>
                                <button className="button-dol shadow-md flex-grow bg-green-200 text-green-800 tracking-wide uppercase px-4 py-2 rounded-full">
                                    Ouvrir
                                </button>
                                <button className="button-dol shadow-md flex-grow bg-red-200 text-red-800 tracking-wide uppercase px-4 py-2 rounded-full">
                                    Jeter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`
                relative basis-3/4 h-full p-4 bg-white rounded-md shadow-md overflow-auto
            `}>
                {states.isGettingItem && 
                <div className="absolute z-10 inset-0 skeleton rounded-md bg-white"/>
                // <div className="absolute inset-0 z-10 bg-white rounded-md">
                //     <span className="absolute-full-center loading loading-spinner loading-lg text-[#3f51b5]"></span>
                // </div>
                }
                <div className={`${states.opacityTransitions.afterGettingData ? "duration-300 opacity-100" : "opacity-0"}`}>
                    {buildForm()}
                </div>
                {/* {items.map((item, II) =>
                    <InputDol
                        key={II}
                        id={`input${II}`}
                        type={item.type}
                        label={item.label}
                        placeholder={item.placeholder}
                        help={item.help}
                        value={states.formValues[II]}
                        onChange={(newState) => set(`formValues[${II}]`, newState)}
                        required={item.required}
                        disabled={item.disabled}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        inputPrefix={item.inputPrefix}
                        inputSuffix={item.inputSuffix}
                        maxLength={item.maxLength}  
                        pattern={item.pattern}    
                        pictogram={item.pictogram}
                        stepper={item.stepper}    
                        step={item.step} 
                    />
                )} */}
            </div>
        </div>
    );
};