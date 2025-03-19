import { Button } from "../Button";
import { Overlay } from "../Overlay";
import { useStates } from "../../../hooks";
import { isNull } from "../../../globals/functions";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

// TODO Fix closeOnMove system

export const Panel = ({
    overlay = true,
    shadow = false,
    closeOnClickOverlay = true,
    closeOnMove = false,
    isOpen = false,
    closePanel = () => {},
    floating = false,
    position = "left",
    overlayProps,
    panelProps,
    iconProps,
    ...props
}) => {
    const panelPs = { ...props, ...panelProps };

    const { children } = panelPs;
    
    const { states, set } = useStates({
        startTouch: null,
        moveTouch: null
    })

    const { startTouch, moveTouch } = states;

    const moveMin = 30;
    
    let positionClass;
    let icon;
    let cannotClose;
    let client;

    switch (position) {
        case "top"   : positionClass = `${isOpen ? "top-(--initial)" : "-top-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-b-xl"} fixed pb-10`;
                       icon = "absolute-h-center bottom-4 w-8 h-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientY";
                       break;
        case "right" : positionClass = `${isOpen ? "right-(--initial)" : "-right-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-l-xl"} fixed pl-10`;
                       icon = "absolute-v-center left-4 h-8 w-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientX";
                       break;
        case "bottom": positionClass = `${isOpen ? "bottom-(--initial)" : "-bottom-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-t-xl"} fixed pt-10`;
                       icon = "absolute-h-center top-4 w-8 h-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientY";
                       break;
        default      : positionClass = `${isOpen ? "left-(--initial)" : "-left-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-r-xl"} fixed pr-10`;
                       icon = "absolute-v-center right-4 h-8 w-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientX";
                       break;
    }
   
    return (
        <>
            <Overlay 
                { ...overlayProps}
                isOpen={isOpen} 
                closeOverlay={closeOnClickOverlay && closePanel} 
            />
            <div
                { ...panelPs}
                style={{ 
                    "--duration": "300ms",
                    "--initial": floating ? "8px" : "0",
                    "--translate": floating ? "calc(100% + 8px)" : "100%",
                    ...panelPs?.style
                }}
                className={twMerge(`max-h-screen max-w-screen overflow-auto z-50 p-4 gap-4 col duration-(--duration) bg-strong ${positionClass}`, panelPs?.className)}
                onTouchStart={e => {
                    set("startTouch", e.touches[0][client]);
                    set("moveTouch", e.touches[0][client]);
                }}
                onTouchMove={e => set("moveTouch", e.touches[0][client])}
                onTouchEnd={e => {
                    if (closeOnMove && cannotClose) {
                        closePanel();
                    }
                    set("startTouch", null);
                    set("moveTouch", null);
                }}
            >
                <div 
                    { ...iconProps}
                    className={twMerge(`rounded-full bg-strong-border ${icon}`, iconProps?.className)}
                />
                {children}
            </div>
        </>
    );
};