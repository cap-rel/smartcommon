/**
 * Default (English) labels of ConflictResolver. Translations live in the
 * locale bundles (`locales.fr.ConflictResolver`, ...); an app can also give
 * them once on the Provider theme (see docs/provider.md).
 *
 * `conflictCount` keeps its `{current}` / `{total}` placeholders.
 */
export const DEFAULT_LABELS = {
    title: "Sync conflict",
    fieldHeader: "Field",
    clientHeader: "Your version",
    serverHeader: "Server version",
    selectValue: "Value to keep",
    keepClient: "Keep my version",
    keepServer: "Keep the server version",
    merge: "Merge",
    cancel: "Cancel",
    apply: "Apply",
    next: "Next",
    previous: "Previous",
    conflictCount: "Conflict {current} of {total}",
    chooseClient: "Mine",
    chooseServer: "Server",
    conflictingField: "in conflict",
    // Prefix of each date, colon included (its spacing differs by language).
    serverDate: "Server:",
    localDate: "Local:",
    yes: "Yes",
    no: "No",
    noValue: "-",
};
