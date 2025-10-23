import { format } from "../functions";

const prefixes = [
    "rounded",
    "rounded-l",
    "rounded-r",
    "rounded-b", "rounded-br", "rounded-bl",
    "rounded-t", "rounded-tr", "rounded-tl",
    "rounded-e", "rounded-ee", "rounded-es",
    "rounded-s", "rounded-se", "rounded-ss"
];

const variables = ["app-base", "app-md", "app-lg", "app-xl"];

export const mergedRadiusClass = format(prefixes, variables);