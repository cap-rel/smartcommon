// import { Link } from "react-router-dom";
import { Button, Panel, Tag } from "../../others";
import { useSelector } from "react-redux";
import { isArray, isNil, isObject } from "../../../globals";
import { BsRocketFill } from "react-icons/bs";
import { Datetime, String, Text } from "../../list";
import { FaBook, FaClock, FaTag } from "react-icons/fa6";

const Link = () => {
  return null;
}

export const DetailsHeaderItem = (props) => {
    const { icon, label, children } = props;
    return (
        <div className={`flex flex-col`}>
            <div className={`flex gap-app-xs items-center`}>
                <div className={`text-primary`} >
                    {icon}
                </div>
                <div className={`text-soft-text`}>
                    {label}
                </div>
            </div>
            <div className={``}>
                {children}
            </div>
        </div>
    );
}

export const DetailsPanel = (props) => {
    const { intervention, close, originLocation } = props;

    const { rowid: id, ref, label, date_inter: startDate, description, status } = intervention ?? {};

    const config = useSelector(state => state.config.data);

    const { label: configLabel, date_inter: configStartDate, description: configDescription } = config;

    const headerAttributes = ["label", "date_inter", "description"];

    const statusList = {
        STATUS_TOCOMPLETE: { label: "Incomplète", color: "to-complete", buttonText: "Compléter l'intervention" },
        STATUS_INPROGRESS: { label: "En cours", color: "in-progress", buttonText: "Poursuivre l'intervention" },
        STATUS_DONE: { label: "Terminée", color: "done", buttonText: "Compléter l'intervention" },
    };

    const statusLabel = statusList[status]?.label ?? null;
    const statusColor = statusList[status]?.color ?? null;
    const statusButtonText =  statusList[status]?.buttonText ?? "Commencer l'intervention";


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
            panelProps={{ className: "text-app-sm px-0 py-app-md gap-app-md" }}
        >
            <div className={`mx-auto w-app-xl h-app-xs bg-border rounded-full`} />
            <div className={`flex justify-between items-center px-app-md`}>
                <div className={`flex items-center gap-app-xs`}>
                    {/* <div className={`p-app-sm bg-primary/15 rounded-app-md`}> */}
                        <BsRocketFill className={`text-primary text-app-xl`} /> 
                    {/* </div> */}
                    <div className={`text-app-md text-center font-app-semibold`}>
                        {ref}
                    </div>
                </div>
                <Tag color={statusColor}>
                    {statusLabel}
                </Tag>
            </div>
            <div className={`overflow-y-auto flex flex-col divide-y divide-border`}>{/* border border-border rounded-app-md */}
                <div className={`flex justify-between gap-app-base pb-app-base px-app-md`}>
                    <DetailsHeaderItem
                        icon={<FaTag />}
                        label={configLabel?.label ?? "Label"}
                    >
                        <String value={label} />
                    </DetailsHeaderItem>
                    <DetailsHeaderItem
                        icon={<FaClock />}
                        label={configStartDate?.label ?? "Date d'intervention"}
                    >
                        <Datetime value={startDate} />
                    </DetailsHeaderItem>
                </div>
                <div className={`flex justify-between gap-app-xs py-app-base px-app-md`}>
                    <DetailsHeaderItem
                        icon={<FaBook />}
                        label={configDescription?.label ?? "Description"}
                    >
                        <Text value={description} />
                    </DetailsHeaderItem>
                </div>
                
                <div className={`flex flex-col pt-app-base`}>

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
                            if (isArray(visible) && visible.includes("read") && !headerAttributes.includes(attributeKey)) {
                                return (
                                    <div className="flex justify-between even:bg-medium-bg py-app-xs px-app-md"> {/* flex divide-x divide-border first:rounded-t-md last:rounded-b-md even:bg-medium-bg */}
                                        <div className={`flex gap-app-xs basis-1/2`}>
                                            <div className={`text-primary`}>
                                                ●
                                            </div>
                                            <div className={`text-soft-text`}>
                                                {label}
                                            </div>
                                        </div>
                                        <div className={`text-strong-text basis-1/2`}>
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
            </div>
            <Link
                to={`/intervention/${id}`}
                state={{ originLocation }}
                className="mx-app-md"
            >
                <Button
                    buttonProps={{
                        className: "w-full uppercase font-app-base tracking-widest"
                    }}
                >
                    {statusButtonText}
                </Button>
            </Link>
        </Panel>
    );
};