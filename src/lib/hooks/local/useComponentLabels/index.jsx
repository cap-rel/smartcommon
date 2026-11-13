import { castArray, isNil, isPlainObject, isString } from "lodash";

import { useLibConfig } from "lib/hooks/global/useLibConfig";

/**
 * Labels of a component that does not go through useVariantMerger.
 *
 * An app can give the labels of every component once, on the Provider
 * (`config.components.theme` + `themes`), instead of passing them on each
 * use. useVariantMerger applies them to the components built on it; the
 * others (providers, prompts, modals...) read them here. The labels passed
 * as a prop are laid over the theme ones key by key, so overriding one text
 * keeps the theme's translation of the others.
 *
 * The component still merges its own DEFAULT_LABELS underneath.
 *
 * @param {string} componentKey Name of the component, as in the locale bundles
 * @param {object} [labels]     Labels passed as a prop
 * @returns {object} Theme labels overridden by the prop labels
 */
export const useComponentLabels = (componentKey, labels) => {
    const { components } = useLibConfig() ?? {};
    const { theme, themes, variants } = components ?? {};

    const themeEntry = themes?.[theme]?.[componentKey];
    const entries = isNil(themeEntry) ? [] : castArray(themeEntry);

    const themeLabels = entries.reduce((acc, entry) => {
        const variant = isString(entry) ? variants?.[componentKey]?.[entry] : entry;
        return isPlainObject(variant?.labels) ? { ...acc, ...variant.labels } : acc;
    }, {});

    return { ...themeLabels, ...(isPlainObject(labels) ? labels : {}) };
};
