// const { states, set } = useStates({
    //     startTouch: null,
    //     moveTouch: null
    // })

    // const { startTouch, moveTouch } = states;

    // const moveMin = 30;
    
    // let positionClass;
    // let icon;
    // let cannotClose;
    // let client;

    // switch (position) {
    //     case "top"   : positionClass = `${isOpen ? "top-(--initial)" : "-top-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-b-xl"} fixed pb-10`;
    //                    icon = "absolute-h-center bottom-4 w-8 h-2";
    //                    cannotClose = moveTouch + moveMin < startTouch;
    //                    client = "clientY";
    //                    break;
    //     case "right" : positionClass = `${isOpen ? "right-(--initial)" : "-right-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-l-xl"} fixed pl-10`;
    //                    icon = "absolute-v-center left-4 h-8 w-2";
    //                    cannotClose = moveTouch - moveMin > startTouch;
    //                    client = "clientX";
    //                    break;
    //     case "bottom": positionClass = `${isOpen ? "bottom-(--initial)" : "-bottom-(--translate) point-events-none"} ${floating ? "left-2 right-2 rounded-xl" : "left-0 right-0 rounded-t-xl"} fixed pt-10`;
    //                    icon = "absolute-h-center top-4 w-8 h-2";
    //                    cannotClose = moveTouch - moveMin > startTouch;
    //                    client = "clientY";
    //                    break;
    //     default      : positionClass = `${isOpen ? "left-(--initial)" : "-left-(--translate) point-events-none"} ${floating ? "top-2 bottom-2 rounded-xl" : "top-0 bottom-0 rounded-r-xl"} fixed pr-10`;
    //                    icon = "absolute-v-center right-4 h-8 w-2";
    //                    cannotClose = moveTouch + moveMin < startTouch;
    //                    client = "clientX";
    //                    break;
    // }