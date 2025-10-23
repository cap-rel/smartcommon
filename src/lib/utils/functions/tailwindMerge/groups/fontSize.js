import { format } from "../functions";

const prefixes = ["text"];

const variables = [
    "app-xxs",
    "app-xs",
    "app-sm",
    "app-base",
    "app-md",
    "app-lg",
    "app-xl",
    "app-2xl",
    "app-3xl",
    "app-4xl",
    "app-5xl",
    "app-6xl"
];

export const mergedFontSizeClass = format(prefixes, variables);