import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

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
    labels
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mergeMode, setMergeMode] = useState(false);
    const [mergedData, setMergedData] = useState({});
    const [isResolving, setIsResolving] = useState(false);

    // Default labels (French)
    const defaultLabels = {
        title: 'Conflit detecte',
        fieldHeader: 'Champ',
        clientHeader: 'Votre version',
        serverHeader: 'Version serveur',
        keepClient: 'Garder ma version',
        keepServer: 'Garder serveur',
        merge: 'Fusionner',
        cancel: 'Annuler',
        apply: 'Appliquer',
        next: 'Suivant',
        previous: 'Precedent',
        conflictCount: 'Conflit {current} sur {total}',
        modifiedBy: 'Modifie par {user} le {date}',
        noValue: '-',
        selectValue: 'Selectionner une valeur'
    };

    const l = { ...defaultLabels, ...labels };

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

    return (
        <div className="conflict-resolver">
            {/* Header */}
            <div className="conflict-resolver__header">
                <h2 className="conflict-resolver__title">
                    {l.title} - {objectLabel}
                </h2>
                {conflicts.length > 1 && (
                    <div className="conflict-resolver__nav">
                        <button
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className="conflict-resolver__nav-btn"
                        >
                            {l.previous}
                        </button>
                        <span className="conflict-resolver__counter">
                            {l.conflictCount
                                .replace('{current}', currentIndex + 1)
                                .replace('{total}', conflicts.length)}
                        </span>
                        <button
                            onClick={goToNext}
                            disabled={currentIndex === conflicts.length - 1}
                            className="conflict-resolver__nav-btn"
                        >
                            {l.next}
                        </button>
                    </div>
                )}
            </div>

            {/* Comparison table */}
            <div className="conflict-resolver__table-container">
                <table className="conflict-resolver__table">
                    <thead>
                        <tr>
                            <th>{l.fieldHeader}</th>
                            <th className={mergeMode ? 'selectable' : ''}>
                                {l.clientHeader}
                            </th>
                            <th className={mergeMode ? 'selectable' : ''}>
                                {l.serverHeader}
                            </th>
                            {mergeMode && <th>{l.selectValue}</th>}
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
                                    className={isConflicting ? 'conflict-resolver__row--conflict' : ''}
                                >
                                    <td className="conflict-resolver__field-name">
                                        {field}
                                        {isConflicting && <span className="conflict-marker">*</span>}
                                    </td>
                                    <td
                                        className={`conflict-resolver__value ${
                                            mergeMode && isConflicting ? 'clickable' : ''
                                        } ${selectedSource === 'client' ? 'selected' : ''}`}
                                        onClick={() => mergeMode && isConflicting && selectFieldValue(field, 'client')}
                                    >
                                        {renderField
                                            ? renderField(field, clientValue, serverValue, 'client')
                                            : formatValue(clientValue, l.noValue)}
                                    </td>
                                    <td
                                        className={`conflict-resolver__value ${
                                            mergeMode && isConflicting ? 'clickable' : ''
                                        } ${selectedSource === 'server' ? 'selected' : ''}`}
                                        onClick={() => mergeMode && isConflicting && selectFieldValue(field, 'server')}
                                    >
                                        {renderField
                                            ? renderField(field, clientValue, serverValue, 'server')
                                            : formatValue(serverValue, l.noValue)}
                                    </td>
                                    {mergeMode && (
                                        <td className="conflict-resolver__selection">
                                            {isConflicting && (
                                                <>
                                                    <button
                                                        onClick={() => selectFieldValue(field, 'client')}
                                                        className={selectedSource === 'client' ? 'active' : ''}
                                                    >
                                                        Client
                                                    </button>
                                                    <button
                                                        onClick={() => selectFieldValue(field, 'server')}
                                                        className={selectedSource === 'server' ? 'active' : ''}
                                                    >
                                                        Serveur
                                                    </button>
                                                </>
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
                <div className="conflict-resolver__meta">
                    <span className="conflict-resolver__meta-item">
                        Serveur: {formatDateTime(currentConflict.server_tms)}
                    </span>
                    {currentConflict.client_tms && (
                        <span className="conflict-resolver__meta-item">
                            Local: {formatDateTime(currentConflict.client_tms)}
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="conflict-resolver__actions">
                {!mergeMode ? (
                    <>
                        <button
                            onClick={() => handleResolve('client')}
                            disabled={isResolving}
                            className="conflict-resolver__btn conflict-resolver__btn--client"
                        >
                            {l.keepClient}
                        </button>
                        <button
                            onClick={() => handleResolve('server')}
                            disabled={isResolving}
                            className="conflict-resolver__btn conflict-resolver__btn--server"
                        >
                            {l.keepServer}
                        </button>
                        <button
                            onClick={enterMergeMode}
                            disabled={isResolving}
                            className="conflict-resolver__btn conflict-resolver__btn--merge"
                        >
                            {l.merge}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isResolving}
                            className="conflict-resolver__btn conflict-resolver__btn--cancel"
                        >
                            {l.cancel}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleMergeApply}
                            disabled={isResolving || !isMergeComplete}
                            className="conflict-resolver__btn conflict-resolver__btn--apply"
                        >
                            {l.apply}
                        </button>
                        <button
                            onClick={() => {
                                setMergeMode(false);
                                setMergedData({});
                            }}
                            disabled={isResolving}
                            className="conflict-resolver__btn conflict-resolver__btn--cancel"
                        >
                            {l.cancel}
                        </button>
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

function formatValue(value, noValueLabel) {
    if (value === null || value === undefined || value === '') {
        return <span className="no-value">{noValueLabel}</span>;
    }
    if (typeof value === 'boolean') {
        return value ? 'Oui' : 'Non';
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
        return date.toLocaleString('fr-FR', {
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
    labels: PropTypes.object
};

ConflictResolver.defaultProps = {
    renderField: null,
    labels: {}
};

export { ConflictResolver };
export default ConflictResolver;
