import { BsRocketFill } from "react-icons/bs";
import { FaSyncAlt } from "react-icons/fa";
import { FaFilePen, FaQuestion } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { isNil } from "../../../globals";

export const ListItem = (props) => {
    const { intervention, type = "mine", isSyncing, ...containerProps } = props;
    const { ref, label, priority, status } = intervention;

    const statusList = {
        STATUS_TOCOMPLETE: { label: "Incomplète", color: "to-complete" },
        STATUS_INPROGRESS: { label: "En cours", color: "in-progress" },
        STATUS_DONE: { label: "Terminée", color: "done" },
        draft: { label: "Brouillon", color: "draft" },
        update: { label: "A Synchroniser", color: "primary" }
    };

    const statusLabel = statusList[status]?.label;
    const statusColor = statusList[status]?.color;

    const typesList = {
        mine: { icon: BsRocketFill, color: "mine" },
        unassigned: { icon: FaQuestion, color: "unassigned" },
        update: { icon: FaSyncAlt, color: "update" },
        draft: { icon: FaFilePen, color: "draft" }
    };

    const Icon = typesList[type].icon;
    const iconColor = typesList[type].color;

    return (
        <div 
            { ...containerProps}
            className={`flex items-center gap-app-sm text-soft-text px-app-base py-app-sm ${isSyncing ? "brightness-soft" : "active:brightness-soft"} duration-(--really-quick) bg-soft-bg`}
        >
            <div
                style={{ "--icon-color": `var(--color-${iconColor})` }}
                className={`p-app-sm bg-(--icon-color)/10 rounded-app-md`}
            >
                <Icon className={`text-(--icon-color) text-2xl ${isSyncing && "animate-spin"}`} /> 
            </div>
            {/* <div>
                {icon}
            </div> */}
            <div className="flex flex-col gap-app-xxs grow">
                <div className="flex gap-app-sm justify-between items-center">
                    <div className="text-primary font-app-semibold line-clamp-1">
                        {ref}
                    </div>
                    <div 
                        style={{ 
                            "--status-strong-color": `var(--color-strong-${statusColor}-status)`,
                            "--status-color": `var(--color-${statusColor}-status)`
                        }}
                        className="whitespace-nowrap tracking-wide px-app-sm py-app-xxs uppercase rounded-full text-app-xs font-app-semibold text-(--status-strong-color) bg-(--status-color)/20"
                    >
                        {statusLabel}
                    </div>
                </div>
                <div className="flex gap-app-sm justify-between items-center">
                    <div className={`text-strong-text line-clamp-1 ${isNil(label) && "opacity-0"}`}>
                        {label ?? "nolabel"}
                    </div>
                    {priority &&
                        <div className="flex items-center gap-app-xxs text-urgent text-app-xs italic uppercase font-app-semibold">
                            <IoWarning />
                            <div>
                                Urgente
                            </div>
                        </div>
                    }
                </div>
            </div>
            
        </div>
    );
};