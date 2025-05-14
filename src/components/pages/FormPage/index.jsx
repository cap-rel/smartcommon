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
import { Page } from "../../others/Page";

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
        formValues: Object.entries(formAttributes).reduce((acc, [attributeKey, attribute]) => ({ ...acc, [attributeKey]: intervention?.[attributeKey] ?? attribute.defaultValue ?? (attribute.type === "photos" ? null : "") }), {})
    });

    const { formValues } = states;


    // useEffect(() => {
    //     console.log(formValues);
    //     // dispatch(saveDraft(formValues));
    // }, [formValues]);

    const { PUT } = useApi(API_URL, useSelector(state => state.session.data.auth.token));

    const handleSubmit = e => {
        e.preventDefault();
        PUT(`intervention/${id}`, formValues)
            .then(json => {
                console.log("Intervention PUT success.");
            })
            .catch(err => {
                console.error("Intervention PUT error");
                console.error(err);
            })
            .finally(() => navigate("/interventions"));
    };

    return (
        <Page>
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

                    {/* <SmartPhotos label={`Photos`} multiple />
                    <SmartAudios label={`Audios`} multiple />
                    <SmartVideos label={`Videos`} multiple />
                    <Signature label={`Signature`} />
                    <Duration/>
                    <Select 
                        label={`Select`}
                        multiple
                        options={["Pomme", "Banane", "Fraise"]}
                    />
                    <Rating
                        label={`Rating`}
                        maxRating={6}
                    /> */}

                    {Object.entries(formAttributes).map(([attributeKey, attribute], AI) => {
                        const type = attribute.type;

                            const Component = setComponent(type === "html" ? "text" : type);
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
                <Signature />
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