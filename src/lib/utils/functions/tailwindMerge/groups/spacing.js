import { format } from "lib/utils";

const prefixes = [
    "p", "pb", "pe", "pl", "pr", "ps", "pt", "px", "py",
    "m", "mb", "me", "ml", "mr", "ms", "mt", "mx", "my",
    "gap", "gap-x", "gap-y",
    "bottom", "left", "top", "right",
    "inset", "inset-x", "inset-y",
    "w", "min-w", "max-w",
    "h", "min-h", "max-h"
];

const variables = ["app-xxs", "app-xs", "app-sm", "app-base", "app-md", "app-lg", "app-xl"];

export const mergedSpacingClass = format(prefixes, variables);

const test = {
    duration: {
        prefixes: [],
        variables: []
    },
}