// Log levels ordered by severity
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };

// --- Ring buffer for feedback log excerpt ---
// Bounded circular buffer: 200 entries max, 32 KB total in UTF-8 octets
// (counted with TextEncoder: accented log text is 2 octets per character,
// and the server refuses an excerpt over the budget). Each entry is a
// single pre-serialised string. Activated by libConfig.feedback.logBuffer
// (default true: the cost is negligible and the buffer is what makes a
// client report actionable).
const LOG_BUFFER_MAX_ENTRIES = 200;
const LOG_BUFFER_MAX_BYTES = 32 * 1024;

const textEncoder = new TextEncoder();

const logBuffer = [];
let logBufferBytes = 0;
let logBufferEnabled = true;

export const setLogBufferEnabled = (enabled) => {
    logBufferEnabled = !!enabled;
    if (!logBufferEnabled) {
        logBuffer.length = 0;
        logBufferBytes = 0;
    }
};

// Secret patterns from capTests spec section 14.2, all case-insensitive.
// Applied to log lines before they leave the device; replacement is the
// fixed marker "[filtré]" (the marker the spec mandates) so the team can
// see that something was redacted without seeing what. The key/value
// pattern also matches JSON-serialized objects, where a quote sits between
// the key and the separator and around the value ("password":"hunter2"),
// and covers the refresh_token / access_token variants.
const SECRET_PATTERNS = [
    /Bearer\s+\S+/gi,
    /Authorization\s*:.*$/gim,
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g,
    /(password|passwd|pwd|(?:refresh_|access_)?token|secret|api_?key|DOLAPIKEY)"?\s*[=:]\s*"?[^\s",}\]]+/gi,
];

export const filterSecrets = (text) => {
    let out = String(text);
    for (const pattern of SECRET_PATTERNS) {
        out = out.replace(pattern, "[filtré]");
    }
    return out;
};

const serializeMessages = (messages) => {
    const parts = [];
    for (const m of messages) {
        if (m instanceof Error) {
            parts.push(`${m.name}: ${m.message}`);
        } else if (typeof m === "object" && m !== null) {
            try {
                parts.push(JSON.stringify(m));
            } catch (_) {
                parts.push(String(m));
            }
        } else {
            parts.push(String(m));
        }
    }
    return parts.join(" ");
};

const pushToLogBuffer = (level, namespace, label, messages) => {
    if (!logBufferEnabled) return;

    const ts = new Date().toISOString();
    const ns = namespace ? `[${namespace}]` : "";
    const lb = label ? ` ${label}` : "";
    const line = filterSecrets(`${ts} ${level.toUpperCase()}${ns}${lb} ${serializeMessages(messages)}`);

    logBuffer.push(line);
    logBufferBytes += textEncoder.encode(line).length + 1;

    while (logBuffer.length > LOG_BUFFER_MAX_ENTRIES
        || (logBuffer.length > 0 && logBufferBytes > LOG_BUFFER_MAX_BYTES)) {
        const removed = logBuffer.shift();
        logBufferBytes -= (textEncoder.encode(removed).length + 1);
    }
};

/**
 * Returns the buffered log lines, oldest first, secrets already filtered.
 * Used by the feedback report to attach a diagnostic excerpt.
 *
 * @returns {string[]}
 */
export const getRecentLogs = () => [...logBuffer];

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

// --- Subscriber system for DebugConsole ---
const subscribers = new Set();
let broadcastChannel = null;

try {
    broadcastChannel = new BroadcastChannel("smartcommon-logs");
} catch (_) { /* BroadcastChannel not supported */ }

/**
 * Subscribe to all log entries. Returns an unsubscribe function.
 * Each callback receives a log entry object:
 * { id, timestamp, level, label, labelColor, namespace, namespaceColor, messages }
 */
export const subscribeToLogs = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};

let logIdCounter = 0;

const notifySubscribers = (entry) => {
    for (const cb of subscribers) {
        try { cb(entry); } catch (_) { /* subscriber error */ }
    }
    if (broadcastChannel) {
        try {
            // Serialize messages for BroadcastChannel (strip non-cloneable values)
            const serialized = {
                ...entry,
                messages: entry.messages.map(m => {
                    if (m instanceof Error) return { __type: "Error", message: m.message, stack: m.stack };
                    if (typeof m === "object" && m !== null) {
                        try { return JSON.parse(JSON.stringify(m)); } catch (_) { return String(m); }
                    }
                    return m;
                }),
            };
            broadcastChannel.postMessage(serialized);
        } catch (_) { /* serialization error */ }
    }
};

/**
 * Returns the current effective log level.
 * Checks localStorage.LOG_LEVEL first, falls back to "debug" in dev, "warn" in prod.
 */
const getLogLevel = () => {
    try {
        const stored = localStorage.getItem("LOG_LEVEL");
        if (stored && LEVELS[stored] !== undefined) return stored;
    } catch (_) { /* SSR or restricted access */ }

    return (typeof import.meta !== "undefined" && import.meta.env?.PROD) ? "warn" : "debug";
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

    // Feed the ring buffer (always, regardless of console level filtering,
    // so a report captures errors even when LOG_LEVEL hides them on screen)
    pushToLogBuffer(level, namespace, label, messages);

    // Notify subscribers (always, regardless of console level filtering)
    notifySubscribers({
        id: ++logIdCounter,
        timestamp: Date.now(),
        level,
        label,
        labelColor: color,
        namespace,
        namespaceColor: namespace ? getNamespaceColor(namespace) : null,
        messages,
    });
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

// Expose constants for DebugConsole
export const LOG_LEVELS = LEVELS;
export const LOG_BADGES = BADGES;
