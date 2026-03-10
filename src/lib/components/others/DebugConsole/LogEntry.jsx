import { useState } from "react";

const MONO = "ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', 'Liberation Mono', Menlo, Monaco, Consolas, monospace";

const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
};

const formatMessage = (msg) => {
    if (msg === null) return "null";
    if (msg === undefined) return "undefined";
    if (typeof msg === "string") return msg;
    if (msg instanceof Error || msg?.__type === "Error") return msg.message || msg.stack || String(msg);
    if (typeof msg === "object") {
        try { return JSON.stringify(msg, null, 2); } catch (_) { return String(msg); }
    }
    return String(msg);
};

const levelRowBg = { error: "rgba(127,29,29,0.2)", warn: "rgba(113,63,18,0.15)" };
const levelBorderColor = { error: "#ef4444", warn: "#eab308" };

const S = {
    row: { display: "flex", alignItems: "flex-start", gap: 6, padding: "3px 8px", borderLeft: "2px solid transparent", cursor: "pointer", fontSize: 12, fontFamily: MONO },
    timestamp: { color: "#6b7280", flexShrink: 0, userSelect: "none" },
    badge: { flexShrink: 0, padding: "0 5px", borderRadius: 999, color: "white", fontSize: 10, lineHeight: "16px", fontWeight: "bold", userSelect: "none", whiteSpace: "nowrap" },
    message: { flex: 1, minWidth: 0, color: "#e5e7eb", wordBreak: "break-all" },
    expandIndicator: { color: "#6b7280", marginLeft: 4, userSelect: "none" },
    expandedData: { marginTop: 4, padding: 6, background: "rgba(0,0,0,0.3)", borderRadius: 4, color: "#d1d5db", fontSize: 11, whiteSpace: "pre-wrap", overflowX: "auto", fontFamily: MONO },
};

export const LogEntry = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);

    const hasExpandable = entry.messages.some(m =>
        typeof m === "object" && m !== null && !(m instanceof Error) && !m?.__type
    );

    const inlineText = entry.messages.map(m => {
        if (typeof m === "string") return m;
        if (m instanceof Error || m?.__type === "Error") return m.message || String(m);
        if (typeof m === "object" && m !== null) {
            try {
                const s = JSON.stringify(m);
                return s.length > 80 ? s.slice(0, 80) + "..." : s;
            } catch (_) { return String(m); }
        }
        return String(m);
    }).join(" ");

    const rowStyle = {
        ...S.row,
        ...(levelRowBg[entry.level] ? { background: levelRowBg[entry.level] } : {}),
        ...(levelBorderColor[entry.level] ? { borderLeftColor: levelBorderColor[entry.level] } : {}),
    };

    return (
        <div style={rowStyle} onClick={() => hasExpandable && setExpanded(prev => !prev)}>
            <span style={S.timestamp}>{formatTime(entry.timestamp)}</span>

            {entry.namespace && (
                <span style={{ ...S.badge, backgroundColor: entry.namespaceColor || "#607d8b" }}>
                    {entry.namespace}
                </span>
            )}

            {entry.label && (
                <span style={{ ...S.badge, backgroundColor: entry.labelColor || "grey" }}>
                    {entry.label}
                </span>
            )}

            <div style={S.message}>
                <span>{inlineText}</span>
                {hasExpandable && (
                    <span style={S.expandIndicator}>{expanded ? "\u25BC" : "\u25B6"}</span>
                )}
                {expanded && (
                    <pre style={S.expandedData}>
                        {entry.messages
                            .filter(m => typeof m === "object" && m !== null && !(m instanceof Error) && !m?.__type)
                            .map((m, i) => <div key={i}>{formatMessage(m)}</div>)
                        }
                    </pre>
                )}
            </div>
        </div>
    );
};
