// Counter badge shown on Button, UpperNavbarItem, TabbarItem and Sidebar
// links. A badge is a count: nothing to show for 0 or an empty value, and a
// large count is capped so the pill keeps its size. A short text ("new",
// "!") is kept as given.

export const BADGE_MAX_COUNT = 99;

// Shared look of the counter pill, pinned to the top-right corner of a
// `relative` host. The ring separates it from a host of the same color.
export const BADGE_CLASS_NAME = `absolute top-0 right-0 -translate-y-1/2 translate-x-1/2
    pointer-events-none flex justify-center items-center min-h-5 min-w-5 px-app-xxs
    rounded-full bg-error text-white text-app-xs font-app-semibold leading-none
    ring-2 ring-soft-bg`;

const NUMERIC = /^\d+$/;

/**
 * Text to render in a counter badge, or null when no badge must be shown.
 *
 * @param {number|string|null|undefined} value - Count, or a short text
 * @param {number} [max=BADGE_MAX_COUNT] - Counts above it render as "max+"
 * @returns {string|null}
 */
export const formatBadgeCount = (value, max = BADGE_MAX_COUNT) => {
    if (value === null || value === undefined) return null;

    if (typeof value === "number") {
        if (!globalThis.Number.isFinite(value) || value <= 0) return null;
        const count = Math.floor(value);
        if (count <= 0) return null;
        return count > max ? `${max}+` : `${count}`;
    }

    const text = `${value}`.trim();
    if (text === "") return null;
    // A count passed as a string ("3", "150") follows the number rules.
    if (NUMERIC.test(text)) return formatBadgeCount(globalThis.Number(text), max);
    return text;
};
