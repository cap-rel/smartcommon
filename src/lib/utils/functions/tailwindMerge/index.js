// import { extendTailwindMerge } from 'tailwind-merge'
// import { mergedFontSizeClass, mergedRadiusClass, mergedSpacingClass } from './groups';
// import { useComponents } from 'lib/hooks';

// export const twMerge = () => {
//     const { tailwindMerge } = useComponents() ?? {};

//     // const classGroups = Object.entries(tailwindMerge).reduce((acc, [key, { prefixes, variables }]) => {
//     //     acc = { ...acc, [key]: format(prefixes, variables) };
//     //     return acc;
//     // }, {});
    
//     return extendTailwindMerge({
//         extend: {
//             classGroups: {
//                 ...mergedSpacingClass,
//                 ...mergedRadiusClass,
//                 "font-size": mergedFontSizeClass,
//                 // ...classGroups
//             }
//         }
//     });
// };

// // TODO if we want to complete a group => { ...classGroups, font-size: [...prevFontSize, fontSize]}

import { extendTailwindMerge } from 'tailwind-merge'

const spacing = [
    "p", "pb", "pe", "pl", "pr", "ps", "pt", "px", "py",
    "m", "mb", "me", "ml", "mr", "ms", "mt", "mx", "my",
    "gap", "gap-x", "gap-y",
    "bottom", "left", "top", "right",
    "inset", "inset-x", "inset-y",
    "w", "min-w", "max-w",
    "h", "min-h", "max-h"
];

const spacingVariables = ["app-xxs", "app-xs", "app-sm", "app-base", "app-md", "app-lg", "app-xl"];

const mergedSpacing = Object.fromEntries(spacing.map(type => [type, spacingVariables.map(variable => `${type}-${variable}`)]));

const radius = [
    "rounded",
    "rounded-l",
    "rounded-r",
    "rounded-b", "rounded-br", "rounded-bl",
    "rounded-t", "rounded-tr", "rounded-tl",
    "rounded-e", "rounded-ee", "rounded-es",
    "rounded-s", "rounded-se", "rounded-ss"
];

const radiusVariables = ["app-base", "app-md", "app-lg", "app-xl"];

const mergedRadius = Object.fromEntries(radius.map(type => [type, radiusVariables.map(variable => `${type}-${variable}`)]));

export const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            ...mergedSpacing,
            ...mergedRadius,
            "font-size": [
                "text-app-xxs",
                "text-app-xs",
                "text-app-sm",
                "text-app-base",
                "text-app-md",
                "text-app-lg",
                "text-app-xl",
                "text-app-2xl",
                "text-app-3xl",
                "text-app-4xl",
                "text-app-5xl",
                "text-app-6xl",
            ],
        }
    }
})
