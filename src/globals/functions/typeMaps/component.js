import { isUndefined } from "../..";

function setComponent(type) {
    const COMPONENTS_MAP = {
        boolean      : "BooleanDol",
        checkbox     : "CheckboxDol",
        select       : "SelectDol",
        radio        : "RadioDol",
        multiCheckbox: "CheckboxDol",
        multiSelect  : "SelectDol",
        array        : "TagsDol",
        varchar      : "InputDol",
        mail         : "InputDol",
        password     : "InputDol",
        phone        : "InputDol",
        url          : "InputDol",
        ip           : "InputDol",
        link         : "InputDol",
        timestamp    : "InputDol",
        date         : "InputDol",
        datetime     : "InputDol",
        time         : "InputDol",
        int          : "StepperDol",
        stock        : "StepperDol",
        reel         : "StepperDol",
        price        : "StepperDol",
        pricey       : "StepperDol",
        rating       : "RatingDol",
        range        : "RangeDol",
        duration     : "DurationDol",
        double       : "MultiNumberDol",
        text         : "TextareaDol",
        html         : "EditorDol",
        address      : "AddressDol",
        gps          : "GpsDol",
        files        : "FilesDol",
        audios       : "AudiosDol",
        videos       : "VideosDol",
        photos       : "PhotosDol",
        signature    : "SignatureDol",
        drawing      : "DrawingDol",
        icon         : "IconSelectDol",
        color        : "ColorDol",
    };

    if (isUndefined(COMPONENTS_MAP[type])) {
        console.error(`${type} n'est pas un type valide.`);
        return;
    }

    return COMPONENTS_MAP[type];
};

export default setComponent;
