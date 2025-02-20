import { isUndefined } from "../..";

export function setComponent(type) {
    const COMPONENTS_MAP = {
        boolean      : "Boolean",
        checkbox     : "Checkbox",
        select       : "Select",
        radio        : "Radio",
        multiCheckbox: "Checkbox",
        multiSelect  : "Select",
        array        : "Array",
        varchar      : "Input",
        mail         : "Input",
        password     : "Input",
        phone        : "Input",
        url          : "Input",
        ip           : "Input",
        link         : "Input",
        timestamp    : "Input",
        date         : "Input",
        datetime     : "Input",
        time         : "Input",
        int          : "Stepper",
        stock        : "Stepper",
        reel         : "Stepper",
        price        : "Stepper",
        pricey       : "Stepper",
        rating       : "Rating",
        range        : "Range",
        duration     : "Duration",
        double       : "MultiNumber",
        text         : "Textarea",
        html         : "Editor",
        address      : "Address",
        gps          : "GpsPoints",
        files        : "Files",
        audios       : "Audios",
        videos       : "Videos",
        photos       : "Photos",
        signature    : "Signature",
        drawing      : "Drawing",
        icon         : "IconSelect",
        color        : "Checkbox",
    };

    if (isUndefined(COMPONENTS_MAP[type])) {
        console.error(`${type} n'est pas un type valide.`);
        return;
    }

    return COMPONENTS_MAP[type];
};