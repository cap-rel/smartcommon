import { Link } from "react-router-dom";
import { Button, Panel } from "../../others";
import { useSelector } from "react-redux";
import { isArray, isNil, isObject } from "../../../globals";

export const DetailsPanel = (props) => {
    const { intervention, close, originLocation } = props;

    const { rowid: id, ref } = intervention ?? {};

    const config = useSelector(state => state.config.data);


    // address => text + button
    // array => tags
    // audios, photos, videos and files => panel (multiple) + popup
    // boolean => boolean readOnly
    // check => tags
    // color => circle of color
    // duration => formatted time
    // html => text (overflow-y-auto)
    // gpsPoints => "Localisé" + button
    // icon => icon
    // varchar => text
    // email => text (italic + underline) + button
    // password => *******
    // phoneNumber => text (bold) + button
    // url => text + button
    // date => formatted date
    // datetime => formatted datetime
    // time => formatted time
    // timestamp > formatted datetime
    // int => text (bold)
    // float => text (bold)
    // rating => rating
    // range => range
    // text => text (overflow-y-auto)
    // select => tags
    // signature => panel

    // Tags 1 /
    // Files 0
    // Color 1 /
    // Duration 1 /
    // Text 1 /
    // Icon 1 
    // String 1 /
    // DateTime 1 /
    // Number 1 /
    // Rating 1 /
    // Signature 0

    // Url 1
    // PhoneNumber 1
    // Email 1
    // Gps 1
    // AddressInput 1

    return (
        <Panel
            isOpen={!isNil(intervention)}
            close={close}
            zIndex={60}
        >
            <div className={`mx-auto w-app-xl h-app-xs bg-border rounded-full`} />
            <div className="text-app-xl text-center font-app-bold">
                {ref}
            </div>
            <div className={`overflow-y-auto flex flex-col border border-border divide-y divide-border rounded-md`}>
                {!isNil(config) && Object.entries(config).map(([attributeKey, attribute], AI) => {
                    const { label, type, visible } = attribute;
                    if (type === "object") {
                        // return (
                        //     <details>
                        //         <summary className="flex font-app-bold px-4 py-3 first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                        //             {label}
                        //         </summary>
                        //         <div className={`flex flex-col divide-y divide-border`}>
                        //             {Object.entries(attribute).map(([objectAttributeKey, objectAttribute], AI) => {
                        //                 const { label, visible } = objectAttribute
                        //                 const test = ["type", "label", "position", "visible"];
                        //                 if (isArray(visible) && visible.includes("read") && !test.includes(objectAttributeKey)) {
                        //                     return (
                        //                         <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                        //                             <div className={`ml-app-base text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                        //                                 {label}
                        //                             </div>
                        //                             <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                        //                                 {!isObject(selectedIntervention?.[attributeKey]?.[objectAttributeKey]) && selectedIntervention?.[attributeKey]?.[objectAttributeKey]}
                        //                             </div>
                        //                         </div>
                        //                     );
                        //                 }
                        //             })}
                        //         </div>
                        //     </details>
                        // );
                    } else {
                        const { visible } = attribute;
                        if (isArray(visible) && visible.includes("read")) {
                            return (
                                <div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                                    <div className={`text-strong-text basis-1/2 px-app-sm py-app-xs font-app-semibold`}>
                                        {label}
                                    </div>
                                    <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                                        {!isObject(intervention?.[attributeKey]) && intervention?.[attributeKey]}
                                    </div>
                                </div>
                            )
                        }                
                    }
                    // if (isArray(visible) && visible.includes("read")) {
                    //     return (<div className="flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg">
                    //         <div className={`text-strong-text basis-1/2 px-4 py-3 font-app-semibold`}>
                    //             {label}
                    //         </div>
                    //         <div className={`px-4 py-3 text-soft-text basis-1/2`}>
                    //             {!isObject(selectedIntervention?.[attributeKey]) && selectedIntervention?.[attributeKey]}
                    //         </div>
                    //     </div>)
                    // }                           
                })}
            </div>
            <Link
                to={`/intervention/${id}`}
                state={{ originLocation }}
            >
                <Button
                    buttonProps={{
                        className: "w-full"
                    }}
                >
                    Commencer l'intervention
                </Button>
            </Link>
        </Panel>
    );
};