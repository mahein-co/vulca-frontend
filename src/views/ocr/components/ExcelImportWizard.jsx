import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Wizard d'importation Excel en 4 étapes :
 * 1. Upload du fichier
 * 2. Analyse et prévisualisation des feuilles
 * 3. Mapping des comptes non reconnus
 * 4. Validation finale et sauvegarde
 */
export default function ExcelImportWizard({ onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mappingCorrections, setMappingCorrections] = useState({});
    const [dataEdits, setDataEdits] = useState({}); // Track cell edits: {"sheetIndex-rowIndex-columnName": newValue}

    // États pour le mode OCR
    const [useOCR, setUseOCR] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionComplete, setExtractionComplete] = useState(false);

    const steps = [
        { number: 1, name: 'Upload', description: 'Sélectionner le fichier Excel' },
        { number: 2, name: 'Analyse', description: 'Prévisualisation des données' },
        { number: 3, name: 'Mapping', description: 'Validation des comptes' },
        { number: 4, name: 'Confirmation', description: 'Validation finale' }
    ];

    // ========== ÉTAPE 1 : UPLOAD ==========
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Vérifier l'extension
            if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
                toast.error('Format non supporté. Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!file) {
            toast.error('Veuillez sélectionner un fichier');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Ajouter le paramètre use_ocr si le mode OCR est activé
            if (useOCR) {
                formData.append('use_ocr', 'true');
            }

            const response = await fetch('/api/excel/upload/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setAnalysisResult(data);
                setCurrentStep(2);
                const method = data.extraction_method === 'OCR' ? 'OCR' : 'direct';
                toast.success(`Fichier analysé avec succès (méthode: ${method}) !`);
            } else {
                toast.error(data.error || 'Erreur lors de l\'analyse du fichier');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            toast.error('Erreur lors de l\'upload du fichier');
        } finally {
            setIsLoading(false);
        }
    };

    // ========== ÉTAPE 2 : PRÉVISUALISATION ==========
    const handleContinueToMapping = () => {
        // Vérifier s'il y a des lignes à mapper
        const hasUnmappedRows = analysisResult?.sheets?.some(
            sheet => sheet.unmapped_rows && sheet.unmapped_rows.length > 0
        );

        if (hasUnmappedRows) {
            setCurrentStep(3);
        } else {
            // Pas de mapping nécessaire, passer directement à la confirmation
            setCurrentStep(4);
        }
    };

    // ========== ÉTAPE 3 : MAPPING ==========
    const handleMappingCorrection = (sheetIndex, rowIndex, newAccount) => {
        setMappingCorrections(prev => ({
            ...prev,
            [`${sheetIndex}-${rowIndex}`]: newAccount
        }));
    };

    const handleDataEdit = (sheetIndex, rowIndex, columnName, newValue) => {
        const editKey = `${sheetIndex}-${rowIndex}-${columnName}`;
        setDataEdits(prev => ({
            ...prev,
            [editKey]: newValue
        }));
    };

    const handleContinueToConfirmation = () => {
        setCurrentStep(4);
    };

    // ========== ÉTAPE 4 : SAUVEGARDE ==========
    const handleFinalSave = async () => {
        setIsLoading(true);

        try {
            // Préparer les données pour la sauvegarde
            const sheetsData = analysisResult.sheets.map((sheet, sheetIndex) => {
                // JOURNAL: Format spécifique avec debit/credit
                if (sheet.detected_type === 'JOURNAL') {
                    const rows = sheet.data_preview
                        .filter((row) => {
                            // Filtrer les lignes de total
                            const compteCol = sheet.columns_mapping.compte;
                            const compte = compteCol ? row.values[compteCol] : null;
                            return compte && compte !== 0 && compte !== '0' && compte !== null;
                        })
                        .map((row, rowIndex) => {
                            const correctionKey = `${sheetIndex}-${rowIndex}`;
                            const correction = mappingCorrections[correctionKey];

                            // Appliquer les modifications de données
                            const editedValues = {};
                            Object.keys(row.values).forEach(columnName => {
                                const editKey = `${sheetIndex}-${rowIndex}-${columnName}`;
                                editedValues[columnName] = dataEdits[editKey] !== undefined
                                    ? dataEdits[editKey]
                                    : row.values[columnName];
                            });

                            // Extraire les colonnes
                            const compteCol = sheet.columns_mapping.compte;
                            const libelleCol = sheet.columns_mapping.libelle;
                            const debitCol = sheet.columns_mapping.debit;
                            const creditCol = sheet.columns_mapping.credit;
                            const numeroPieceCol = sheet.columns_mapping.numero_piece;

                            const numero_compte = correction || (compteCol ? String(editedValues[compteCol] || '') : '');
                            const libelle = libelleCol ? String(editedValues[libelleCol] || '') : '';
                            const debit = debitCol ? (editedValues[debitCol] || 0) : 0;
                            const credit = creditCol ? (editedValues[creditCol] || 0) : 0;
                            const numero_piece = numeroPieceCol ? String(editedValues[numeroPieceCol] || '') : null;

                            return {
                                numero_compte,
                                libelle,
                                debit,
                                credit,
                                numero_piece,
                                date: `${new Date().getFullYear()}-12-31`,
                                row_index: row.index
                            };
                        });

                    return {
                        sheet_name: sheet.sheet_name,
                        detected_type: sheet.detected_type,
                        rows: rows
                    };
                }

                // BILAN / COMPTE_RESULTAT: Use structured_data.lignes (multi-year) if available
                // CRITICAL FIX: data_preview uses columns_mapping.montant which may be wrongly mapped
                // to a year column (e.g. 2021), causing all rows to use that year's values.
                // Instead, we use structured_data.lignes which has per-year valeurs correctly extracted.
                const lignes = sheet.structured_data?.lignes;
                if (lignes && lignes.length > 0) {
                    const annees = sheet.structured_data?.annees || [];
                    const rows = [];

                    lignes.forEach((ligne) => {
                        const correctionKey = `${sheetIndex}-${rows.length}`;
                        const numero_compte = mappingCorrections[correctionKey] || ligne.numero_compte || '';
                        const libelle = ligne.poste || '';

                        if (annees.length > 0) {
                            // Multi-year: create one row per year with the correct value
                            annees.forEach((year) => {
                                const montant_ar = ligne.valeurs?.[String(year)] || 0;
                                // Skip zero-value rows (user requirement)
                                if (!montant_ar || montant_ar === 0) return;
                                rows.push({
                                    numero_compte,
                                    libelle,
                                    montant_ar,
                                    date: `${year}-12-31`,
                                    row_index: rows.length
                                });
                            });
                        } else {
                            // Single year / no year: use first available value
                            const valeurs = ligne.valeurs || {};
                            const firstVal = Object.values(valeurs)[0] || 0;
                            if (!firstVal || firstVal === 0) return;
                            rows.push({
                                numero_compte,
                                libelle,
                                montant_ar: firstVal,
                                date: null,
                                row_index: rows.length
                            });
                        }
                    });

                    return {
                        sheet_name: sheet.sheet_name,
                        detected_type: sheet.detected_type,
                        rows
                    };
                }

                // FALLBACK: No structured_data, use data_preview (old behaviour)
                const rows = sheet.data_preview.map((row, rowIndex) => {
                    const correctionKey = `${sheetIndex}-${rowIndex}`;
                    const correction = mappingCorrections[correctionKey];

                    // Appliquer les modifications de données
                    const editedValues = {};
                    Object.keys(row.values).forEach(columnName => {
                        const editKey = `${sheetIndex}-${rowIndex}-${columnName}`;
                        editedValues[columnName] = dataEdits[editKey] !== undefined
                            ? dataEdits[editKey]
                            : row.values[columnName];
                    });

                    return {
                        ...editedValues,
                        numero_compte: correction || editedValues[sheet.columns_mapping.compte],
                        libelle: editedValues[sheet.columns_mapping.libelle],
                        montant_ar: editedValues[sheet.columns_mapping.montant],
                        date: editedValues[sheet.columns_mapping.date],
                        row_index: row.index
                    };
                });

                return {
                    sheet_name: sheet.sheet_name,
                    detected_type: sheet.detected_type,
                    rows: rows
                };
            });


            const response = await fetch('/api/excel/save/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sheets: sheetsData })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Importation réussie ! ${data.created_bilans} bilans et ${data.created_compte_resultat} comptes de résultat créés.`);
                if (onComplete) onComplete(data);
                if (onClose) onClose();
            } else {
                toast.error(data.error || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde des données');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Importation Excel
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {steps[currentStep - 1].description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.number
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <CheckCircleIcon className="w-6 h-6" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded ${currentStep > step.number
                                            ? 'bg-green-500'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <Step1Upload
                            file={file}
                            onFileSelect={handleFileSelect}
                            isLoading={isLoading}
                            useOCR={useOCR}
                            setUseOCR={setUseOCR}
                        />
                    )}

                    {currentStep === 2 && analysisResult && (
                        <Step2Preview
                            analysisResult={analysisResult}
                            dataEdits={dataEdits}
                            onDataEdit={handleDataEdit}
                            onResetEdits={() => setDataEdits({})}
                        />
                    )}

                    {currentStep === 3 && analysisResult && (
                        <Step3Mapping
                            analysisResult={analysisResult}
                            mappingCorrections={mappingCorrections}
                            onMappingCorrection={handleMappingCorrection}
                        />
                    )}

                    {currentStep === 4 && analysisResult && (
                        <Step4Confirmation
                            analysisResult={analysisResult}
                            mappingCorrections={mappingCorrections}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1 || isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Précédent
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>

                        {currentStep === 1 && (
                            <button
                                onClick={handleUploadAndAnalyze}
                                disabled={!file || isLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isLoading && (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isLoading ? (useOCR ? 'Extraction OCR...' : 'Analyse...') : 'Analyser'}
                            </button>
                        )}

                        {currentStep === 2 && (
                            <button
                                onClick={handleContinueToMapping}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Continuer
                            </button>
                        )}

                        {currentStep === 3 && (
                            <button
                                onClick={handleContinueToConfirmation}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Continuer
                            </button>
                        )}

                        {currentStep === 4 && (
                            <button
                                onClick={handleFinalSave}
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isLoading && (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                Valider et Enregistrer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========== COMPOSANTS DES ÉTAPES ==========

function Step1Upload({ file, onFileSelect, isLoading, useOCR, setUseOCR }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-2xl">
                <label
                    htmlFor="excel-file-input"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M8,11H16V13H8V11M8,15H16V17H8V15Z" />
                        </svg>
                        <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {file ? file.name : 'Cliquez pour sélectionner un fichier Excel'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Formats acceptés : .xlsx, .xls
                        </p>
                        {file && (
                            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                ✓ Fichier sélectionné ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>
                    <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={onFileSelect}
                        className="hidden"
                        disabled={isLoading}
                    />
                </label>

                {/* Toggle OCR */}
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useOCR}
                            onChange={(e) => setUseOCR(e.target.checked)}
                            disabled={isLoading}
                            className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Utiliser l'extraction OCR (OpenAI Vision)
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {useOCR
                                    ? "⚡ Mode OCR activé - Extraction visuelle des données (plus lent mais fonctionne avec fichiers scannés)"
                                    : "🚀 Mode rapide - Lecture directe du fichier Excel (recommandé pour fichiers standards)"
                                }
                            </p>
                        </div>
                    </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Conseils</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        <li>Le fichier peut contenir plusieurs feuilles (Bilan, Compte de Résultat, etc.)</li>
                        <li>Chaque feuille sera analysée automatiquement</li>
                        <li>Les comptes seront reconnus selon le Plan Comptable Général</li>
                        <li>Vous pourrez corriger le mapping si nécessaire</li>
                        {useOCR && (
                            <>
                                <li className="text-amber-700 dark:text-amber-300">⚠️ Mode OCR : Temps d'extraction ~2-5 sec/feuille</li>
                                <li className="text-amber-700 dark:text-amber-300">⚠️ Utilisez OCR uniquement pour fichiers scannés/images</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Step2Preview({ analysisResult, dataEdits = {}, onDataEdit, onResetEdits }) {
    const [selectedSheet, setSelectedSheet] = useState(0);

    const currentSheet = analysisResult.sheets[selectedSheet];
    const extractionMethod = analysisResult.extraction_method || 'DIRECT';

    // Compter les modifications pour la feuille actuelle
    const currentSheetEdits = Object.keys(dataEdits).filter(key =>
        key.startsWith(`${selectedSheet}-`)
    ).length;

    const totalEdits = Object.keys(dataEdits).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Prévisualisation des données
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                            {analysisResult.total_rows} lignes au total
                        </span>
                        {totalEdits > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                ✏️ {totalEdits} modification(s)
                            </span>
                        )}
                    </div>
                </div>
                {totalEdits > 0 && (
                    <button
                        onClick={onResetEdits}
                        className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                    >
                        Annuler toutes les modifications
                    </button>
                )}
            </div>

            {/* Sélecteur de feuilles */}
            {analysisResult.sheets.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {analysisResult.sheets.map((sheet, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedSheet(index)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedSheet === index
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {sheet.sheet_name}
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${sheet.detected_type === 'BILAN'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : sheet.detected_type === 'COMPTE_RESULTAT'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                {sheet.detected_type}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Informations sur la feuille */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Type détecté</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {currentSheet.detected_type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Confiance: {(currentSheet.confidence * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Lignes totales</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {currentSheet.total_rows}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">À mapper</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {currentSheet.unmapped_rows?.length || 0}
                    </div>
                </div>
            </div>

            {/* Tableau de prévisualisation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                                {Object.keys(currentSheet.data_preview[0]?.values || {}).map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentSheet.data_preview.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {Object.entries(row.values).map(([columnName, value], colIdx) => {
                                        const editKey = `${selectedSheet}-${rowIdx}-${columnName}`;
                                        const editedValue = dataEdits[editKey] !== undefined ? dataEdits[editKey] : value;
                                        const isEdited = dataEdits[editKey] !== undefined;

                                        return (
                                            <td
                                                key={colIdx}
                                                className={`px-2 py-2 text-sm whitespace-nowrap transition-colors ${isEdited ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                                                    }`}
                                            >
                                                <input
                                                    type="text"
                                                    value={editedValue !== null && editedValue !== undefined ? String(editedValue) : ''}
                                                    onChange={(e) => onDataEdit(selectedSheet, rowIdx, columnName, e.target.value)}
                                                    className={`w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isEdited
                                                        ? 'border-yellow-400 dark:border-yellow-600'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                    title={isEdited ? `Modifié: ${value} → ${editedValue}` : 'Cliquez pour modifier'}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notice d'information sur l'édition */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Édition des données</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Cliquez sur n'importe quelle cellule pour modifier sa valeur</li>
                    <li>Les cellules modifiées sont surlignées en jaune</li>
                    <li>Utilisez le bouton "Annuler toutes les modifications" pour réinitialiser</li>
                    <li>Les modifications seront appliquées lors de la sauvegarde finale</li>
                </ul>
            </div>

            {currentSheet.unmapped_rows && currentSheet.unmapped_rows.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-300">
                                Attention : {currentSheet.unmapped_rows.length} ligne(s) nécessitent un mapping
                            </h4>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                Certaines lignes ne contiennent pas de numéro de compte valide. Vous pourrez les mapper à l'étape suivante.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Step3Mapping({ analysisResult, mappingCorrections, onMappingCorrection }) {
    // Collecter toutes les lignes non mappées de toutes les feuilles
    const allUnmappedRows = [];
    analysisResult.sheets.forEach((sheet, sheetIndex) => {
        if (sheet.unmapped_rows && sheet.unmapped_rows.length > 0) {
            sheet.unmapped_rows.forEach(row => {
                allUnmappedRows.push({
                    ...row,
                    sheetIndex,
                    sheetName: sheet.sheet_name
                });
            });
        }
    });

    if (allUnmappedRows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Aucun mapping nécessaire
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tous les comptes ont été reconnus automatiquement
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Mapping des comptes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {allUnmappedRows.length} ligne(s) nécessitent un numéro de compte
                </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Feuille
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Libellé
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Compte détecté
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Numéro de compte
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allUnmappedRows.map((row, idx) => {
                                const correctionKey = `${row.sheetIndex}-${row.row_index}`;
                                const currentValue = mappingCorrections[correctionKey] || row.compte_detecte || '';

                                return (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {row.sheetName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {row.libelle || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {row.compte_detecte || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => onMappingCorrection(row.sheetIndex, row.row_index, e.target.value)}
                                                placeholder="Ex: 401, 512..."
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Aide au mapping</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Classe 1-5 : Comptes de Bilan (Actif/Passif)</li>
                    <li>Classe 6 : Charges (Compte de Résultat)</li>
                    <li>Classe 7 : Produits (Compte de Résultat)</li>
                    <li>Exemples : 401 (Fournisseurs), 512 (Banque), 607 (Achats), 707 (Ventes)</li>
                </ul>
            </div>
        </div>
    );
}

function Step4Confirmation({ analysisResult, mappingCorrections }) {
    const totalBilan = analysisResult.sheets
        .filter(s => s.detected_type === 'BILAN')
        .reduce((sum, s) => sum + s.total_rows, 0);

    const totalCR = analysisResult.sheets
        .filter(s => s.detected_type === 'COMPTE_RESULTAT')
        .reduce((sum, s) => sum + s.total_rows, 0);

    const totalMapped = Object.keys(mappingCorrections).length;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Récapitulatif de l'importation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Vérifiez les informations avant de valider
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Bilan</div>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                        {totalBilan}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">lignes à importer</div>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">Compte de Résultat</div>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                        {totalCR}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-1">lignes à importer</div>
                </div>
            </div>

            {totalMapped > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
                            {totalMapped} correction(s) de mapping appliquée(s)
                        </span>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Feuilles à importer :</h4>
                {analysisResult.sheets.map((sheet, idx) => (
                    <div
                        key={idx}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {sheet.sheet_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {sheet.total_rows} lignes • Type: {sheet.detected_type}
                                </div>
                            </div>
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-300">
                            Prêt à importer
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                            Les données seront enregistrées dans votre comptabilité. Cliquez sur "Valider et Enregistrer" pour finaliser l'importation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
