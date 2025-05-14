import { useMemo } from "react";
import { Address, Array, Audios, Boolean, Check, ColorPicker, Duration, Editor, Files, GpsPoints, Input, Photos, Range, Rating, Select, Signature, SmartPhotos, Textarea, Videos } from "../../components";
import { isUndefined } from "../functions";
import { SmartVideos } from "../../components/form/SmartVideos";
import { SmartAudios } from "../../components/form/SmartAudios";

export function setComponent(type) {
    const COMPONENTS_MAP = useMemo(() => ({
        boolean      : Boolean,
        check        : Check,
        select       : Select,
        array        : Array,
        varchar      : Input,
        email        : Input,
        password     : Input,
        phoneNumber  : Input,
        url          : Input,
        ip           : Input,
        link         : Input,
        timestamp    : Input,
        date         : Input,
        datetime     : Input,
        time         : Input,
        int          : Input,
        stock        : Input,
        reel         : Input,
        price        : Input,
        pricey       : Input,
        double       : Input,
        rating       : Rating,
        range        : Range,
        duration     : Duration,
        text         : Textarea,
        html         : Editor,
        address      : Address,
        gpsPoints    : GpsPoints,
        files        : Files,
        audios       : SmartAudios,
        videos       : SmartVideos,
        photos       : SmartPhotos,
        signature    : Signature,
        // icon         : IconSelect,
        color        : ColorPicker,
    }));

    // console.log(COMPONENTS_MAP[type])

    // if (isUndefined(COMPONENTS_MAP[type])) {
    //     console.error(`${type} is not a valid type.`);
    //     return;
    // }

    return COMPONENTS_MAP[type];
}
