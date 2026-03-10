import { useState, useRef, useEffect, useCallback } from "react";
import { useVariantMerger } from "lib/hooks";
import { defaultProps, propTypes } from "./props";
import { useDebugConsole } from "./useDebugConsole";
import { LogEntry } from "./LogEntry";
import { Toolbar } from "./Toolbar";
import { openDetachedWindow } from "./detachedWindow";

export const DebugConsole = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("DebugConsole", props);

    const {
        defaultOpen,
        position,
        height,
        maxLogs,
        showFab,
    } = variantProps;

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
                    {...mergeProps("fab", (p) => ({
                        ...p,
                        onClick: () => setIsOpen(true),
                        className: "fixed bottom-4 left-4 z-[9998] w-10 h-10 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full shadow-lg flex items-center justify-center text-sm font-mono border border-gray-600 transition-colors",
                    }))}
                >
                    &gt;_
                </button>
            )}

            {/* Console panel */}
            {isOpen && (
                <div
                    {...mergeProps("container", (p) => ({
                        ...p,
                        "data-component": "DebugConsole",
                        style: { ...positionStyles[position], ...(p.style || {}) },
                        className: `fixed z-[9999] bg-gray-900 border-gray-700 flex flex-col shadow-2xl ${
                            position === "bottom" ? "border-t" :
                            position === "top" ? "border-b" :
                            position === "left" ? "border-r" : "border-l"
                        } ${p.className || ""}`,
                    }))}
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
                    <div
                        {...mergeProps("logs", (p) => ({
                            ...p,
                            className: `flex-1 overflow-y-auto overflow-x-hidden ${p.className || ""}`,
                        }))}
                    >
                        {logs.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
                                No logs yet
                            </div>
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

DebugConsole.propTypes = propTypes;
DebugConsole.defaultProps = defaultProps;
