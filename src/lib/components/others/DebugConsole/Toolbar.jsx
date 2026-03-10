import { useState } from "react";

const levelColors = {
    debug: { bg: "bg-gray-600", active: "bg-gray-500", text: "text-gray-300" },
    info: { bg: "bg-blue-900", active: "bg-blue-700", text: "text-blue-300" },
    warn: { bg: "bg-yellow-900", active: "bg-yellow-700", text: "text-yellow-300" },
    error: { bg: "bg-red-900", active: "bg-red-700", text: "text-red-300" },
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
        <div className="flex flex-col gap-1.5 px-2 py-1.5 bg-gray-800 border-b border-gray-700">
            {/* Row 1: Search + actions */}
            <div className="flex items-center gap-1.5">
                <input
                    type="text"
                    placeholder="Filter..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500"
                />
                <button
                    onClick={onClear}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded"
                    title="Clear logs"
                >
                    Clear
                </button>
                {onDetach && (
                    <button
                        onClick={onDetach}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded"
                        title="Open in separate window"
                    >
                        ⧉
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded"
                        title="Close console"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Row 2: Level toggles + namespace dropdown + count */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {/* Level toggles */}
                {Object.keys(levelColors).map(level => {
                    const active = enabledLevels[level];
                    const colors = levelColors[level];
                    return (
                        <button
                            key={level}
                            onClick={() => onToggleLevel(level)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-opacity ${
                                active ? `${colors.active} ${colors.text} opacity-100` : `${colors.bg} text-gray-500 opacity-50`
                            }`}
                        >
                            {level}
                        </button>
                    );
                })}

                {/* Namespace dropdown */}
                {knownNamespaces.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setNsDropdownOpen(prev => !prev)}
                            className="px-2 py-0.5 text-[10px] text-gray-300 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                            Namespaces ▾
                        </button>
                        {nsDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto">
                                {/* All toggle */}
                                <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer border-b border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={allNamespacesEnabled}
                                        onChange={onToggleAllNamespaces}
                                        className="accent-blue-500"
                                    />
                                    <span className="text-xs text-gray-300 font-bold">All</span>
                                </label>
                                {knownNamespaces.map(ns => (
                                    <label key={ns} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allNamespacesEnabled || enabledNamespaces.has(ns)}
                                            onChange={() => onToggleNamespace(ns)}
                                            disabled={allNamespacesEnabled}
                                            className="accent-blue-500"
                                        />
                                        <span className="text-xs text-gray-300">{ns}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Log count */}
                <span className="ml-auto text-[10px] text-gray-500">
                    {logCount}{totalCount !== logCount ? `/${totalCount}` : ""}
                </span>
            </div>
        </div>
    );
};
