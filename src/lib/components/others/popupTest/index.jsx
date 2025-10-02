import { Button } from "../Button";
import { Overlay } from "../Overlay";
import { useStates } from "../../../hooks";
import { isNull } from "../../../utils/functions";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export const Popup = ({
    overlay = {
        variant: {
            classNames: {
                overlay: null
            }
        },
        ...props
    },
    closeOnClickOverlay = true,
    closeOnMove = true,
    isVisible = false,
    setVisibility = () => {},
    position = null,
    variant = {
        classNames: {
            panel: null,
            icon: null,
        }
    },
    children = null,
    ...props
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
        case "left"  : positionClass = `${isVisible ? "translate-x-0" : "-translate-x-full point-events-none"} fixed left-0 top-0 bottom-0 rounded-r-md`;
                       icon = "absolute-v-center right-4 h-8 w-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientX";
                       break;
        case "top"   : positionClass = `${isVisible ? "translate-y-0" : "-translate-y-full point-events-none"} fixed top-0 left-0 right-0 rounded-b-md`;
                       icon = "absolute-h-center bottom-4 w-8 h-2";
                       cannotClose = moveTouch + moveMin < startTouch;
                       client = "clientY";
                       break;
        case "right" : positionClass = `${isVisible ? "translate-x-0" : "translate-x-full point-events-none"} fixed right-0 top-0 bottom-0 rounded-l-md`;
                       icon = "absolute-v-center left-4 h-8 w-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientX";
                       break;
        case "bottom": positionClass = `${isVisible ? "translate-y-0" : "translate-y-full point-events-none"} fixed bottom-0 left-0 right-0 rounded-t-md`;
                       icon = "absolute-h-center top-4 w-8 h-2";
                       cannotClose = moveTouch - moveMin > startTouch;
                       client = "clientY";
                       break;
    }
   
    return (
        <>
            {overlay && <Overlay isVisible={isVisible} setVisibility={value => closeOnClickOverlay && setVisibility(value)} { ...overlay} />}
            <div
                style={{ 
                    "--duration": "300ms",
                }}
                className={twMerge(`z-30 p-4 duration-(--duration) bg-strong ${positionClass}`, classNames.panel)}
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