import { FaCalendar } from "react-icons/fa6";
import { Button, Check, Duration, Input, Navbar, Popup, Rating, Select, Signature, SmartPhotos, Textarea } from "../..";
import { useApi, useStates } from "../../../hooks";
import { SmartAudios } from "../../form/SmartAudios";
import { Calendar } from "../../list";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveDraft } from "../../../reduxStore/reducers/draftsSlice";
import { API_URL, isArray, isNil, isUndefined } from "../../../globals";
import { useEffect } from "react";
import { setComponent } from "../../../globals/maps/component";
import { SmartVideos } from "../../form/SmartVideos";

// TODO do maybe an upper stepper

export const FormPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const params = useParams();
    const { id } = params;

    const location = useLocation();
    const { draft, originLocation } = location.state ?? {};

    const interventions = useSelector(state => state.interventions.data);

    const intervention = Object.values(interventions).reduce((acc, interventionsGroup) => [...acc, ...interventionsGroup], []).find(intervention => intervention.rowid == id);

    const config = useSelector(state => state.config.data) ?? {};

    const initialDraft = Object.fromEntries(Object.entries(config).map(([attrKey, attr]) => {
        let value;
        if (!isNil(intervention?.[attrKey])) {
            value = intervention[attrKey]
        } else {
            value = attr.defaultValue;
        }

        return [attrKey, value];
    }));

    const { states, set } = useStates({
        // formValues: draft ?? initialDraft,
        isSearchbarOpen: false,
        sign: false,
        testValues: {
            desc: "",
            photos: [],
        }
    });

    const { testValues, formValues, isSearchbarOpen, sign } = states;

    const { desc, photos } = testValues;

    useEffect(() => {
        dispatch(saveDraft(formValues));
    }, [formValues]);

    const testConfig = {
        ref: { visible: true, label: "Référence" },
        description: { visible: false, label: "Description" },
        note_public: { visible: true, label: "Note publique" },
        date_inter: { visible: true, label: "Date d'intervention" },
        event_typ: { visible: true, label: "Type d'évènement" },
        event_ty: { visible: true, label: "Type d'évènement" },
        event_t: { visible: true, label: "Type d'évènement" },
        event_: { visible: true, label: "Type d'évènement" },
        event: { visible: true, label: "Type d'évènement" },
        even: { visible: true, label: "Type d'évènement" },
        eve: { visible: true, label: "Type d'évènement" }
    };

    const test = () => {
        set("sign", true)
    };

    const { PUT } = useApi(API_URL, useSelector(state => state.user.data.token));

    const handleSubmit = e => {
        e.preventDefault();
        PUT(`intervention/${id}`, { ...intervention, description: "Description modifiée" })
            .then(json => {
                console.log("Intervention PUT success.");
            })
            .catch(err => {
                console.error("Intervention PUT error");
            })
        
        // navigate(originLocation.to, originLocation);
    };

    // const test2 = [];

    return (
        <div className={`fixed inset-0 bg-soft-bg text-app-sm text-strong-text`}>
            {/* <Navbar>
                Bonjour
            </Navbar> */}
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

                    <SmartPhotos label={`Photos`} multiple />
                    <SmartAudios label={`Audios`} multiple />
                    <SmartVideos label={`Videos`} multiple />
                    <Signature label={`Signature`} />
                    <Select 
                        label={`Select`}
                        multiple
                        options={["Pomme", "Banane", "Fraise"]}
                    />
                    <Rating
                        label={`Rating`}
                        maxRating={6}
                    />

                    {!isNil(config) && Object.entries(config).map(([attributeKey, attribute], AI) => {
                        const { type, visible } = attribute;
                        // console.log(attribute);

                        if (isArray(visible) && visible.includes("update")) {
                            const Component = setComponent(type);
                            // test2.push([Component, attribute]);
                            // console.log(test2)
                            if (!isUndefined(Component)) {
                                return (
                                    <Component
                                        defaultValue={intervention?.[attributeKey] ?? attribute.defaultValue}
                                        { ...attribute}
                                    />
                                );
                            }
                           
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

            <Popup
                isOpen={sign}
                // closeOnClickOverlay={false}
                close={() => set("sign", false)}
            >
                <Signature />
            </Popup>
            
           
           
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
        </div>
    );
};


{/* <Textarea 
label={`Description`}
value={desc}
onChange={value => set("testValues.desc", value)}
/> */}
{/* <Input 
label={`ExtraField 1`}
icon={<FaCalendar />}
inputProps={{
    type: "date"
}}
/> */}
{/* <Select
label={`ExtraField 2`}
/> */}
{/* <div className="flex flex-col gap-app-xs">
<div className="font-app-semibold">
    Photos
</div>
<div className="flex gap-3">
    <SmartPhotos 
        multiple
        value={photos}
        onChange={value => set("testValues.photos", value)}
        FloatingButton={{
            buttonProps: {
                className: "static"
            },
            badgeProps: {
                className: "hidden"
            }
        }}
    /> */}
    {/* <SmartAudios 
        multiple
        FloatingButton={{
            buttonProps: {
                className: "static"
            }
        }}
    /> */}
// </div>
// </div>