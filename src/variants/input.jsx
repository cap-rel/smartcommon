import { FaRegCalendarDays, FaRegEnvelope } from "react-icons/fa6";
import { formatDate } from "../globals";

//   const inputs = {
//     varchar      : { inputType: "text", defaultValue: "" },
//     email        : { inputType: "email", defaultValue: "" },
//     password     : { inputType: isPasswordVisible ? "text" : "password", defaultValue: "" },
//     phoneNumber  : { inputType: "tel", defaultValue: "" },
//     url          : { inputType: "url", defaultValue: "" },
//     date         : { inputType: "date", defaultValue: formatDate(date, "YYYY-MM-DD") },
//     timestamp    : { inputType: "number", defaultValue: formatDate(date) },
//     time         : { inputType: "time", defaultValue: formatDate(date, "HH:mm") },
//     datetime     : { inputType: "datetime-local", defaultValue: formatDate(date, "YYYY-MM-DDTHH:mm") },
//     int          : { inputType: "number", defaultValue: 0 },
//     float        : { inputType: "number", defaultValue: 0 },
//   };

export const varchar = {
    inputProps: {
        type: "text",
        defaultValue: "",
    }
};

export const email = {
    icon: <FaRegEnvelope />,
    inputProps: {
        type: "email",
        placeholder: "address@email.com",
        defaultValue: "",
    }
};

export const password = {
    inputProps: {
        type: "password",
        defaultValue: "",
    }
};

export const phoneNumber = {
    inputProps: {
        type: "tel",
        defaultValue: "",
        // max,
        // pattern,
    }
};

export const url = {
    inputProps: {
        type: "tel",
        defaultValue: "",
        // pattern: "",
    }
};

export const date = {
    inputProps: {
        type: "date",
        icon: FaRegCalendarDays,
        defaultValue: ({ required }) => required && formatDate(new Date, "YYYY-MM-DD")
    }
};

export const datetime = {
    inputProps: {
        type: "datetime-local",
        defaultValue: ({ required }) => required && formatDate(new Date, "YYYY-MM-DDTHH:mm")
    }
};

export const time = {
    inputProps: {
        type: "time",
        defaultValue: ({ required }) => required && formatDate(new Date, "YYYY-MM-DDTHH:mm")
    }
};

export const timestamp = {
    inputProps: {
        type: "number",
        defaultValue: ({ required }) => required && formatDate(new Date)
    }
};

export const int = {
    inputProps: {
        type: "text",
        inputMode: "numeric",
        // pattern: ""
    }
};

export const float = {
    inputProps: {
        type: "text",
        inputMode: "decimal",
        // pattern: ""
    }
};

// export const search = {

// };