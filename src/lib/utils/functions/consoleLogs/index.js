import { Log } from "nice-logs";

const logCustom = (status, color, ...messages) => Log.custom(status,`background-color: ${color}; color: white; padding: 0px 5px; border-radius: 999px; font-weight: bold;`, true, ...messages)

export const log = {
    state: (...messages) => logCustom("STATE", "blue", ...messages),
    globalState: (...messages) => logCustom("GLOBAL STATE", "darkcyan", ...messages),
    effect: (...messages) => logCustom("EFFECT", "purple", ...messages),
    error: (...messages) => logCustom("ERROR", "red", ...messages),
    success: (...messages) => logCustom("SUCCESS", "green", ...messages),
    warning: (...messages) => logCustom("WARNING", "goldenrod", ...messages),
    info: (...messages) => logCustom("INFO", "grey", ...messages),
    custom: (status, color, ...messages) => logCustom(status, color, ...messages),
    apiError: (status, ...messages) => logCustom(status, "red", ...messages),
    apiSuccess: (status, ...messages) => logCustom(status, "green", ...messages),
    location: (...messages) => logCustom("LOCATION", "mediumvioletred"),
    page: (...messages) => logCustom("PAGE", "darkorange", ...messages),
};