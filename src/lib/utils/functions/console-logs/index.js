import { Log } from "nice-logs";

const logCustom = (status, color, message) => Log.custom(status,`background-color: ${color}; color: white; padding: 5px; border-radius: 9px; font-weight: bold;`, true, message)

export const log = {
    state: (message) => logCustom("STATE", "blue", message),
    effect: (message) => logCustom("EFFECT", "purple", message),
    error: (message) => logCustom("ERROR", "red", message),
    success: (message) => logCustom("SUCCESS", "green", message),
    warning: (message) => logCustom("WARNING", "goldenrod", message),
    info: (message) => logCustom("INFO", "grey", message),
    custom: (status, color, message) => logCustom(status, color, message),
    apiError: (status, message) => logCustom(status, "red", message),
    apiSuccess: (status, message) => logCustom(status, "green", message),
};