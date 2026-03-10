import { useState } from "react";

const levelStyles = {
    debug: { active: { background: "#6b7280", color: "#d1d5db" }, inactive: { background: "#4b5563", color: "#6b7280" } },
    info:  { active: { background: "#1d4ed8", color: "#93c5fd" }, inactive: { background: "#1e3a5f", color: "#6b7280" } },
    warn:  { active: { background: "#a16207", color: "#fcd34d" }, inactive: { background: "#713f12", color: "#6b7280" } },
    error: { active: { background: "#b91c1c", color: "#fca5a5" }, inactive: { background: "#7f1d1d", color: "#6b7280" } },
};

const S = {
    toolbar: { display: "flex", flexDirection: "column", gap: 6, padding: "6px 8px", background: "#1f2937", borderBottom: "1px solid #374151" },
    row: { display: "flex", alignItems: "center", gap: 6 },
    rowWrap: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
    input: { flex: 1, minWidth: 0, padding: "4px 8px", background: "#111827", border: "1px solid #374151", borderRadius: 4, color: "#e5e7eb", fontSize: 12, outline: "none", fontFamily: "inherit" },
    btn: { padding: "4px 8px", fontSize: 11, background: "#374151", color: "#9ca3af", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
    levelBtn: { padding: "2px 6px", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
    nsContainer: { position: "relative" },
    nsBtn: { padding: "2px 8px", fontSize: 10, background: "#374151", color: "#d1d5db", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
    nsDropdown: { position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#1f2937", border: "1px solid #4b5563", borderRadius: 4, minWidth: 160, maxHeight: 200, overflowY: "auto", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" },
    nsLabel: { display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "#d1d5db" },
    nsLabelFirst: { borderBottom: "1px solid #374151" },
    count: { marginLeft: "auto", fontSize: 10, color: "#6b7280" },
};

export const Toolbar = ({
    search,
    onSearchChange,
    enabledLevels,
    onToggleLevel,
    knownNamespaces,
    enabledNamespaces,
    allNamespacesEnabled,
    onToggleNamespace,
    onToggleAllNamespaces,
    onClear,
    onDetach,
    onClose,
    logCount,
    totalCount,
}) => {
    const [nsDropdownOpen, setNsDropdownOpen] = useState(false);

    return (
        <div style={S.toolbar}>
            {/* Row 1: Search + actions */}
            <div style={S.row}>
                <input
                    type="text"
                    placeholder="Filter..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={S.input}
                />
                <button onClick={onClear} style={S.btn} title="Clear logs">Clear</button>
                {onDetach && (
                    <button onClick={onDetach} style={S.btn} title="Open in separate window">{"\u29C9"}</button>
                )}
                {onClose && (
                    <button onClick={onClose} style={S.btn} title="Close console">{"\u2715"}</button>
                )}
            </div>

            {/* Row 2: Level toggles + namespace dropdown + count */}
            <div style={S.rowWrap}>
                {Object.keys(levelStyles).map(level => {
                    const active = enabledLevels[level];
                    const colors = active ? levelStyles[level].active : levelStyles[level].inactive;
                    return (
                        <button
                            key={level}
                            onClick={() => onToggleLevel(level)}
                            style={{ ...S.levelBtn, ...colors, opacity: active ? 1 : 0.5 }}
                        >
                            {level}
                        </button>
                    );
                })}

                {knownNamespaces.length > 0 && (
                    <div style={S.nsContainer}>
                        <button onClick={() => setNsDropdownOpen(prev => !prev)} style={S.nsBtn}>
                            Namespaces {"\u25BE"}
                        </button>
                        {nsDropdownOpen && (
                            <div style={S.nsDropdown}>
                                <label style={{ ...S.nsLabel, ...S.nsLabelFirst }}>
                                    <input
                                        type="checkbox"
                                        checked={allNamespacesEnabled}
                                        onChange={onToggleAllNamespaces}
                                    />
                                    <span style={{ fontWeight: "bold" }}>All</span>
                                </label>
                                {knownNamespaces.map(ns => (
                                    <label key={ns} style={S.nsLabel}>
                                        <input
                                            type="checkbox"
                                            checked={allNamespacesEnabled || enabledNamespaces.has(ns)}
                                            onChange={() => onToggleNamespace(ns)}
                                            disabled={allNamespacesEnabled}
                                        />
                                        <span>{ns}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <span style={S.count}>
                    {logCount}{totalCount !== logCount ? `/${totalCount}` : ""}
                </span>
            </div>
        </div>
    );
};
