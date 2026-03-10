import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { subscribeToLogs } from "lib/utils";

const MAX_LOGS = 500;

const STORAGE_KEY = "DEBUG_CONSOLE_FILTERS";

const loadFilters = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (_) { /* ignore */ }
    return null;
};

const saveFilters = (filters) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (_) { /* ignore */ }
};

export const useDebugConsole = ({ maxLogs = MAX_LOGS } = {}) => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const logsRef = useRef([]);

    // Discovered namespaces from incoming logs
    const [knownNamespaces, setKnownNamespaces] = useState(new Set());

    // Filter state
    const savedFilters = loadFilters();
    const [enabledLevels, setEnabledLevels] = useState(
        () => savedFilters?.levels || { debug: true, info: true, warn: true, error: true }
    );
    const [enabledNamespaces, setEnabledNamespaces] = useState(
        () => new Set(savedFilters?.namespaces || [])
    );
    const [allNamespacesEnabled, setAllNamespacesEnabled] = useState(
        () => savedFilters?.allNamespacesEnabled !== false
    );

    // Persist filters when they change
    useEffect(() => {
        saveFilters({
            levels: enabledLevels,
            namespaces: [...enabledNamespaces],
            allNamespacesEnabled,
        });
    }, [enabledLevels, enabledNamespaces, allNamespacesEnabled]);

    // Subscribe to log stream
    useEffect(() => {
        return subscribeToLogs((entry) => {
            logsRef.current = [...logsRef.current, entry].slice(-maxLogs);
            setLogs(logsRef.current);

            if (entry.namespace && !knownNamespaces.has(entry.namespace)) {
                setKnownNamespaces(prev => new Set([...prev, entry.namespace]));
            }
        });
    }, [maxLogs]);

    // Also listen to BroadcastChannel for logs from other tabs
    useEffect(() => {
        let channel;
        try {
            channel = new BroadcastChannel("smartcommon-logs");
        } catch (_) { return; }

        const handler = (event) => {
            const entry = event.data;
            // Avoid duplicates: only accept if id not already in our list
            if (logsRef.current.some(l => l.id === entry.id)) return;
            logsRef.current = [...logsRef.current, entry].slice(-maxLogs);
            setLogs(logsRef.current);

            if (entry.namespace && !knownNamespaces.has(entry.namespace)) {
                setKnownNamespaces(prev => new Set([...prev, entry.namespace]));
            }
        };

        channel.addEventListener("message", handler);
        return () => {
            channel.removeEventListener("message", handler);
            channel.close();
        };
    }, [maxLogs]);

    const clear = useCallback(() => {
        logsRef.current = [];
        setLogs([]);
    }, []);

    const toggleLevel = useCallback((level) => {
        setEnabledLevels(prev => ({ ...prev, [level]: !prev[level] }));
    }, []);

    const toggleNamespace = useCallback((ns) => {
        setEnabledNamespaces(prev => {
            const next = new Set(prev);
            if (next.has(ns)) next.delete(ns);
            else next.add(ns);
            return next;
        });
        setAllNamespacesEnabled(false);
    }, []);

    const toggleAllNamespaces = useCallback(() => {
        setAllNamespacesEnabled(prev => !prev);
        setEnabledNamespaces(new Set());
    }, []);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter(entry => {
            // Level filter
            if (!enabledLevels[entry.level]) return false;

            // Namespace filter
            if (!allNamespacesEnabled) {
                if (entry.namespace && !enabledNamespaces.has(entry.namespace)) return false;
                if (!entry.namespace && enabledNamespaces.size > 0) {
                    // Show logs without namespace only if no specific filter is set
                }
            }

            // Text search
            if (search) {
                const searchLower = search.toLowerCase();
                const matchLabel = entry.label && entry.label.toLowerCase().includes(searchLower);
                const matchNs = entry.namespace && entry.namespace.toLowerCase().includes(searchLower);
                const matchMsg = entry.messages.some(m => {
                    if (typeof m === "string") return m.toLowerCase().includes(searchLower);
                    if (m instanceof Error) return m.message.toLowerCase().includes(searchLower);
                    try { return JSON.stringify(m).toLowerCase().includes(searchLower); } catch (_) { return false; }
                });
                if (!matchLabel && !matchNs && !matchMsg) return false;
            }

            return true;
        });
    }, [logs, enabledLevels, enabledNamespaces, allNamespacesEnabled, search]);

    return {
        logs: filteredLogs,
        allLogs: logs,
        clear,
        search,
        setSearch,
        enabledLevels,
        toggleLevel,
        knownNamespaces: [...knownNamespaces].sort(),
        enabledNamespaces,
        allNamespacesEnabled,
        toggleNamespace,
        toggleAllNamespaces,
    };
};
