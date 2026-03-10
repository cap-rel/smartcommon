import { useState, useRef, useEffect, useCallback } from "react";
import { useDebugConsole } from "./useDebugConsole";
import { LogEntry } from "./LogEntry";
import { Toolbar } from "./Toolbar";
import { openDetachedWindow } from "./detachedWindow";

const S = {
    fab: {
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 9998,
        width: 40,
        height: 40,
        background: "#1f2937",
        color: "#d1d5db",
        border: "1px solid #4b5563",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontFamily: "monospace",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
    panel: {
        position: "fixed",
        zIndex: 9999,
        background: "#111827",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
    },
    logs: {
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
    },
    empty: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#4b5563",
        fontSize: 12,
    },
};

const borderSide = {
    bottom: { borderTop: "1px solid #374151" },
    top: { borderBottom: "1px solid #374151" },
    left: { borderRight: "1px solid #374151" },
    right: { borderLeft: "1px solid #374151" },
};

export const DebugConsole = ({
    defaultOpen = false,
    position = "bottom",
    height = "40vh",
    maxLogs = 500,
    showFab = true,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const logsEndRef = useRef(null);
    const detachedWindowRef = useRef(null);

    const {
        logs,
        allLogs,
        clear,
        search,
        setSearch,
        enabledLevels,
        toggleLevel,
        knownNamespaces,
        enabledNamespaces,
        allNamespacesEnabled,
        toggleNamespace,
        toggleAllNamespaces,
    } = useDebugConsole({ maxLogs });

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const handleDetach = useCallback(() => {
        if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
            detachedWindowRef.current.focus();
            return;
        }
        detachedWindowRef.current = openDetachedWindow();
    }, []);

    // Clean up detached window on unmount
    useEffect(() => {
        return () => {
            if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
                detachedWindowRef.current.close();
            }
        };
    }, []);

    const positionStyles = {
        bottom: { bottom: 0, left: 0, right: 0, height },
        top: { top: 0, left: 0, right: 0, height },
        left: { top: 0, bottom: 0, left: 0, width: height },
        right: { top: 0, bottom: 0, right: 0, width: height },
    };

    return (
        <>
            {/* FAB toggle button */}
            {showFab && !isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={S.fab}
                >
                    &gt;_
                </button>
            )}

            {/* Console panel */}
            {isOpen && (
                <div
                    data-component="DebugConsole"
                    style={{ ...S.panel, ...positionStyles[position], ...borderSide[position] }}
                >
                    <Toolbar
                        search={search}
                        onSearchChange={setSearch}
                        enabledLevels={enabledLevels}
                        onToggleLevel={toggleLevel}
                        knownNamespaces={knownNamespaces}
                        enabledNamespaces={enabledNamespaces}
                        allNamespacesEnabled={allNamespacesEnabled}
                        onToggleNamespace={toggleNamespace}
                        onToggleAllNamespaces={toggleAllNamespaces}
                        onClear={clear}
                        onDetach={handleDetach}
                        onClose={() => setIsOpen(false)}
                        logCount={logs.length}
                        totalCount={allLogs.length}
                    />

                    {/* Log entries */}
                    <div style={S.logs}>
                        {logs.length === 0 ? (
                            <div style={S.empty}>No logs yet</div>
                        ) : (
                            logs.map(entry => (
                                <LogEntry key={entry.id} entry={entry} />
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}
        </>
    );
};
