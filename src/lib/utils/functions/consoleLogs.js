// Log levels ordered by severity
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };

// Badge color palette for namespaces (auto-assigned)
const NAMESPACE_COLORS = [
    "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
    "#00bcd4", "#009688", "#4caf50", "#ff9800", "#795548",
    "#607d8b", "#f44336", "#8bc34a", "#03a9f4", "#ff5722",
];

// Predefined badge configs: [label, background-color, level]
const BADGES = {
    debug:      ["DEBUG",        "slategray",       "debug"],
    info:       ["INFO",         "grey",            "info"],
    success:    ["SUCCESS",      "green",           "info"],
    warning:    ["WARNING",      "goldenrod",       "warn"],
    error:      ["ERROR",        "red",             "error"],
    state:      ["STATE",        "blue",            "debug"],
    globalState:["GLOBAL STATE", "darkcyan",        "debug"],
    effect:     ["EFFECT",       "purple",          "debug"],
    location:   ["LOCATION",     "mediumvioletred", "debug"],
    page:       ["PAGE",         "darkorange",      "debug"],
    db:         ["DB",           "midnightblue",    "debug"],
    apiLoading: [null,           "grey",            "debug"],
    apiError:   [null,           "red",             "error"],
    apiSuccess: [null,           "green",           "info"],
};

let colorIndex = 0;
const nsColorMap = {};

const getBadgeCSS = (color) =>
    `background-color: ${color}; color: white; padding: 0px 5px; border-radius: 999px; font-weight: bold;`;

const getResetCSS = () => "background-color: transparent; color: inherit; font-weight: normal;";

/**
 * Returns the current effective log level.
 * Checks localStorage.LOG_LEVEL first, falls back to "debug" in dev, "warn" in prod.
 */
const getLogLevel = () => {
    try {
        const stored = localStorage.getItem("LOG_LEVEL");
        if (stored && LEVELS[stored] !== undefined) return stored;
    } catch (_) { /* SSR or restricted access */ }

    return (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ? "warn" : "debug";
};

/**
 * Checks if a given namespace passes the localStorage.LOG_FILTER.
 * If no filter is set, all namespaces pass.
 * Filter format: comma-separated prefixes, e.g. "useApi,Db"
 */
const passesNamespaceFilter = (namespace) => {
    if (!namespace) return true;
    try {
        const filter = localStorage.getItem("LOG_FILTER");
        if (!filter) return true;
        const prefixes = filter.split(",").map(s => s.trim()).filter(Boolean);
        return prefixes.some(prefix => namespace.startsWith(prefix));
    } catch (_) { return true; }
};

/**
 * Assigns a stable color to a namespace.
 */
const getNamespaceColor = (namespace) => {
    if (!nsColorMap[namespace]) {
        nsColorMap[namespace] = NAMESPACE_COLORS[colorIndex % NAMESPACE_COLORS.length];
        colorIndex++;
    }
    return nsColorMap[namespace];
};

/**
 * Core log function.
 * @param {string} label - Badge text (e.g. "ERROR", "DB", or custom)
 * @param {string} color - Badge background color
 * @param {string} level - Log level key ("debug" | "info" | "warn" | "error")
 * @param {string|null} namespace - Optional namespace for filtering
 * @param  {...any} messages - Data to log
 */
const logCore = (label, color, level, namespace, ...messages) => {
    // Level gate
    if (LEVELS[level] === undefined) level = "debug";
    if (LEVELS[level] < LEVELS[getLogLevel()]) return;

    // Namespace filter gate
    if (!passesNamespaceFilter(namespace)) return;

    // Pick the right console method
    const consoleFn = level === "error" ? console.error
        : level === "warn" ? console.warn
        : console.log;

    // Build styled prefix parts
    const parts = [];
    const styles = [];

    if (namespace) {
        parts.push(`%c ${namespace} `);
        styles.push(getBadgeCSS(getNamespaceColor(namespace)));
    }

    if (label) {
        parts.push(`%c ${label} `);
        styles.push(getBadgeCSS(color));
    }

    // Reset style before messages
    parts.push("%c");
    styles.push(getResetCSS());

    consoleFn(parts.join(""), ...styles, ...messages);
};

/**
 * Creates a namespaced logger with all standard methods.
 *
 * Usage:
 *   const log = createLogger("useApi");
 *   log.info("GET /users", { id: 42 });
 *   log.error("fetch failed", error);
 *   log.debug("raw response", data);
 *
 * Filtering:
 *   localStorage.LOG_LEVEL = "warn"          // Only warn + error
 *   localStorage.LOG_FILTER = "useApi,Db"    // Only these namespaces
 *
 * @param {string} namespace - Module/component name
 * @returns {object} Logger with all standard log methods
 */
export const createLogger = (namespace) => {
    const logger = {};

    for (const [method, [label, color, level]] of Object.entries(BADGES)) {
        if (label !== null) {
            // Fixed-label methods (e.g. log.error, log.db)
            logger[method] = (...messages) => logCore(label, color, level, namespace, ...messages);
        } else {
            // Dynamic-label methods (e.g. log.apiLoading where first arg is the label)
            logger[method] = (dynamicLabel, ...messages) => logCore(dynamicLabel, color, level, namespace, ...messages);
        }
    }

    // Custom method: log.custom("LABEL", "color", ...messages)
    logger.custom = (customLabel, customColor, ...messages) =>
        logCore(customLabel, customColor, "debug", namespace, ...messages);

    // Group helpers
    logger.group = (label) => {
        if (LEVELS[getLogLevel()] > LEVELS.debug) return;
        if (!passesNamespaceFilter(namespace)) return;
        const prefix = namespace ? `[${namespace}] ` : "";
        console.group(`${prefix}${label}`);
    };
    logger.groupEnd = () => console.groupEnd();

    return logger;
};

// Default logger (no namespace) — backwards compatible with existing `log.xxx()` calls
export const log = createLogger(null);
