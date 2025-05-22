import { Link, useParams } from "react-router-dom";
// import { CheckboxDol, FormItemDol, IconDol, InputDol, LabelDol, SelectDol } from "../../components/dol";
import { useApi, useStates } from "../../../hooks";
import PrivateLayout from "../InterventionsPage";
import { cleanForComparison, isEmpty, isLast, isNull, isUndefined, print, timestampToDate, timestampToDateTime } from "../../../globals";
import config from "../config";
import notes from "../notes";
import { useEffect } from "react";
import toast from "react-hot-toast";

const ListPage = () => {
    const params = useParams();
    // const { logout } = useApi();

    const notesConfig = {
        all: {
            title: "Toutes les notes",
            reactIcon: { library: "fa6", icon: "FaBook" },
            color: "#f16c6d",
            notes: notes,
            add: true,
            addChoose: ""
        },
        drafts: {
            title: "Brouillons",
            reactIcon: { library: "fa6", icon: "FaPencil" },
            color: "#f16c6d",
            notes: notes.filter(note => note.status == 0),
            add: false
        },
        enterprise: {
            title: "Entreprise",
            reactIcon: { library: "fa6", icon: "FaUsers" },
            color: "#a04d86",
            notes: notes.filter(note => !isUndefined(note.user)),
            add: false
        },
        ...Object.fromEntries(config.home.map(note => [note.slug, { ...note, 
            notes: notes.filter(note => note.type === params.noteType && isUndefined(note.user)),
            add: true,
        }]))
    };

    const noteConfig = notesConfig[params.noteType];    

    const setList = (searchValue, groupedBy, types, sort, interval) => {
        let groups = {};
        // sortArray(noteConfig.notes, groupedBy, sort).forEach(note => {
            noteConfig.notes.forEach(note => {
            const date = timestampToDate(note[groupedBy]);
            if (types.includes(note.type)) { // && interval[0] <= date && interval[1] >= date
                if (!isEmpty(searchValue)) {
                    if (cleanForComparison(note.label).includes(cleanForComparison(searchValue))) {
                        const dateGroup = date;
                        if (!groups[dateGroup]) {
                            groups[dateGroup] = [];
                        }
                        groups[dateGroup] = [...groups[dateGroup], note];
                    }
                } else {
                    const dateGroup = date;
                    if (!groups[dateGroup]) {
                        groups[dateGroup] = [];
                    }
                    groups[dateGroup] = [...groups[dateGroup], note];
                }
            }
            
        });

        return groups;
    }

    // color: "#f16c6d",

    const typeOptions = config.home.map(noteType => ({ label: noteType.title, value: noteType.slug, color: noteType.color }));

    const { states, set } = useStates({
        list: setList(null, "updated_at", typeOptions, "decreasing", ["", ""]),
        isProfileOpened: false,
        searchValue: "",
        isTrashMode: false,
        isFiltersOpened: false,
        filters: {
            groupedBy: "updated_at",
            types: config.home.map(noteType => noteType.slug),
            sort: "decreasing",
            interval: ["", ""]
        },
        isNoteOpened: false,
        newNoteType: noteConfig.slug || null,
        isNoteMode: false,
        isReadMode: false,
        selectedNote: null
    });

    const { list, isProfileOpened, searchValue, isTrashMode, isFiltersOpened, filters, isNoteOpened, newNoteType, isNoteMode, isReadMode, selectedNote } = states;
    const { groupedBy, types, sort, interval } = filters;

    useEffect(() => document.documentElement.style.setProperty(`--note-color`, noteConfig.color) ,[noteConfig]);

    useEffect(() => set("list", setList(searchValue, groupedBy, types, sort, interval)), [searchValue, filters])

    return (
        <PrivateLayout>
            <div className={`sticky top-0 z-10 gap-4 p-4 rounded-b-2xl border-b shadow-md col-v-center bg-dol border-dol`}>
                <div className={`row-between-center`}>
                    <div className={`gap-2 row-v-center`}>
                        <IconDol
                            className={`text-3xl text-note`}
                            { ...noteConfig.reactIcon}
                        />
                        <div className={`text-2xl italic font-extrabold text-dol`}>{noteConfig.title}</div>
                    </div>
                    <button 
                        onClick={() => set("isProfileOpened", true)}
                        className={`p-1 -mr-1 rounded-full text-[32px] text-dol bg-dol text-primary button-dol`}
                    >
                        <IconDol
                            library={`fa6`}
                            icon={`FaCircleUser`}
                        />
                    </button>
                </div>
                <hr />
                <div className={`gap-2 row-v-center`}>
                    <InputDol
                        placeholder={`🔍 Rechercher ...`}
                        value={searchValue}
                        onChange={value => set("searchValue", value)}
                        className={`flex-grow`}
                    />
                    <button 
                        onClick={() => set("isFiltersOpened", true)}
                        className={`p-2 -mr-2 rounded-full bg-dol button-dol button-dol`}
                    >
                        <IconDol
                            library={`io5`}
                            icon={`IoFilter`}
                            className={`text-2xl text-note`}
                        />
                    </button>
                    <button 
                        onClick={() => {
                            set("isTrashMode", !isTrashMode);
                            toast(
                                isTrashMode ? "Mode Suppression désactivé" : "Mode Supression activé",
                                { 
                                    position: "bottom-center",
                                    icon: <IconDol library={`fa6`} icon={`FaTrash`} className={`text-2xl ${isTrashMode ? "text-soft-dol" : "text-error"}`} /> 
                                }
                            );
                        }}
                        className={`text-2xl ${isTrashMode ? "text-error" : "text-soft-dol"} bg-dol p-2 button-dol rounded-full -mr-2`}
                    >
                        <IconDol
                            library={`fa6`}
                            icon={`FaTrash`}
                        />
                    </button>
                </div>
            </div>
            <div 
                onClick={() => set("isProfileOpened", false)}
                className={`fixed z-20 bg-black-50 inset-0 duration-300 ${isProfileOpened ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />
            <div className={`fixed z-30 top-0 bottom-0 right-0 w-80 border-l border-dol shadow-2xl bg-dol duration-300 ${isProfileOpened ? "translate-x-0" : "translate-x-full"}`}>
                <button 
                    onClick={() => set("isProfileOpened", false)}
                    className={`absolute top-2 left-2 p-1 text-3xl rounded-full text-dol bg-dol button-dol`}
                >
                    <IconDol
                        library={`io5`}
                        icon={`IoClose`}
                    />
                </button>
                <button 
                    // onClick={() => logout()}
                    className={`p-10 font-semibold text-white uppercase rounded-full absolute-full-center bg-dol button-dol bg-error`}
                >
                    Déconnexion
                </button>
            </div>
            <div 
                onClick={() => set("isFiltersOpened", false)}
                className={`fixed z-20 bg-black-50 inset-0 duration-300 ${isFiltersOpened ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />
            <div className={`fixed z-30 bottom-0 left-0 right-0 max-h-screen bg-dol overflow-y-auto duration-300 ${isFiltersOpened ? "translate-y-0" : "translate-y-full"}`}>
                <div className={`sticky z-10 p-4 border-b shadow-md bg-dol row-between-center border-dol`}>
                    <div className={`gap-2 row-v-center`}>
                        <IconDol
                            library={`io5`}
                            icon={`IoFilter`}
                            className={`text-3xl text-primary`}
                        />
                        <div className={`text-lg font-semibold uppercase`}>Filtres</div>
                    </div>
                    <button 
                        onClick={() => set("isFiltersOpened", false)}
                        className={`p-1 text-3xl rounded-full text-dol bg-dol button-dol`}
                    >
                        <IconDol
                            library={`io5`}
                            icon={`IoClose`}
                        />
                    </button>
                </div>
                <div className={`gap-4 px-4 py-6 col`}>
                    <CheckerboxDol
                        label={`Groupé par`}
                        name={`groupedByFilter`}
                        options={[{ label: "Date création", value: "created_at" }, { label: "Date modification", value: "updated_at" }, { label: "Première lettre", value: "first_letter" }]}
                        value={groupedBy}
                        onChange={value => set("filters.groupedBy", value)}
                    />
                    {/* <LabelDol label={`Intervalle`}>
                        <InputDol
                            type={`date`}
                            value={interval[0]}
                            onChange={value => set("filters.interval[0]", value)}
                        />
                        <InputDol
                            type={`date`}
                            value={interval[1]}
                            onChange={value => set("filters.interval[1]", value)}
                        />
                    </LabelDol> */}
                    <CheckerboxDol
                        label={`Ordre`}
                        name={`sortFilter`}
                        options={[{ label: "Croissant", value: "ascending" }, { label: "Décroissant", value: "decreasing" }]}
                        value={sort}
                        onChange={value => set("filters.sort", value)}
                    />
                    <CheckerboxDol
                        label={`Types de note`}
                        name={`noteTypeFilter`}
                        multiple={true}
                        options={typeOptions}
                        value={types}
                        onChange={value => set("filters.types", value)}
                    />
                </div>
            </div>
            <div className={`relative h-full`}>
                {isEmpty(list) 
                    ?   <div className={`gap-2 h-full col-full-center text-soft-dol`}>
                            <IconDol 
                                library={`fa6`}
                                icon={`FaFileCircleXmark`}
                                className={`text-6xl`}
                            />
                            <div className={`text-xl`}>
                                Aucune note
                            </div>
                        </div>
                    :   <div className={`gap-4 px-4 pt-6 min-h-full col pb-[78px]`}>
                            {Object.entries(list).map(([dateGroupKey, dateGroup], DGI) =>
                                <div key={"dateGroup_" + DGI} className={`gap-2 col`}>
                                    <div className={`font-semibold`}>{dateGroupKey}</div>
                                    <div className={`rounded-md divide-y shadow-md col bg-dol divide-dol`}>
                                        {dateGroup.map((note, NI) => 
                                            <div 
                                                key={dateGroupKey + "_note_" + NI}
                                                onClick={() => set("selectedNote", note)}
                                                className={`
                                                    row-v-center gap-4 p-3 w-full bg-dol button-dol
                                                    ${NI == 0 && "rounded-t-md"}
                                                    ${isLast(dateGroup, NI) && "rounded-b-md"}
                                                `}
                                            >                                        
                                                <div
                                                    className={`relative p-2 text-2xl text-white rounded-md`}
                                                    style={{ backgroundColor: config.home.filter(noteType => noteType.slug == note.type)[0].color }}
                                                >
                                                    {/* {!isUndefined(note.user) && 
                                                        <div 
                                                            className={`absolute p-1 text-white rounded-full -top-[9px] -right-[9px] text-[10px]`}
                                                            style={{ backgroundColor: "#a04d86" }}
                                                        >
                                                            <IconDol
                                                                library={`fa6`}
                                                                icon={`FaUser`}
                                                            />
                                                        </div> }*/}
                                                    <IconDol { ...config.home.filter(noteType => noteType.slug == note.type)[0].reactIcon}/>
                                                </div>
                                                <div className={`flex-grow truncate`}>{note.label}</div>
                                                {
                                                    note.status == 0 ?
                                                        <IconDol 
                                                            library={`fa6`}
                                                            icon={`FaPencil`}
                                                            className={`text-xl text-primary`}
                                                        />
                                                    : !isUndefined(note.user) ?
                                                        <IconDol
                                                            library={`fa6`}
                                                            icon={`FaUser`}
                                                            className={`text-xl`}
                                                            style={{ color: "#a04d86" }}
                                                        />
                                                    :   <div className={`w-5`}/>
                                                }
                                                <div className={`italic text-soft-dol`}>{timestampToDateTime(note[groupedBy]).slice(11)}</div>
                                                <button
                                                    onClick={e => e.stopPropagation()}
                                                    className={`duration-300 rounded-full text-xl ${isTrashMode ? "p-2 text-error bg-dol button-dol" : "p-0 text-soft-dol"}`}
                                                >
                                                    <IconDol
                                                        library={isTrashMode ? "fa6" : "io"}
                                                        icon={isTrashMode ? "FaTrash" : "IoIosArrowForward"}
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                }
            </div>
            {noteConfig.add &&
                <>
                    <button
                        onClick={() => set("isNoteOpened", true)}
                        className={`fixed right-4 bottom-20 p-2 text-3xl text-white rounded-full shadow-md bg-note`}
                    >
                        <IconDol 
                            library={`fa6`}
                            icon={`FaPlus`}
                        />
                    </button>
                    <div 
                        onClick={() => set("isNoteOpened", false)}
                        className={`fixed z-20 bg-black-50 inset-0 duration-300 ${isNoteOpened ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    />
                    <div className={`fixed z-30 overflow-y-auto bottom-0 right-0 left-0 max-h-screen duration-300 bg-dol ${isNoteOpened ? "translate-y-0" : "translate-y-full"}`}>
                        <div className={`sticky top-0 z-10 p-4 border-b shadow-md bg-dol row-between-center border-dol`}>
                            <div className={`-ml-2 row-v-center`}>
                                <button 
                                    onClick={() => {
                                        set("isNoteMode", !isNoteMode);
                                        toast(
                                            isNoteMode ? "Mode Note désactivé" : "Mode Note activé",
                                            { 
                                                position: "bottom-center",
                                                icon: <IconDol library={`fa6`} icon={`FaRegNoteSticky`} className={`text-2xl ${isNoteMode ? "text-soft-dol" : "text-primary"}`} /> 
                                            }
                                        );
                                    }}
                                    className={`text-2xl ${isNoteMode ? "text-primary" : "text-soft-dol"} bg-dol p-2 button-dol rounded-full`}
                                >
                                    <IconDol
                                        library={`fa6`}
                                        icon={`FaRegNoteSticky`}
                                    />
                                </button>
                                <button 
                                    onClick={() => {
                                        set("isReadMode", !isReadMode);
                                        toast(
                                            isReadMode ? "Mode Lecture désactivé" : "Mode Lecture activé",
                                            { 
                                                position: "bottom-center",
                                                icon: <IconDol library={`fa6`} icon={`FaRegEye`} className={`text-2xl ${isReadMode ? "text-soft-dol" : "text-primary"}`} /> 
                                            }
                                        );
                                    }}
                                    className={`text-2xl ${isReadMode ? "text-primary" : "text-soft-dol"} duration-100 bg-dol p-2 button-dol rounded-full`}
                                >
                                    <IconDol
                                        library={`fa6`}
                                        icon={`FaRegEye`}
                                    />
                                </button>
                            </div>
                            <div className={`row-v-center`}>
                                <button 
                                    onClick={() => {}}
                                    className={`p-2 text-2xl rounded-full button-dol bg-dol text-success`}
                                    >
                                    <IconDol
                                        library={`fa6`}
                                        icon={`FaDownload`}
                                        />
                                </button>
                                <button 
                                    onClick={() => {}}
                                    className={`p-2 text-2xl text-blue-500 rounded-full button-dol bg-dol`}
                                    >
                                    <IconDol
                                        library={`fa6`}
                                        icon={`FaClone`}
                                        />
                                </button>
                                <button 
                                    onClick={() => {}}
                                    className={`p-2 text-2xl rounded-full button-dol bg-dol text-error`}
                                    >
                                    <IconDol
                                        library={`fa6`}
                                        icon={`FaTrash`}
                                        />
                                </button>
                            </div>
                            <button 
                                onClick={() => set("isNoteOpened", false)}
                                className={`p-1 -mr-2 text-3xl rounded-full text-dol bg-dol button-dol`}
                                >
                                <IconDol
                                    library={`io5`}
                                    icon={`IoClose`}
                                />
                            </button>
                        </div>
                        <div className={`col gap-4 py-6 px-4 ${isNoteMode && "font-mono"}`}> {/*${isNoteMode && "bg-soft-dol"} border border-dol rounded-md p-4*/}
                            <div className={`text-lg font-semibold text-center uppercase`}>Nouvelle note</div>
                            {!isNoteMode && <hr/>}
                            <div className={`col bg-dol gap-4 ${isNoteMode ? "":""}`}>
                                {!isNull(newNoteType) && 
                                    notesConfig[newNoteType].attributes.map((attribute, AI) => 
                                        <FormItemDol { ...attribute} note={isNoteMode} />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </>
            }
        </PrivateLayout>
    );
};

export default ListPage;