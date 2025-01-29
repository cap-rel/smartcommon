import { isUndefined, setEmptyValue } from "../../functions";

function setActionValues(attribute) {
    const { type } = attribute;

    const ACTION_BUILDER_DEFAUlt_VALUES_MAP = {
        boolean      : { hidden: false },
        checkbox     : { hidden: false },
        select       : { hidden: false },
        radio        : { hidden: false },
        multiCheckbox: { hidden: false },
        multiSelect  : { hidden: false },
        array        : { hidden: false },
        varchar      : { hidden: false },
        mail         : { },
        password     : { hidden: false }, 
        phone        : { hidden: false },
        url          : { hidden: false },
        ip           : { hidden: false },
        link         : { hidden: false },
        timestamp    : { hidden: false },
        date         : { hidden: false },
        datetime     : { hidden: false },
        time         : { hidden: false },
        int          : { hidden: false },
        stock        : { hidden: false },
        reel         : { hidden: false },
        price        : { hidden: false },
        pricey       : { hidden: false },
        rating       : { hidden: false },
        range        : { hidden: false },
        duration     : { hidden: false },
        double       : { hidden: false },
        text         : { hidden: false }, 
        html         : { hidden: false },
        address      : { hidden: false },
        gps          : { hidden: false },
        files        : { },
        audios       : { },
        videos       : { },
        photos       : { },
        signature    : { },
        drawing      : { },
        icon         : { },
        color        : { hidden: false },
    };

    if (isUndefined(ACTION_BUILDER_DEFAUlt_VALUES_MAP[type])) {
        console.error(`${type} n'est pas un type valide.`);
        return;
    }

    return { ...ACTION_BUILDER_DEFAUlt_VALUES_MAP[type], value: setEmptyValue(attribute)};
};

export default setActionValues;