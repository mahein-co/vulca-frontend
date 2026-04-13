import React, { useState, useCallback, useMemo } from 'react';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import { getTodayISO } from '../../../utils/dateUtils';

/**
 * EditableDataGrid - Component for editing structured financial data
 * 
 * Features:
 * - Supports multiple document types (BILAN, COMPTE_RESULTAT, JOURNAL, etc.)
 * - Inline cell editing
 * - Add/remove rows
 * - Real-time validation
 */
const EditableDataGrid = ({ data, onChange, onDeleteRow, readOnly = false }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [modifiedCells, setModifiedCells] = useState(new Set());
    const [validationErrors, setValidationErrors] = useState({});

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [applyToAll, setApplyToAll] = useState(false);

    // Identify document type
    const isJournal = useMemo(() =>
        ['JOURNAL', 'GRAND JOURNAL'].includes(data?.type_document),
        [data]);

    // Ensure annees is an array to prevent crash if undefined (only used for non-Journal types)
    const years = useMemo(() => Array.isArray(data?.annees) ? data.annees : [], [data]);

    // Account classes for dropdown (only for Bilan/Compte Resultat)
    const ACCOUNT_CLASSES = [
        { value: 1, label: 'Capitaux propres' },
        { value: 2, label: 'Immobilisations' },
        { value: 3, label: 'Stocks' },
        { value: 4, label: 'Tiers' },
        { value: 5, label: 'Trésorerie' },
        { value: 6, label: 'Charges' },
        { value: 7, label: 'Produits' },
    ];

    // Validation functions
    const validateAccountNumber = (value) => {
        if (!value || String(value).trim() === '-' || String(value).trim() === '') return null;
        // Remove spaces
        const valStr = String(value).trim();
        // Check if it's a valid integer
        if (!/^\d+$/.test(valStr)) {
            return 'Le numéro de compte doit être un nombre entier';
        }
        if (valStr.length < 2 || valStr.length > 10) {
            return 'Le numéro de compte doit être valide';
        }
        return null;
    };

    const validateNumericValue = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        if (isNaN(value)) return 'Valeur numérique requise';
        return null;
    };

    const validateRequired = (value, label) => {
        if (!value || String(value).trim() === '') return `${label} requis`;
        return null;
    };

    // Handle cell value change
    const handleCellChange = useCallback((rowIndex, field, value, year = null) => {
        const newData = {
            ...data,
            lignes: [...data.lignes]
        };
        const ligne = { ...newData.lignes[rowIndex] };

        if (isJournal) {
            // Journal specific updates
            ligne[field] = value;

            // Validate Journal fields
            const cellKey = `${rowIndex}-${field}`;
            const errors = { ...validationErrors };

            if (['debit', 'credit'].includes(field)) {
                const error = validateNumericValue(value);
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            } else if (['numero_compte'].includes(field)) {
                const error = validateAccountNumber(value);
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            } else if (['date', 'libelle'].includes(field)) {
                const error = validateRequired(value, field === 'date' ? 'Date' : 'Libellé');
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            }

            setValidationErrors(errors);
        } else {
            // Bilan / Compte Resultat logic
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
                        ligne.classe_libelle = classInfo ? classInfo.label : '';
                    }
                }
            }

            // Validate Bilan fields
            const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
            const errors = { ...validationErrors };

            if (field === 'numero_compte') {
                const error = validateAccountNumber(value);
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            } else if (field === 'poste') {
                const error = validateRequired(value, 'Poste');
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            } else if (year !== null) {
                const error = validateNumericValue(value);
                if (error) errors[cellKey] = error;
                else delete errors[cellKey];
            }
            setValidationErrors(errors);
        }

        newData.lignes[rowIndex] = ligne;

        // Mark cell as modified
        const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
        setModifiedCells(prev => new Set([...prev, cellKey]));

        onChange(newData);
    }, [data, onChange, validationErrors, isJournal]);

    const handleRemoveRow = useCallback((rowIndex) => {
        setRowToDelete(rowIndex);
        setApplyToAll(false);
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = () => {
        const rowIndex = rowToDelete;

        // Notify parent of the deletion, especially for global sync
        if (onDeleteRow) {
            onDeleteRow(rowIndex, applyToAll);
        } else {
            // Fallback to local deletion if onDeleteRow not provided
            const newData = {
                ...data,
                lignes: data.lignes.filter((_, idx) => idx !== rowIndex)
            };
            onChange(newData);
        }

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

        setDeleteModalOpen(false);
        setRowToDelete(null);
    };

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

        if (year !== null || ['debit', 'credit'].includes(field)) {
            className += 'text-right ';
        }

        return className;
    };

    // Render editable cell
    const renderEditableCell = (rowIndex, field, value, year = null, type = 'text') => {
        const cellKey = year ? `${rowIndex}-${year}` : `${rowIndex}-${field}`;
        const isEditing = editingCell === cellKey;
        const error = validationErrors[cellKey];

        const displayValue = (value !== null && value !== undefined) ? String(value) : '';

        // Format dates from YYYY-MM-DD to DD/MM/YYYY for display
        let finalValue = displayValue;
        if (field === 'date' && displayValue && /^\d{4}-\d{2}-\d{2}$/.test(displayValue)) {
            const [year, month, day] = displayValue.split('-');
            finalValue = `${day}/${month}/${year}`;
        }
        // Clean account numbers (e.g. 512.0 -> 512) for display
        else if ((field === 'numero_compte' || field === 'compte' || field === 'classe' || field === 'classe_libelle') && displayValue) {
            if (displayValue.endsWith('.0')) {
                finalValue = displayValue.slice(0, -2);
            }
            // Remove numeric prefix if present (e.g. "1 - Capitaux propres" -> "Capitaux propres")
            if (typeof finalValue === 'string' && /^\d\s*-\s*/.test(finalValue)) {
                finalValue = finalValue.replace(/^\d\s*-\s*/, '');
            }
        } else if (!isEditing && type === 'number' && displayValue !== '') {
            const num = Number(displayValue);
            if (!isNaN(num)) {
                // Formater avec des espaces (via fr-FR) et 2 décimales max
                const hasDecimals = num % 1 !== 0;
                finalValue = num.toLocaleString('fr-FR', {
                    minimumFractionDigits: hasDecimals ? 2 : 0,
                    maximumFractionDigits: 2
                });
            }
        }

        if (readOnly) {
            return (
                <td className={getCellClassName(rowIndex, field, year)}>
                    {finalValue || '-'}
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
                        type={type}
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowIndex, field, e.target.value, year)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent text-sm"
                    />
                ) : (
                    <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded min-h-[1.5rem]">
                        {displayValue || '-'}
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

    // Render classe cell (now a text input as requested)
    const renderClasseCell = (rowIndex, ligne) => {
        return renderEditableCell(rowIndex, 'classe_libelle', ligne.classe_libelle);
    };

    // Determine dominant journal type for the sheet
    const sheetJournalType = useMemo(() => {
        if (!isJournal || !data.lignes || data.lignes.length === 0) return 'OD';

        // Count occurrences of each type
        const counts = {};
        let maxCount = 0;
        let dominant = 'OD';

        data.lignes.forEach(l => {
            const type = (l.type_journal || 'OD').trim().toUpperCase();
            if (type) {
                counts[type] = (counts[type] || 0) + 1;
                if (counts[type] > maxCount) {
                    maxCount = counts[type];
                    dominant = type;
                }
            }
        });

        return dominant;
    }, [data, isJournal]);

    // Handle global journal type change
    const handleJournalTypeChange = (newType) => {
        const newData = {
            ...data,
            lignes: data.lignes.map(l => ({
                ...l,
                type_journal: newType
            }))
        };
        onChange(newData);
    };

    if (!data || !data.lignes || data.lignes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucune donnée à afficher
            </div>
        );
    }

    const hasErrors = Object.keys(validationErrors).length > 0;
    const JOURNAL_TYPES = ['ACHAT', 'VENTE', 'BANQUE', 'CAISSE', 'OD', 'AN'];

    return (
        <div className="space-y-3">
            {/* Header Actions */}
            {!readOnly && (
                <div className="flex justify-between items-center mb-2">
                    {/* Journal Type Selector (only for Journal) */}
                    {isJournal && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Type de Journal :</span>
                            <select
                                value={sheetJournalType}
                                onChange={(e) => handleJournalTypeChange(e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                                {JOURNAL_TYPES.includes(sheetJournalType) ? null : (
                                    <option value={sheetJournalType}>{sheetJournalType}</option>
                                )}
                                {JOURNAL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <span className="text-[10px] text-gray-400 ml-1">(Appliqué à toutes les lignes)</span>
                        </div>
                    )}

                    {/* Add Row Button */}
                    <button
                        onClick={() => {
                            // Helper to ensure we pass the correct type when adding
                            const newData = {
                                ...data,
                                lignes: [...data.lignes]
                            };
                            let newRow;

                            if (isJournal) {
                                newRow = {
                                    date: getTodayISO(),
                                    numero_piece: '',
                                    numero_compte: '',
                                    libelle: '',
                                    debit: 0,
                                    credit: 0,
                                    type_journal: sheetJournalType // Use the sheet-level type
                                };
                            } else {
                                newRow = {
                                    poste: '',
                                    numero_compte: '',
                                    classe: null,
                                    classe_libelle: '',
                                    valeurs: {}
                                };
                                years.forEach(year => {
                                    newRow.valeurs[year] = 0;
                                });
                            }

                            newData.lignes.push(newRow);
                            onChange(newData);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition ml-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une ligne
                    </button>
                </div>
            )}

            {/* Validation errors summary */}
            {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ⚠️ {Object.keys(validationErrors).length} erreur(s) de validation détectée(s)
                    </p>
                </div>
            )}

            {/* Table wrapper - Horizontal scroll only, vertical handled by parent */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                            <tr>
                                {isJournal ? (
                                    <>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Journal</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">N° Pièce</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Compte</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Libellé</th>
                                        <th className="px-3 py-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Débit</th>
                                        <th className="px-3 py-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Crédit</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Poste</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Compte</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Classe</th>
                                        {years.map(year => (
                                            <th key={year} className="px-3 py-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                                {String(year).match(/^\d{4}$/) ? `Montant (${year})` : year}
                                            </th>
                                        ))}
                                    </>
                                )}

                                {!readOnly && (
                                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {data.lignes.map((ligne, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    {isJournal ? (
                                        <>
                                            {renderEditableCell(rowIndex, 'date', ligne.date, null, 'date')}
                                            {renderEditableCell(rowIndex, 'type_journal', ligne.type_journal)}
                                            {renderEditableCell(rowIndex, 'numero_piece', ligne.numero_piece)}
                                            {renderEditableCell(rowIndex, 'numero_compte', ligne.numero_compte)}
                                            {renderEditableCell(rowIndex, 'libelle', ligne.libelle)}
                                            {renderEditableCell(rowIndex, 'debit', ligne.debit, null, 'number')}
                                            {renderEditableCell(rowIndex, 'credit', ligne.credit, null, 'number')}
                                        </>
                                    ) : (
                                        <>
                                            {renderEditableCell(rowIndex, 'poste', ligne.poste)}
                                            {renderEditableCell(rowIndex, 'numero_compte', ligne.numero_compte)}
                                            {renderClasseCell(rowIndex, ligne)}
                                            {years.map(year => (
                                                <React.Fragment key={year}>
                                                    {renderEditableCell(rowIndex, 'valeurs', ligne.valeurs[year], year, 'number')}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )}

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

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer la ligne ?"
                message="Êtes-vous sûr de vouloir supprimer cette ligne de données ?"
                confirmText="Supprimer"
                isDanger={true}
            >
                {!isJournal && years.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-600">
                        <input
                            type="checkbox"
                            id="apply-to-all"
                            checked={applyToAll}
                            onChange={(e) => setApplyToAll(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="apply-to-all" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Appliquer à tous les exercices de cette feuille
                        </label>
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
};

export default EditableDataGrid;
