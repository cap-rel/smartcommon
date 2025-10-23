import { extendTailwindMerge } from 'tailwind-merge'
import { mergedFontSizeClass, mergedRadiusClass, mergedSpacingClass } from './groups';
import { useLib } from '../../../hooks';

export const twMerge = () => {
    const { tailwindMerge } = useLib();

    const classGroups = Object.entries(tailwindMerge).reduce((acc, [key, { prefixes, variables }]) => {
        acc = { ...acc, [key]: format(prefixes, variables) };
        return acc;
    }, {});
    
    return extendTailwindMerge({
        extend: {
            classGroups: {
                ...mergedSpacingClass,
                ...mergedRadiusClass,
                "font-size": mergedFontSizeClass,
                ...classGroups
            }
        }
    });
};

// TODO if we want to complete a group => { ...classGroups, font-size: [...prevFontSize, fontSize]}