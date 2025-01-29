import { isInvalid, isNumber, isUndefined } from "../..";

function setEmptyValue(attribute) {
    const { type, default: defaultValue, min, max, ratingMax } = attribute;
    const filteredMin = isInvalid(min) ? 0 : min;
    const filteredMax = isInvalid(max) ? 100 : max
    const filteredRatingMax = isInvalid(ratingMax) ? 5 : ratingMax;

    const EMPTY_VALUES_MAP = {
        boolean      : isInvalid(defaultValue) ? false : defaultValue,
        checkbox     : isInvalid(defaultValue) ? "" : defaultValue,
        select       : isInvalid(defaultValue) ? "" : defaultValue,
        radio        : isInvalid(defaultValue) ? "" : defaultValue,
        multiCheckbox: isInvalid(defaultValue) ? [] : defaultValue,
        multiSelect  : isInvalid(defaultValue) ? [] : defaultValue,
        array        : isInvalid(defaultValue) ? [] : defaultValue,
        varchar      : isInvalid(defaultValue) ? "" : defaultValue,
        mail         : isInvalid(defaultValue) ? "" : defaultValue,
        password     : isInvalid(defaultValue) ? "" : defaultValue,
        phone        : isInvalid(defaultValue) ? "" : defaultValue,
        url          : isInvalid(defaultValue) ? "" : defaultValue,
        ip           : isInvalid(defaultValue) ? "" : defaultValue,
        link         : isInvalid(defaultValue) ? "" : defaultValue,
        timestamp    : isInvalid(defaultValue) ? "" : defaultValue,
        date         : isInvalid(defaultValue) ? "" : defaultValue,
        datetime     : isInvalid(defaultValue) ? "" : defaultValue,
        time         : isInvalid(defaultValue) ? "" : defaultValue,
        int          : isInvalid(defaultValue) ? "" : defaultValue,
        stock        : isInvalid(defaultValue) ? "" : defaultValue,
        reel         : isInvalid(defaultValue) ? "" : defaultValue,
        price        : isInvalid(defaultValue) ? "" : defaultValue,
        pricey       : isInvalid(defaultValue) ? "" : defaultValue,
        rating       : (isInvalid(defaultValue) || defaultValue < 0 || defaultValue > filteredRatingMax) ? 0 : defaultValue,
        range        : (isInvalid(defaultValue) || defaultValue < filteredMin || defaultValue > filteredMax) ? filteredMin : defaultValue,
        duration     : (isInvalid(defaultValue) || defaultValue < 0) ? 0 : defaultValue,
        double       : isInvalid(defaultValue) ? ["", ""] : defaultValue,
        text         : isInvalid(defaultValue) ? "" : defaultValue,
        html         : isInvalid(defaultValue) ? "" : defaultValue,
        address      : isInvalid(defaultValue) ? "" : defaultValue,
        gps          : isInvalid(defaultValue) ? null : defaultValue,
        files        : isInvalid(defaultValue) ? [] : defaultValue,
        audios       : isInvalid(defaultValue) ? [] : defaultValue,
        videos       : isInvalid(defaultValue) ? [] : defaultValue,
        photos       : isInvalid(defaultValue) ? [] : defaultValue,
        signature    : isInvalid(defaultValue) ? null : defaultValue,
        drawing      : isInvalid(defaultValue) ? null : defaultValue,
        icon         : isInvalid(defaultValue) ? null : defaultValue,
        color        : isInvalid(defaultValue) ? null : defaultValue,
    };

    if (isUndefined(EMPTY_VALUES_MAP[type])) {
        console.error(`${type} n'est pas un type valide.`);
        return;
    }

    return EMPTY_VALUES_MAP[type];
}

export default setEmptyValue;