import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'lib/components';
import { useComponentLabels } from 'lib/hooks/local/useComponentLabels';
import { twMerge } from 'lib/utils';

import { DEFAULT_LABELS } from './conflictResolverLabels';

/**
 * ConflictResolver - UI component for resolving sync conflicts
 *
 * Displays a side-by-side comparison of client and server data
 * and allows the user to choose which version to keep or merge.
 */
const ConflictResolver = ({
    conflicts,
    onResolve,
    onCancel,
    renderField,
    labels,
    className
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mergeMode, setMergeMode] = useState(false);
    const [mergedData, setMergedData] = useState({});
    const [isResolving, setIsResolving] = useState(false);

    // English defaults, then the app-wide theme labels, then the prop.
    const l = { ...DEFAULT_LABELS, ...useComponentLabels('ConflictResolver', labels) };

    const currentConflict = conflicts[currentIndex];

    // Get all fields from both versions
    const allFields = useMemo(() => {
        if (!currentConflict) return [];

        const clientData = currentConflict.client_data || {};
        const serverData = currentConflict.server_data || {};
        const fieldSet = new Set([
            ...Object.keys(clientData),
            ...Object.keys(serverData)
        ]);

        // Remove internal fields
        const internalFields = ['id', 'rowid', 'tms', 'datec', 'entity'];
        internalFields.forEach(f => fieldSet.delete(f));

        return Array.from(fieldSet).sort();
    }, [currentConflict]);

    // Fields in conflict (different values)
    const conflictingFields = useMemo(() => {
        if (!currentConflict) return [];

        return currentConflict.field_conflicts || allFields.filter(field => {
            const clientValue = currentConflict.client_data?.[field];
            const serverValue = currentConflict.server_data?.[field];
            return normalizeValue(clientValue) !== normalizeValue(serverValue);
        });
    }, [currentConflict, allFields]);

    // Initialize merged data when entering merge mode
    const enterMergeMode = useCallback(() => {
        if (!currentConflict) return;

        const initial = {};
        allFields.forEach(field => {
            // Default to server value for non-conflicting fields
            if (conflictingFields.includes(field)) {
                initial[field] = undefined; // User must choose
            } else {
                initial[field] = currentConflict.server_data?.[field]
                    ?? currentConflict.client_data?.[field];
            }
        });

        setMergedData(initial);
        setMergeMode(true);
    }, [currentConflict, allFields, conflictingFields]);

    // Handle field selection in merge mode
    const selectFieldValue = useCallback((field, source) => {
        const value = source === 'client'
            ? currentConflict.client_data?.[field]
            : currentConflict.server_data?.[field];

        setMergedData(prev => ({ ...prev, [field]: value }));
    }, [currentConflict]);

    // Check if merge is complete (all conflicting fields have values)
    const isMergeComplete = useMemo(() => {
        return conflictingFields.every(field => mergedData[field] !== undefined);
    }, [conflictingFields, mergedData]);

    // Handle resolution
    const handleResolve = useCallback(async (resolution, data = null) => {
        if (!currentConflict || isResolving) return;

        setIsResolving(true);

        try {
            await onResolve(currentConflict.conflict_id, resolution, data);

            // Move to next conflict or close
            if (currentIndex < conflicts.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setMergeMode(false);
                setMergedData({});
            } else {
                // All conflicts resolved
                onCancel();
            }
        } finally {
            setIsResolving(false);
        }
    }, [currentConflict, currentIndex, conflicts.length, isResolving, onResolve, onCancel]);

    // Handle merge apply
    const handleMergeApply = useCallback(async () => {
        // Build complete merged object
        const fullMerged = { ...currentConflict.server_data };
        Object.entries(mergedData).forEach(([field, value]) => {
            if (value !== undefined) {
                fullMerged[field] = value;
            }
        });

        await handleResolve('merged', fullMerged);
    }, [currentConflict, mergedData, handleResolve]);

    // Navigation
    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setMergeMode(false);
            setMergedData({});
        }
    }, [currentIndex]);

    const goToNext = useCallback(() => {
        if (currentIndex < conflicts.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setMergeMode(false);
            setMergedData({});
        }
    }, [currentIndex, conflicts.length]);

    if (!currentConflict) {
        return null;
    }

    const objectLabel = currentConflict.object_ref
        || `${currentConflict.table} #${currentConflict.object_id}`;

    const cellClass = (source, isConflicting, selectedSource) => twMerge(
        'px-3 py-2 align-top break-words',
        mergeMode && isConflicting && 'cursor-pointer hover:bg-primary/5',
        selectedSource === source && 'bg-primary/10 ring-2 ring-inset ring-primary'
    );

    return (
        <div
            data-component="ConflictResolver"
            className={twMerge('flex flex-col gap-app-md text-strong-text', className)}
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-app-sm">
                <h2 className="text-lg font-semibold">
                    {l.title} - {objectLabel}
                </h2>
                {conflicts.length > 1 && (
                    <div className="flex items-center gap-app-sm">
                        <Button
                            label={l.previous}
                            variant="ghost"
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                        />
                        <span className="text-sm text-medium-text" aria-live="polite">
                            {l.conflictCount
                                .replace('{current}', currentIndex + 1)
                                .replace('{total}', conflicts.length)}
                        </span>
                        <Button
                            label={l.next}
                            variant="ghost"
                            onClick={goToNext}
                            disabled={currentIndex === conflicts.length - 1}
                        />
                    </div>
                )}
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-app-md border border-border">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-medium-bg text-medium-text">
                        <tr>
                            <th scope="col" className="px-3 py-2 text-left font-medium">{l.fieldHeader}</th>
                            <th scope="col" className="px-3 py-2 text-left font-medium">{l.clientHeader}</th>
                            <th scope="col" className="px-3 py-2 text-left font-medium">{l.serverHeader}</th>
                            {mergeMode && <th scope="col" className="px-3 py-2 text-left font-medium">{l.selectValue}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {allFields.map(field => {
                            const clientValue = currentConflict.client_data?.[field];
                            const serverValue = currentConflict.server_data?.[field];
                            const isConflicting = conflictingFields.includes(field);
                            const selectedSource = mergedData[field] === clientValue
                                ? 'client'
                                : mergedData[field] === serverValue
                                    ? 'server'
                                    : undefined;

                            return (
                                <tr
                                    key={field}
                                    data-conflict={isConflicting ? 'true' : undefined}
                                    className={twMerge('border-t border-border', isConflicting && 'bg-error/10')}
                                >
                                    <th scope="row" className="px-3 py-2 text-left align-top font-medium">
                                        {field}
                                        {isConflicting && (
                                            <span className="ml-1 text-error" title={l.conflictingField}>
                                                <span aria-hidden="true">*</span>
                                                <span className="sr-only">{` (${l.conflictingField})`}</span>
                                            </span>
                                        )}
                                    </th>
                                    <td
                                        className={cellClass('client', isConflicting, selectedSource)}
                                        onClick={() => mergeMode && isConflicting && selectFieldValue(field, 'client')}
                                    >
                                        {renderField
                                            ? renderField(field, clientValue, serverValue, 'client')
                                            : formatValue(clientValue, l)}
                                    </td>
                                    <td
                                        className={cellClass('server', isConflicting, selectedSource)}
                                        onClick={() => mergeMode && isConflicting && selectFieldValue(field, 'server')}
                                    >
                                        {renderField
                                            ? renderField(field, clientValue, serverValue, 'server')
                                            : formatValue(serverValue, l)}
                                    </td>
                                    {mergeMode && (
                                        <td className="px-3 py-2 align-top">
                                            {isConflicting && (
                                                <div className="flex gap-app-xs" role="group" aria-label={`${l.selectValue} - ${field}`}>
                                                    <Button
                                                        label={l.chooseClient}
                                                        variant={selectedSource === 'client' ? 'primary' : 'outline'}
                                                        aria-pressed={selectedSource === 'client'}
                                                        onClick={() => selectFieldValue(field, 'client')}
                                                    />
                                                    <Button
                                                        label={l.chooseServer}
                                                        variant={selectedSource === 'server' ? 'primary' : 'outline'}
                                                        aria-pressed={selectedSource === 'server'}
                                                        onClick={() => selectFieldValue(field, 'server')}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Metadata */}
            {currentConflict.server_tms && (
                <div className="flex flex-wrap gap-app-md text-xs text-medium-text">
                    <span>
                        {l.serverDate} {formatDateTime(currentConflict.server_tms)}
                    </span>
                    {currentConflict.client_tms && (
                        <span>
                            {l.localDate} {formatDateTime(currentConflict.client_tms)}
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-app-sm">
                {!mergeMode ? (
                    <>
                        <Button label={l.cancel} variant="ghost" onClick={onCancel} disabled={isResolving} />
                        <Button label={l.merge} variant="outline" onClick={enterMergeMode} disabled={isResolving} />
                        <Button label={l.keepServer} variant="secondary" onClick={() => handleResolve('server')} disabled={isResolving} />
                        <Button label={l.keepClient} variant="primary" onClick={() => handleResolve('client')} disabled={isResolving} />
                    </>
                ) : (
                    <>
                        <Button
                            label={l.cancel}
                            variant="ghost"
                            onClick={() => {
                                setMergeMode(false);
                                setMergedData({});
                            }}
                            disabled={isResolving}
                        />
                        <Button
                            label={l.apply}
                            variant="primary"
                            onClick={handleMergeApply}
                            disabled={isResolving || !isMergeComplete}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

// Helper functions
function normalizeValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
}

function formatValue(value, l) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-soft-text">{l.noValue}</span>;
    }
    if (typeof value === 'boolean') {
        return value ? l.yes : l.no;
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function formatDateTime(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return isoString;
        // Browser locale, like the rest of the app's dates.
        return date.toLocaleString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return isoString;
    }
}

ConflictResolver.propTypes = {
    conflicts: PropTypes.arrayOf(PropTypes.shape({
        conflict_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        table: PropTypes.string.isRequired,
        object_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        object_ref: PropTypes.string,
        client_data: PropTypes.object,
        server_data: PropTypes.object,
        field_conflicts: PropTypes.arrayOf(PropTypes.string),
        client_tms: PropTypes.string,
        server_tms: PropTypes.string
    })).isRequired,
    onResolve: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    renderField: PropTypes.func,
    /** Partial labels laid over the English defaults and the theme ones. */
    labels: PropTypes.object,
    className: PropTypes.string
};

ConflictResolver.defaultProps = {
    renderField: null,
    labels: {}
};

export { ConflictResolver };
export default ConflictResolver;
