const formDefaultValues = (props) => {
    const { type, multiple } = props;

    const defaultValues = {
        boolean      : false,
        check        : multiple ? [] : "",
        select       : multiple ? [] : "",
        array        : [],
        varchar      : "",
        email        : "",
        password     : "",
        phoneNumber  : "",
        url          : "",
        ip           : "",
        // link         : "",
        timestamp    : "",
        date         : "",
        datetime     : "",
        time         : "",
        int          : "",
        float        : "",

        // stock        : Input,
        // reel         : Input,
        // price        : Input,
        // pricey       : Input,
        // double       : Input,

        rating       : 0,
        range        : 0,
        duration     : 0,
        text         : "",
        html         : "",
        address      : "",
        gpsPoints    : [null, null],
        files        : multiple ? [] : { src: "", title: "", description: "", capture: false, createdAt: "", gpsPoints: [null, null] },
        audios       : multiple ? [] : { src: "", title: "", description: "", capture: false, createdAt: "", gpsPoints: [null, null] },
        videos       : multiple ? [] : { src: "", title: "", description: "", capture: false, createdAt: "", gpsPoints: [null, null] },
        photos       : multiple ? [] : { src: "", title: "", description: "", capture: false, createdAt: "", gpsPoints: [null, null] },
        signature    : { src: "", signer: "", signedAt: null, gpsPoints: [null, null] },
        // icon         : IconSelect,
        color        : "",
    }
};