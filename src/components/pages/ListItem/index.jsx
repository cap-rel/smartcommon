import { BsRocketFill } from "react-icons/bs";
import { FaSyncAlt } from "react-icons/fa";
import { FaFilePen, FaQuestion } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { formatDate, isNil } from "../../../globals";
import { Tag } from "../../others/Tag";

export const ListItem = (props) => {
    const { intervention, type = "mine", isInCalendarMode, isSyncing, ...containerProps } = props;
    const { ref, label, priority, status, date_inter } = intervention;

    const statusList = {
        STATUS_TOCOMPLETE: { label: "Incomplète", color: "to-complete" },
        STATUS_INPROGRESS: { label: "En cours", color: "in-progress" },
        STATUS_DONE: { label: "Terminée", color: "done" },
    };

    const statusLabel = statusList[status]?.label;
    const statusColor = statusList[status]?.color;

    const typesList = {
        intervention: { icon: BsRocketFill, color: "mine" },
        update: { icon: FaSyncAlt, color: "update" },
    };

    const Icon = typesList[type].icon;
    const iconColor = typesList[type].color;

    const time = formatDate(new Date(date_inter), "HH:mm")

    return (
        <div className={`flex items-center ${isInCalendarMode && "px-app-base gap-app-base"}`}>
            {isInCalendarMode && 
                <div className={`text-soft-text font-app-semibold`}>
                    {/* {time.startsWith("0") ? time.slice(1) : time} */}
                    {time}
                </div>
            }
            <div 
                { ...containerProps}
                className={`
                    w-full flex items-center gap-app-sm text-soft-text px-app-base py-app-xs 
                    ${isInCalendarMode && "shadow-md rounded-app-md"}
                    ${isSyncing ? "brightness-soft" : "active:brightness-soft"} duration-(--really-quick) bg-soft-bg
                `}
            >
                {!isInCalendarMode &&
                    <div
                        style={{ "--icon-color": `var(--color-${iconColor})` }}
                        className={`p-app-sm bg-(--icon-color)/15 rounded-app-md`}
                    >
                        <Icon className={`text-(--icon-color) text-2xl ${isSyncing && "animate-spin"}`} /> 
                    </div>
                }
                <div className="flex flex-col grow">
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className="text-primary font-app-semibold line-clamp-1">
                            {ref}
                        </div>
                        <Tag color={statusColor}>
                            {statusLabel}
                        </Tag>
                    </div>
                    {!isInCalendarMode &&
                        <div className={`text-soft-text font-app-semibold`}>
                            {/* {time.startsWith("0") ? time.slice(1) : time} */}
                            {time}
                        </div>
                    }
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className={`text-strong-text line-clamp-1 ${isNil(label) && "opacity-0"}`}>
                            {label ?? "nolabel"}
                        </div>
                        {priority &&
                            <div className="flex items-center gap-app-xxs text-urgent text-app-xs uppercase font-app-semibold">
                                <IoWarning className={`text-app-sm`} />
                                <div>
                                    Urgente
                                </div>
                            </div>
                        }
                    </div>
                </div>
                
            </div>
        </div>
    );
};