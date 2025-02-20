import { Button } from "../Button";
import { Overlay } from "../Overlay";
import { useStates } from "../../../hooks";
import { isNull } from "../../../globals/functions";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export const Panel = ({
    closeOnClickOverlay = true,
    closeOnMove = true,
    isVisible = false,
    setVisibility = () => {},
    floating = false,
    position = "left",
    variant = {
        classNames: {
            overlay: null,
            panel: null,
            icon: null
        },
    },
    children = null,
}) => {
    const { classNames } = variant;

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
        case "top"   : positionClass = `${isVisible ? "translate-y-0" : "-translate-y-(--translate) point-events-none"} ${floating ? "top-2 left-2 right-2 rounded-xl" : "top-0 left-0 right-0 rounded-r-xl"} fixed`;
                       icon = "absolute-h-center bottom-4 w-8 h-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientY";
                       break;
        case "right" : positionClass = `${isVisible ? "translate-x-0" : "translate-x-(--translate) point-events-none"} ${floating ? "right-2 top-2 bottom-2 rounded-xl" : "right-0 top-0 bottom-0 rounded-r-xl"} fixed`;
                       icon = "absolute-v-center left-4 h-8 w-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientX";
                       break;
        case "bottom": positionClass = `${isVisible ? "translate-y-0" : "translate-y-(--translate) point-events-none"} ${floating ? "bottom-2 left-2 right-2 rounded-xl" : "bottom-0 left-0 right-0 rounded-r-xl"} fixed`;
                       icon = "absolute-h-center top-4 w-8 h-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientY";
                       break;
        default      : positionClass = `${isVisible ? "translate-x-0" : "-translate-x-(--translate) point-events-none"} ${floating ? "left-2 top-2 bottom-2 rounded-xl" : "left-0 top-0 bottom-0 rounded-r-xl"} fixed`;
                       icon = "absolute-v-center right-4 h-8 w-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientX";
                       break;
    }
   
    return (
        <>
            <Overlay 
                isVisible={isVisible} 
                setVisibility={value => closeOnClickOverlay && setVisibility(value)} 
                variant={{
                    classNames: {
                        overlay: classNames.overlay
                    }
                }}
            />
            <div
                style={{ 
                    "--duration": "300ms",
                    "--translate": floating ? "calc(100% + 8px)" : "100%"
                }}
                className={twMerge(`z-50 p-4 duration-(--duration) bg-strong ${positionClass}`, classNames.panel)}
                onTouchStart={e => {
                    set("startTouch", e.touches[0][client]);
                    set("moveTouch", e.touches[0][client]);
                }}
                onTouchMove={e => set("moveTouch", e.touches[0][client])}
                onTouchEnd={e => {
                    if (closeOnMove) {
                        setVisibility(!cannotClose);
                    }
                    set("startTouch", null);
                    set("moveTouch", null);
                }}
            >
                <div className={twMerge(`absolute rounded-full bg-soft-text ${icon}`, classNames.icon)}/>
                {children}
            </div>
        </>
    );
};