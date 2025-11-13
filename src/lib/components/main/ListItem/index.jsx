import { IoWarning } from "react-icons/io5";
import { Tag, useVariantMerger } from "../../../export";
import { defaultProps, propTypes } from "./props";
import { BsRocketFill } from "react-icons/bs";
import { FaPencil, FaUserSlash } from "react-icons/fa6";

import logo from "../../../../dev/assets/images/icon.png"

export const ListItem = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("ListItem", props);
    const {
        id,
        responsive = true,
        logo,
        icon,
        link = false,
        status,
        title,
        subtitle,
        description,
        price,
        littleIcons
    } = variantProps;

    return (
        <div className={`flex items-center`}>
            <div 
                className={`
                    w-full flex items-center gap-app-sm text-soft-text px-app-base py-app-xs 
                    duration-(--quick) bg-soft-bg
                `}
            >
                {logo
                    ? <img src={logo} className="size-12" />
                    : icon &&
                        <div className={`p-app-sm bg-primary/15 rounded-app-md relative text-primary text-app-xl`}>
                            {icon?.()} 
                        </div>
                }
                <div className={`flex flex-col grow`}>
                    <div className="flex gap-app-sm justify-between items-center -mr-app-xs">
                        <div className="flex gap-app-xs items-center grow">
                            <div className="text-primary font-app-semibold line-clamp-1">
                                {title}
                            </div>
                            <FaPencil className={`text-primary shrink-0`} />
                        </div>
                        {status}
                    </div>
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className={`text-soft-text italic`}>
                            03/08/2003
                        </div>
                    </div>
                    <div className="flex gap-app-sm justify-between items-center">
                        <div className={`text-strong-text line-clamp-1 ${!description && "opacity-0"}`}>
                            label label
                        </div>
                        <div className="flex items-center gap-app-xxs text-app-lg uppercase font-app-semibold">
                            {/* {true && <IoWarning className={`text-urgent`} />} */}
                            {/* {true && <FaUserSlash className={`text-neutral`} />} */}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;