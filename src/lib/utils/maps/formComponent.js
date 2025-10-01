import { useMemo } from "react";
import { AddressInput, Array, Boolean, Checker, ColorPicker, Timer, Editor, FilesUploader, Gps, Input, RangeInput, Rater, Select, SignaturePad, PhotosUploader, Textarea, VideosUploader, AudiosUploader } from "../../components";
import { isUndefined } from "../functions";

export function SetFormComponent(type) {
    const FORM_COMPONENTS_MAP = useMemo(() => ({
        boolean      : Boolean,
        check        : Checker,
        select       : Select,
        array        : Array,
        varchar      : Input,
        email        : Input,
        password     : Input,
        phoneNumber  : Input,
        url          : Input,
        ip           : Input,
        // link         : Input,
        timestamp    : Input,
        date         : Input,
        datetime     : Input,
        time         : Input,
        int          : Input,
        float        : Input,

        // stock        : Input,
        // reel         : Input,
        // price        : Input,
        // pricey       : Input,
        // double       : Input,

        rating       : Rater,
        range        : RangeInput,
        duration     : Timer,
        text         : Textarea,
        html         : Editor,
        address      : AddressInput,
        gpsPoints    : Gps,
        files        : FilesUploader,
        audios       : AudiosUploader,
        videos       : VideosUploader,
        photos       : PhotosUploader,
        signature    : SignaturePad,
        // icon         : IconSelect,
        color        : ColorPicker,
    }));

    // console.log(COMPONENTS_MAP[type])

    // if (isUndefined(COMPONENTS_MAP[type])) {
    //     console.error(`${type} is not a valid type.`);
    //     return;
    // }

    return FORM_COMPONENTS_MAP[type];
}
