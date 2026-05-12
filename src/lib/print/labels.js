/**
 * Default i18n labels for the print engine.
 *
 * Each entry is either a string (static message) or a function returning a
 * string (dynamic message with parameters). Consumers override individual
 * entries via the `labels` option of `PrintService` / `usePrintService`.
 */

export const DEFAULT_LABELS = {
    /** @param {string} type */
    unknownJobType: (type) =>
        `No renderers registered for job type "${type}"`,
    /** @param {string} type */
    noEscposRenderer: (type) =>
        `No ESC/POS renderer registered for job type "${type}"`,
    /** @param {string} protocol */
    unsupportedProtocol: (protocol) =>
        `Unsupported protocol "${protocol}"`,
    networkNotSupported:
        "Network printing requires a local print proxy. Please use USB or browser printing.",
    webusbNotSupported: "WebUSB is not supported in this browser",
};
