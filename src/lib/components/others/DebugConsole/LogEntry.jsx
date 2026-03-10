import { useState } from "react";

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

const levelRowColors = {
    error: "bg-red-950/30 border-l-red-500",
    warn: "bg-yellow-950/20 border-l-yellow-500",
    info: "border-l-transparent",
    debug: "border-l-transparent",
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

    return (
        <div
            className={`flex items-start gap-2 px-2 py-1 border-l-2 text-xs font-mono hover:bg-white/5 cursor-pointer ${levelRowColors[entry.level] || ""}`}
            onClick={() => hasExpandable && setExpanded(prev => !prev)}
        >
            {/* Timestamp */}
            <span className="text-gray-500 shrink-0 select-none">{formatTime(entry.timestamp)}</span>

            {/* Namespace badge */}
            {entry.namespace && (
                <span
                    className="shrink-0 px-1.5 rounded-full text-white text-[10px] leading-4 font-bold select-none"
                    style={{ backgroundColor: entry.namespaceColor || "#607d8b" }}
                >
                    {entry.namespace}
                </span>
            )}

            {/* Label badge */}
            {entry.label && (
                <span
                    className="shrink-0 px-1.5 rounded-full text-white text-[10px] leading-4 font-bold select-none"
                    style={{ backgroundColor: entry.labelColor || "grey" }}
                >
                    {entry.label}
                </span>
            )}

            {/* Message content */}
            <div className="flex-1 min-w-0">
                <span className="text-gray-200 break-all">{inlineText}</span>
                {hasExpandable && (
                    <span className="text-gray-500 ml-1 select-none">{expanded ? "▼" : "▶"}</span>
                )}
                {expanded && (
                    <pre className="mt-1 p-2 bg-black/30 rounded text-gray-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
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
