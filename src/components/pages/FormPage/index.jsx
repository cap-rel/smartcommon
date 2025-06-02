import { FaArrowLeft, FaCalendar, FaFileLines, FaPen } from "react-icons/fa6";
import { Button, Checker, Timer, Input, Navbar, Panel, Popup, Rater, Select, SignaturePad, PhotosUploader, Textarea, UpperNavbarLink } from "../..";
import { useApi, useStates } from "../../../hooks";
import { AudiosUploader } from "../../form/AudiosUploader";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveDraft } from "../../../reduxStore/reducers/draftsSlice";
import { API_URL, formatDate, isArray, isNil, isUndefined, sortArrayByNumber } from "../../../globals";
import { useEffect } from "react";
import { setFormComponent } from "../../../globals/maps/formComponent";
import { VideosUploader } from "../../form/VideosUploader";
import { Page } from "../../others/Page";
import { RiCloseLargeLine } from "react-icons/ri";
import { Tag } from "../../others/Tag";

// TODO do maybe an upper stepper

export const FormPage = () => {
    const dispatch = useDispatch();
    // const navigate = useNavigate();
    
    const params = useParams();
    const { id } = params;

    const location = useLocation();
    const { draft, originLocation } = location.state ?? {};

    const interventions = useSelector(state => state.interventions.data);

    const intervention = Object.values(interventions).reduce((acc, interventionsGroup) => [...acc, ...interventionsGroup], []).find(intervention => intervention.rowid == id);

    const { ref } = intervention;

    const config = useSelector(state => state.config.data);

    // const initialDraft = Object.fromEntries(Object.entries(config).map(([attrKey, attr]) => {
    //     let value;
    //     if (!isNil(intervention?.[attrKey])) {
    //         value = intervention[attrKey]
    //     } else {
    //         value = attr.defaultValue;
    //     }

    //     return [attrKey, value];
    // }));

    const formAttributes = Object.entries(config).reduce((acc, [attributeKey, attribute]) => {
        const visible = attribute.visible;
        if (isArray(visible) && visible.includes("update")) {
            return { ...acc, [attributeKey]: attribute };
        }
        return acc;
    }, {});

    const { states, set } = useStates({
        // formValues: draft ?? initialDraft,
        formValues: Object.entries(formAttributes).reduce((acc, [attributeKey, attribute]) => ({ ...acc, [attributeKey]: intervention?.[attributeKey] ?? attribute.defaultValue ?? (attribute.type === "photos" ? null : "") }), {}),
        isDraftsPanelOpen: false,
        selectedDraftIndex: null,
    });

    const { formValues, isDraftsPanelOpen, selectedDraftIndex } = states;


    // useEffect(() => {
    //     console.log(formValues);
    //     // dispatch(saveDraft(formValues));
    // }, [formValues]);

    const { token } = useSelector(state => state.session.data);

    const { PUT } = useApi(API_URL, token);

    const handleSubmit = e => {
        e.preventDefault();
        PUT(`intervention/${id}`, formValues)
            .then(json => {
                toast.success("Compte-rendu d'intervention sauvegardé.")
                console.error(`PUT 'intervention/${id}' success`);
                // navigate("/interventions")
            })
            .catch(err => {
                toast.error("Echec de la sauvegarde du compte-rendu d'intervention. Veuillez le synchroniser ultérieurement.")
                console.error(`PUT 'intervention/${id}' error`);
                console.error(err);
                // navigate("/interventions")
            })
    };

    const openDraftsPanel = () => {
        set("isDraftsPanelOpen", true);
    };

    const closeDraftsPanel = () => {
        set("isDraftsPanelOpen", false);
    };

    const selectDraft = (index) => {
        set("selectedDraftIndex", index);
    };

    const applyDraft = () => {
        // apply values
        set("isDraftsPanelOpen", false);
    };

    const cancelDraft = () => {
        set("selectedDraftIndex", null);
        // reset values
    };
    

    // const drafts = useSelector(state => state.drafts.data).filter(draft => draft.data.rowid === id);

    const drafts = [
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_INPROGRESS" } },
        { updatedAt: 1747902676, data: { status: "STATUS_DONE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_INPROGRESS" } },
        { updatedAt: 1747902676, data: { status: "STATUS_DONE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_INPROGRESS" } },
        { updatedAt: 1747902676, data: { status: "STATUS_DONE" } },
        { updatedAt: 1747902676, data: { status: "STATUS_TOCOMPLETE" } },
    ]

    const statusList = {
        STATUS_TOCOMPLETE: { label: "Incomplète", color: "to-complete" },
        STATUS_INPROGRESS: { label: "En cours", color: "in-progress" },
        STATUS_DONE: { label: "Terminée", color: "done" },
    };

    return (
        <>
            <Panel
                isOpen={isDraftsPanelOpen}
                close={closeDraftsPanel}
                panelProps={{ className: `rounded-tr-none rounded-l-app-md left-auto top-0 max-h-auto p-app-md max-w-full translate-y-0 ${!isDraftsPanelOpen && "translate-x-full"}` }}
            >
                <div className={`flex flex-col gap-app-base h-full`}>
                    <div className={`flex justify-between gap-app-xs`}>
                        <div className={`text-app-base font-app-semibold uppercase`}>Brouillons ({drafts.length})</div>
                        <Button 
                            icon={<RiCloseLargeLine />}
                            onClick={closeDraftsPanel}
                            buttonProps={{ className: `text-app-lg z-60 bg-soft-bg text-soft-text p-app-xs rounded-app-xl -mr-app-xs -mt-app-xs` }}
                        />
                    </div>
                    <div className={`flex flex-col gap-app-sm text-app-sm p-app-sm bg-strong-bg inset-shadow-sm rounded-app-md grow overflow-y-auto`}>
                        {sortArrayByNumber(drafts, "updatedAt").map((draft, DI) => {
                            const { updatedAt, data } = draft;
                            const { label: statusLabel, color: statusColor } = statusList[data.status];
                            return (
                                <div
                                    key={`draft${DI}`} 
                                    onClick={() => selectDraft(DI)}
                                    className={`duration-(--really-quick) ${selectedDraftIndex === DI ? "brightness-medium" : "active:brightness-soft shadow-md"} bg-soft-bg  flex justify-between gap-app-xs px-app-sm py-app-xs items-center rounded-app-md`}
                                >
                                    <div className={`flex items-center gap-app-xs`}>
                                        <div className={`p-app-xs rounded-app-md bg-secondary/15`}>
                                            <FaFileLines className={`text-app-lg text-strong-secondary`} />
                                        </div>
                                        <div className={`whitespace-nowrap`}>
                                            {formatDate(new Date(updatedAt), "DD/HH/YY hh:mm")}
                                        </div>
                                    </div>
                                    <Tag color={statusColor}>
                                        {statusLabel}
                                    </Tag>
                                </div>
                            );
                        })}
                    </div>
                {/* </div> */}

                {/* <div className={`flex flex-col gap-app-base`}> */}
                    <Button
                        disabled={isNil(selectedDraftIndex)}
                        onClick={applyDraft}
                        buttonProps={{ className: `disabled:brightness-soft` }}

                    >
                        Appliquer ce brouillon
                    </Button>
                    <Button
                        disabled={isNil(selectedDraftIndex)}
                        onClick={cancelDraft}
                        buttonProps={{ className: `bg-neutral disabled:brightness-soft` }}
                    >
                        Ne pas appliquer de brouillon
                    </Button>
                </div>
            </Panel>

            <Page pageProps={{ className: `mb-(--layoutTabbar-tabbar-height)` }}>
                <Navbar
                    title={`Compte-rendu`}
                    upperLeftLinks={
                        <UpperNavbarLink 
                            icon={<FaArrowLeft />}
                            to={"/interventions"}
                        />
                    }
                    upperRightLinks={
                        <UpperNavbarLink 
                            icon={<FaFileLines />}
                            onClick={openDraftsPanel}
                        />
                    }
                />

                <div className={`p-app-base flex flex-col gap-app-base relative h-full overflow-y-auto`}>
                    <div className="flex flex-col gap-app-xs border-b border-border pb-app-base">
                        <div className="text-xl text-center uppercase text-strong-text font-app-semibold">
                            Compte-rendu
                        </div>
                        <div className="text-center text-soft-text italic">
                            Intervention {intervention.ref}
                        </div>
                    </div>

                    {/* {Object.entries(config).map(([attrKey, attr]) => {

                    })} */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-app-base">

                        {Object.entries(formAttributes).map(([attributeKey, attribute], AI) => {
                            const type = attribute.type;

                                const Component = setFormComponent(type === "html" ? "text" : type);
                                if (!isUndefined(Component)) {
                                    return (
                                        <Component
                                            { ...attribute}
                                            value={formValues[attributeKey]}
                                            onChange={value => set(`formValues.${attributeKey}`, value)}
                                        />
                                    );
                                }
                            
                            
                        })}

                        <Button
                            // buttonProps={{
                            //     onClick: () => set("sign", true)
                            // }}
                        >
                            Valider le compte-rendu
                        </Button>
                    </form>


                </div>

                {/* <Popup
                    isOpen={sign}
                    // closeOnClickOverlay={false}
                    close={() => set("sign", false)}
                >
                    <SignaturePad />
                </Popup> */}
                
            
            
            {/* { <Button
                    // icon={!isSearchbarOpen && <FaMagnifyingGlass />}
                    buttonProps={{ 
                        disabled: isSearchbarOpen,
                        onClick: () => !isSearchbarOpen && set("isSearchbarOpen", !isSearchbarOpen),
                        className: `p-app-base fixed left-app-base bottom-app-base bg-soft-bg shadow-md text-primary`
                    }}
                >
                    isSearchbarOpen
                        ?  <>
                            <Input
                                inputContainerProps={{ className: "p-0 border-none has-[input:focus]:border-none has-[input:focus]:ring-0 ring-none" }}
                            />
                            <RiCloseLargeFill />
                            </>
                        : "Rechercher"
                    } 
                </Button> */}
            </Page>
        </>
    );
};