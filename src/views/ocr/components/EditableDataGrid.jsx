import React, { useState, useCallback, useMemo } from 'react';

/**
 * EditableDataGrid - Component for editing structured financial data
 * 
 * Features:
 * - Inline cell editing
 * - Add/remove rows
 * - Real-time validation
 * - Visual feedback for modifications
 * - Keyboard navigation
 */
const EditableDataGrid = ({ data, onChange, readOnly = false }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [modifiedCells, setModifiedCells] = useState(new Set());
    const [validationErrors, setValidationErrors] = useState({});

    // Account classes for dropdown
    const ACCOUNT_CLASSES = [
        { value: 1, label: '1 - Capitaux propres' },
        { value: 2, label: '2 - Immobilisations' },
        { value: 3, label: '3 - Stocks' },
        { value: 4, label: '4 - Tiers' },
        { value: 5, label: '5 - Trésorerie' },
        { value: 6, label: '6 - Charges' },
        { value: 7, label: '7 - Produits' },
    ];

    // Validation functions
    const validateAccountNumber = (value) => {
        if (!value) return 'Numéro de compte requis';
        const cleaned = String(value).replace(/[^0-9]/g, '');
        if (cleaned.length < 2 || cleaned.length > 8) {
            return 'Le numéro de compte doit contenir 2 à 8 chiffres';
        }
        return null;
    };

    const validateNumericValue = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        if (isNaN(value)) return 'Valeur numérique requise';
        return null;
    };

    const validatePoste = (value) => {
        if (!value || String(value).trim() === '') return 'Libellé requis';
        if (String(value).length > 255) return 'Libellé trop long (max 255 caractères)';
        return null;
    };

    // Handle cell value change
    const handleCellChange = useCallback((rowIndex, field, value, year = null) => {
        const newData = { ...data };
        const ligne = { ...newData.lignes[rowIndex] };

        // Update the field
        if (year !== null) {
            ligne.valeurs = { ...ligne.valeurs, [year]: value };
        } else {
            ligne[field] = value;

            // Auto-update classe based on numero_compte
            if (field === 'numero_compte' && value) {
                const firstDigit = String(value).replace(/[^0-9]/g, '')[0];
                if (firstDigit && firstDigit >= '1' && firstDigit <= '7') {
                    ligne.classe = parseInt(firstDigit);
                    const classInfo = ACCOUNT_CLASSES.find(c => c.value === ligne.classe);
                    ligne.classe_libelle = classInfo ? classInfo.label.split(' - ')[1] : '';
                }
            }
        }

        newData.lignes[rowIndex] = ligne;

        // Mark cell as modified
        const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
        setModifiedCells(prev => new Set([...prev, cellKey]));

        // Validate
        const errors = { ...validationErrors };
        if (field === 'numero_compte') {
            const error = validateAccountNumber(value);
            if (error) errors[cellKey] = error;
            else delete errors[cellKey];
        } else if (field === 'poste') {
            const error = validatePoste(value);
            if (error) errors[cellKey] = error;
            else delete errors[cellKey];
        } else if (year !== null) {
            const error = validateNumericValue(value);
            if (error) errors[cellKey] = error;
            else delete errors[cellKey];
        }
        setValidationErrors(errors);

        onChange(newData);
    }, [data, onChange, validationErrors]);

    // Add new row
    const handleAddRow = useCallback(() => {
        const newData = { ...data };
        const newRow = {
            poste: '',
            numero_compte: '',
            classe: null,
            classe_libelle: '',
            valeurs: {}
        };

        // Initialize values for all years
        data.annees.forEach(year => {
            newRow.valeurs[year] = 0;
        });

        newData.lignes.push(newRow);
        onChange(newData);
    }, [data, onChange]);

    // Remove row
    const handleRemoveRow = useCallback((rowIndex) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) return;

        const newData = { ...data };
        newData.lignes.splice(rowIndex, 1);

        // Clean up modified cells and errors for this row
        const newModifiedCells = new Set();
        modifiedCells.forEach(key => {
            const [idx] = key.split('-');
            if (parseInt(idx) !== rowIndex) {
                newModifiedCells.add(key);
            }
        });
        setModifiedCells(newModifiedCells);

        const newErrors = {};
        Object.keys(validationErrors).forEach(key => {
            const [idx] = key.split('-');
            if (parseInt(idx) !== rowIndex) {
                newErrors[key] = validationErrors[key];
            }
        });
        setValidationErrors(newErrors);

        onChange(newData);
    }, [data, onChange, modifiedCells, validationErrors]);

    // Get cell class names
    const getCellClassName = (rowIndex, field, year = null) => {
        const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
        const isModified = modifiedCells.has(cellKey);
        const hasError = validationErrors[cellKey];
        const isEditing = editingCell === cellKey;

        let className = 'px-3 py-2 text-gray-900 dark:text-gray-200 transition-colors ';

        if (hasError) {
            className += 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 ';
        } else if (isModified) {
            className += 'bg-yellow-50 dark:bg-yellow-900/20 ';
        } else {
            className += 'bg-white dark:bg-gray-800 ';
        }

        if (isEditing) {
            className += 'ring-2 ring-blue-500 ';
        }

        if (year !== null) {
            className += 'text-right ';
        }

        return className;
    };

    // Render editable cell
    const renderEditableCell = (rowIndex, field, value, year = null) => {
        const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
        const isEditing = editingCell === cellKey;
        const error = validationErrors[cellKey];

        if (readOnly) {
            return (
                <td className={getCellClassName(rowIndex, field, year)}>
                    {value !== null && value !== undefined ? String(value) : '-'}
                </td>
            );
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                setEditingCell(null);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setEditingCell(null);
            } else if (e.key === 'Tab') {
                setEditingCell(null);
            }
        };

        return (
            <td 
                className={getCellClassName(rowIndex, field, year)}
                onClick={() => !readOnly && setEditingCell(cellKey)}
                title={error || ''}
            >
                {isEditing ? (
                    <input
                        type={year !== null ? 'number' : 'text'}
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowIndex, field, e.target.value, year)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent text-sm"
                    />
                ) : (
                    <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded">
                        {value !== null && value !== undefined ? String(value) : '-'}
                    </div>
                )}
                {error && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {error}
                    </div>
                )}
            </td>
        );
    };

    // Render classe dropdown
    const renderClasseCell = (rowIndex, ligne) => {
        const cellKey = `${rowIndex}-classe`;
        const isEditing = editingCell === cellKey;

        if (readOnly) {
            return (
                <td className={getCellClassName(rowIndex, 'classe')}>
                    {ligne.classe && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ligne.classe === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            ligne.classe === 2 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                            ligne.classe === 3 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            ligne.classe === 4 ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                            ligne.classe === 5 ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                            ligne.classe === 6 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            ligne.classe === 7 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                            {ligne.classe} - {ligne.classe_libelle}
                        </span>
                    )}
                </td>
            );
        }

        return (
            <td 
                className={getCellClassName(rowIndex, 'classe')}
                onClick={() => setEditingCell(cellKey)}
            >
                {isEditing ? (
                    <select
                        value={ligne.classe || ''}
                        onChange={(e) => {
                            const selectedClass = ACCOUNT_CLASSES.find(c => c.value === parseInt(e.target.value));
                            handleCellChange(rowIndex, 'classe', parseInt(e.target.value));
                            if (selectedClass) {
                                handleCellChange(rowIndex, 'classe_libelle', selectedClass.label.split(' - ')[1]);
                            }
                            setEditingCell(null);
                        }}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent text-sm"
                    >
                        <option value="">Sélectionner...</option>
                        {ACCOUNT_CLASSES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                ) : (
                    <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded">
                        {ligne.classe && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                ligne.classe === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                ligne.classe === 2 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                                ligne.classe === 3 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                ligne.classe === 4 ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                                ligne.classe === 5 ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                                ligne.classe === 6 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                ligne.classe === 7 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                                {ligne.classe} - {ligne.classe_libelle}
                            </span>
                        )}
                    </div>
                )}
            </td>
        );
    };

    if (!data || !data.lignes || data.lignes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucune donnée à afficher
            </div>
        );
    }

    const hasErrors = Object.keys(validationErrors).length > 0;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h6 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                        📊 Données Structurées
                    </h6>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                        data.type_document === 'BILAN'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                        {data.type_document}
                    </span>
                </div>
                {!readOnly && (
                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une ligne
                    </button>
                )}
            </div>

            {/* Validation errors summary */}
            {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ⚠️ {Object.keys(validationErrors).length} erreur(s) de validation détectée(s)
                    </p>
                </div>
            )}

            {/* Legend */}
            {!readOnly && (
                <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 rounded"></div>
                        <span>Modifié</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded"></div>
                        <span>Erreur</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>💡 Cliquez sur une cellule pour modifier</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                    Poste
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                    Compte
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                    Classe
                                </th>
                                {data.annees.map(year => (
                                    <th key={year} className="px-3 py-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                        {year}
                                    </th>
                                ))}
                                {!readOnly && (
                                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {data.lignes.map((ligne, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    {renderEditableCell(rowIndex, 'poste', ligne.poste)}
                                    {renderEditableCell(rowIndex, 'numero_compte', ligne.numero_compte)}
                                    {renderClasseCell(rowIndex, ligne)}
                                    {data.annees.map(year => (
                                        <React.Fragment key={year}>
                                            {renderEditableCell(rowIndex, 'valeurs', ligne.valeurs[year], year)}
                                        </React.Fragment>
                                    ))}
                                    {!readOnly && (
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => handleRemoveRow(rowIndex)}
                                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                                                title="Supprimer cette ligne"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {data.lignes.length} ligne(s) • {modifiedCells.size} modification(s)
            </div>
        </div>
    );
};

export default EditableDataGrid;
