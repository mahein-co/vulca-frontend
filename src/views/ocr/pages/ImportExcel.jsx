import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithReauth } from '../../../utils/apiUtils';
import EditableDataGrid from '../components/EditableDataGrid';
import LoadingOverlay from '../../../components/layout/LoadingOverlay';

// Styles CSS pour les animations
const styles = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -60px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
    }
}

@keyframes simpleFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.animate-simpleFadeIn {
    animation: simpleFadeIn 0.3s ease-out forwards;
}

.animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
}
`;

const EMPTY_FORM_DATA = {
    fileName: '',
    sheets: [],
    extraction_method: ''
};

const ACCEPTED_FILE_TYPES = ".xlsx,.xls";
const MAX_FILE_UPLOAD = 10;

// --- 1. Composant : ExcelDocumentViewer ---
const ExcelDocumentViewer = ({ file, onFileDrop, isDragActive, onFileSelect, onRemoveFile, isMultiple }) => {
    const isLoaded = !!file;

    return (
        <label
            htmlFor="excel-file-input"
            className={`relative overflow-hidden border-2 border-dashed rounded-lg flex flex-col items-center p-3 sm:p-4 h-full cursor-pointer transition-all duration-300
                ${isDragActive
                    ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 scale-[1.01] shadow-xl'
                    : isLoaded
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                }`
            }
            onDrop={onFileDrop}
            onDragOver={(e) => { e.preventDefault(); }}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
        >
            {isLoaded && onRemoveFile && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onRemoveFile(); }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white dark:bg-gray-700 shadow text-gray-600 dark:text-gray-300 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-all duration-200 z-10"
                    aria-label="Supprimer le fichier"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {isLoaded ? (
                <div className="text-center w-full h-full flex flex-col min-h-0">
                    <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 truncate max-w-[85%] sm:max-w-[90%] flex-shrink-0">
                        {file.name}
                    </p>

                    <div className="w-full flex-grow min-h-0 overflow-y-auto flex justify-center p-1 sm:p-2">
                        <div className="flex items-start justify-center w-full">
                            <div className="mt-4 sm:mt-8 text-gray-500 flex flex-col items-center max-w-md mx-auto px-4">
                                <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M8,11H16V13H8V11M8,15H16V17H8V15Z" />
                                </svg>
                                <p className="mt-3 font-semibold text-base sm:text-lg text-gray-700 dark:text-gray-200">Fichier Excel</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 text-center break-all">{file.name}</p>
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 text-center">
                                        💡 L'aperçu Excel natif n'est pas disponible. Le fichier sera traité lors de l'extraction OCR.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center flex flex-col items-center justify-center flex-grow">
                    <div className="mb-4">
                        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Glissez vos fichiers Excel ici
                    </p>
                    <p className="text-sm sm:text-md text-gray-500 dark:text-gray-400 mt-1 px-2">
                        ou <span className="text-gray-700 dark:text-gray-300 font-bold hover:underline">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Maximum {MAX_FILE_UPLOAD} fichiers</p>
                </div>
            )}
            <input
                id="excel-file-input"
                key={isLoaded ? file.name : 'empty'}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={onFileSelect}
                className="hidden"
                multiple={isMultiple}
            />
        </label>
    );
};

// --- 2. Composant : ExcelValidationForm ---
const ExcelValidationForm = ({
    formData,
    onValider,
    isDocumentLoaded,
    isExtracted,
    onExtractText,
    documentsCount,
    isLotValidatable,
    isLoading,
    isSaving,
    onExtractAll,
    currentIndex,
    editMode,
    editedData,
    setEditMode,
    setEditedData,
    companyMetadata,
    onMetadataChange,
    onDeleteRow
}) => {
    // Check if company metadata has meaningful data
    const hasCompanyInfo = useMemo(() => {
        const meta = companyMetadata?.[currentIndex];
        return meta && Object.values(meta).some(val => val && String(val).trim() !== '');
    }, [companyMetadata, currentIndex]);

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 sm:p-3 h-full flex flex-col min-h-0 overflow-hidden text-sm">
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700" />

            {/* Boutons d'Action OCR */}
            <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 flex-shrink-0">
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={documentsCount > 1 ? onExtractAll : onExtractText}
                        disabled={isLoading || documentsCount === 0 || isLotValidatable}
                        className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded text-xs font-medium transition duration-150 flex-1 sm:flex-initial
                            ${isLoading || documentsCount === 0 || isLotValidatable
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`
                        }
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Extraction OCR en cours...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 8-3-3m3 3l3-3m-3 3zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                                <span>Extraire les informations</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Nom du Fichier Source */}
            <div className="mb-2 flex-shrink-0">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Fichier Source</label>
                <input
                    type="text"
                    name="fileName"
                    value={formData.fileName}
                    disabled={true}
                    className="block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default py-1"
                    placeholder="Aucun fichier sélectionné"
                />
            </div>

            {/* Contenu du Formulaire : SCROLL INTERNE */}
            <div className="flex-grow min-h-0 overflow-y-auto pr-1">
                {isExtracted ? (
                    <div className="relative bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-400 dark:border-amber-600 p-2 rounded-sm text-xs text-amber-900 dark:text-amber-200 mb-2">
                        <p className="font-bold flex items-center">⚠️ Vérifiez les données extraites. Vous pouvez les modifier si nécessaire.</p>
                    </div>
                ) : (
                    isDocumentLoaded && (
                        <div className="relative bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400 dark:border-blue-600 p-2 rounded-sm text-xs text-blue-900 dark:text-blue-200 mb-2">
                            <h4 className="font-bold mb-0.5 mb-1">{isLoading ? 'Extraction en cours...' : 'En attente d\'extraction'}</h4>
                            <p className="leading-tight">
                                {isLoading ? 'Veuillez patienter pendant l\'analyse de votre fichier Excel.' : 'Cliquez sur "Extraire les informations" pour analyser le fichier.'}
                            </p>
                        </div>
                    )
                )}

                {isExtracted && formData.sheets && formData.sheets.length > 0 && (
                    <div className="space-y-3">
                        {/* Affichage de la méthode d'extraction */}

                        {/* Informations Entreprise (En-tête) */}
                        {hasCompanyInfo && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-bold text-xs uppercase text-gray-600 dark:text-gray-400">Informations Entreprise</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nom de l'entreprise</label>
                                        <input
                                            type="text"
                                            value={companyMetadata?.nom_entreprise || ""}
                                            onChange={(e) => onMetadataChange("nom_entreprise", e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="REKAPY..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Adresse</label>
                                        <input
                                            type="text"
                                            value={companyMetadata?.adresse || ""}
                                            onChange={(e) => onMetadataChange("adresse", e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="Amborogony - Toliara 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">NIF</label>
                                        <input
                                            type="text"
                                            value={companyMetadata?.nif || ""}
                                            onChange={(e) => onMetadataChange("nif", e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="3001211395"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">STAT</label>
                                        <input
                                            type="text"
                                            value={companyMetadata?.stat || ""}
                                            onChange={(e) => onMetadataChange("stat", e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="22112 51 2007 0 00084"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* {hasCompanyInfo && ( ... )} */}
                    </div>
                )}

                {/* Affichage des données structurées avec EditableDataGrid */}
                {isExtracted && formData.sheets && formData.sheets.length > 0 && (
                    <div className="space-y-4 mt-4">
                        {formData.sheets
                            .filter(sheet => {
                                // Filtrer pour afficher uniquement JOURNAL, BILAN et COMPTE_RESULTAT
                                const docType = sheet.structured_data?.type_document;
                                return docType === 'JOURNAL' || docType === 'BILAN' || docType === 'COMPTE_RESULTAT';
                            })
                            .flatMap((sheet, sheetIdx) => {
                                // Pour chaque feuille, créer une entrée par année
                                const currentData = sheet.structured_data;
                                if (!currentData || !currentData.lignes || currentData.lignes.length === 0) return [];

                                const years = currentData.annees || [];

                                // Si pas d'années ou une seule année, afficher normalement
                                if (years.length <= 1) {
                                    return [{
                                        sheet,
                                        sheetIdx,
                                        year: years[0] || null,
                                        isMultiYear: false
                                    }];
                                }

                                // Si plusieurs années, créer une entrée par année
                                return years.map(year => ({
                                    sheet,
                                    sheetIdx,
                                    year,
                                    isMultiYear: true
                                }));
                            })
                            .map(({ sheet, sheetIdx, year, isMultiYear }, displayIdx) => {
                                // Récupérer les données modifiées si elles existent
                                const docSheetKey = year ? `${currentIndex}-${sheetIdx}-${year}` : `${currentIndex}-${sheetIdx}`;
                                let currentData = editedData[docSheetKey];

                                // Si pas encore de modifications, créer la version initiale (filtrée par année si multi-year)
                                if (!currentData) {
                                    if (isMultiYear && year) {
                                        // Filtrer les données pour ne garder que cette année
                                        currentData = {
                                            ...sheet.structured_data,
                                            annees: [year],
                                            lignes: sheet.structured_data.lignes.map(ligne => ({
                                                ...ligne,
                                                valeurs: { [year]: ligne.valeurs[year] }
                                            }))
                                        };
                                    } else {
                                        currentData = sheet.structured_data;
                                    }
                                }

                                const isEditMode = editMode[docSheetKey] || false;

                                return (
                                    <div key={`structured-${displayIdx}`} className="mb-4">
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                            {/* Header with Edit Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <span>{(() => {
                                                            // Améliorer les titres des feuilles
                                                            const sheetName = sheet.sheet_name.toUpperCase();
                                                            const docType = currentData.type_document;

                                                            // BILAN - ACTIF / PASSIF
                                                            if (docType === 'BILAN') {
                                                                if (sheetName.includes('ACTIF') && !sheetName.includes('PASSIF')) {
                                                                    return 'BILAN - ACTIF';
                                                                } else if (sheetName.includes('PASSIF')) {
                                                                    return 'BILAN - PASSIF';
                                                                } else {
                                                                    return `BILAN - ${sheet.sheet_name}`;
                                                                }
                                                            }

                                                            // COMPTE DE RÉSULTAT
                                                            if (docType === 'COMPTE_RESULTAT') {
                                                                if (sheetName.includes('CDR') || sheetName.includes('COMPTE') || sheetName.includes('RESULTAT')) {
                                                                    return 'COMPTE DE RÉSULTAT';
                                                                }
                                                                return `COMPTE DE RÉSULTAT - ${sheet.sheet_name}`;
                                                            }

                                                            // JOURNAL
                                                            if (docType === 'JOURNAL') {
                                                                return `JOURNAL - ${sheet.sheet_name}`;
                                                            }

                                                            // Défaut
                                                            return sheet.sheet_name;
                                                        })()}</span>
                                                    </h6>
                                                    {/* Afficher la période avec l'année si multi-year */}
                                                    {isMultiYear && year ? (
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                            📅 EXERCICE {year}
                                                        </p>
                                                    ) : currentData.company_metadata?.periode ? (
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                            📅 {currentData.company_metadata.periode}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditMode(prev => ({
                                                                ...prev,
                                                                [docSheetKey]: !prev[docSheetKey]
                                                            }));
                                                        }}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition ${isEditMode
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {isEditMode ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Aperçu
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Modifier
                                                            </>
                                                        )}
                                                    </button>
                                                    {isEditMode && editedData[docSheetKey] && (
                                                        <button
                                                            onClick={() => {
                                                                setEditedData(prev => {
                                                                    const newData = { ...prev };
                                                                    delete newData[docSheetKey];
                                                                    return newData;
                                                                });
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                            title="Réinitialiser aux données originales"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Réinitialiser
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Editable Data Grid */}
                                            <EditableDataGrid
                                                data={currentData}
                                                onChange={(updatedData) => {
                                                    setEditedData(prev => ({
                                                        ...prev,
                                                        [docSheetKey]: updatedData
                                                    }));
                                                }}
                                                onDeleteRow={(rowIndex, applyToAll) => {
                                                    onDeleteRow(sheetIdx, rowIndex, year, applyToAll);
                                                }}
                                                readOnly={!isEditMode}
                                            />

                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Bouton de Validation */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
                <button
                    type="submit"
                    onClick={onValider}
                    disabled={!isLotValidatable || isSaving}
                    className={`w-full sm:w-auto py-1.5 px-4 border border-transparent rounded shadow-sm text-xs font-medium text-white transition duration-150 flex items-center justify-center
                        ${isLotValidatable && !isSaving ? 'bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 focus:ring-gray-800' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`
                    }
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Traitement...
                        </>
                    ) : (
                        'Valider'
                    )}
                </button>
            </div>
        </div >
    );
};

// --- 3. Composant Principal (ImportExcel) ---
export default function ImportExcel({ onSaisieCompleted }) {
    const [documents, setDocuments] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragActive, setIsDragActive] = useState(false);
    const [showFormOnMobile, setShowFormOnMobile] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isBatchExtracting, setIsBatchExtracting] = useState(false);
    const [editMode, setEditMode] = useState({}); // Track edit mode per document-sheet
    const [editedData, setEditedData] = useState({}); // Track edited data per document-sheet
    const [companyMetadata, setCompanyMetadata] = useState({}); // Track company metadata per document

    // --- Logique Métier ---

    // 1. Gestion des Fichiers
    const addFiles = useCallback((newFiles) => {
        const validFiles = [...newFiles].filter(file =>
            file.name.match(/\.(xlsx|xls)$/i)
        );

        if (validFiles.length === 0) {
            toast.error("Veuillez sélectionner des fichiers Excel (.xlsx ou .xls)");
            return;
        }

        if (documents.length + validFiles.length > MAX_FILE_UPLOAD) {
            toast.error(`Maximum ${MAX_FILE_UPLOAD} fichiers autorisés.`);
            return;
        }

        const newDocs = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            data: { ...EMPTY_FORM_DATA, fileName: file.name },
            isExtracted: false
        }));

        setDocuments(prev => [...prev, ...newDocs]);
        if (documents.length === 0 && newDocs.length > 0) {
            setCurrentIndex(0);
        }
    }, [documents]);

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    }, [addFiles]);

    const handleFileSelect = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
        }
    }, [addFiles]);

    const handleRemoveCurrentDocument = useCallback(() => {
        if (documents.length === 0) return;

        const newDocs = documents.filter((_, idx) => idx !== currentIndex);
        setDocuments(newDocs);

        if (newDocs.length === 0) {
            setCurrentIndex(0);
        } else if (currentIndex >= newDocs.length) {
            setCurrentIndex(newDocs.length - 1);
        }
    }, [documents, currentIndex]);

    const handleClearAll = useCallback(() => {
        setDocuments([]);
        setCurrentIndex(0);
    }, []);

    // 2. Navigation
    const handlePrevious = () => setCurrentIndex(prev => Math.max(0, prev - 1));
    const handleNext = () => setCurrentIndex(prev => Math.min(documents.length - 1, prev + 1));

    // 3. Variables Dérivées
    const currentDocument = documents[currentIndex];
    const currentFile = currentDocument?.file || null;
    const currentIsExtracted = currentDocument?.isExtracted || false;
    const currentFormData = currentDocument?.data || EMPTY_FORM_DATA;

    const isLotValidatable = useMemo(() => {
        return documents.length > 0 && documents.every(doc => doc.isExtracted);
    }, [documents]);

    // Check if company metadata has any meaningful data (Removed local calculation, moved to child)
    // const hasCompanyInfo = ... (moved to ExcelValidationForm)

    // Handler pour les changements de métadonnées
    const handleMetadataChange = useCallback((field, value) => {
        setCompanyMetadata(prev => ({
            ...prev,
            [currentIndex]: {
                ...(prev[currentIndex] || {}),
                [field]: value
            }
        }));
    }, [currentIndex]);

    // Handler pour la suppression de ligne (avec option globale)
    const handleDeleteRow = useCallback((sheetIdx, rowIndex, year, applyToAll) => {
        const doc = documents[currentIndex];
        const sheet = doc.data.sheets[sheetIdx];
        if (!sheet || !sheet.structured_data) return;

        const yearsToUpdate = (applyToAll && sheet.structured_data.annees && sheet.structured_data.annees.length > 1)
            ? sheet.structured_data.annees
            : [year];

        setEditedData(prev => {
            const newState = { ...prev };

            yearsToUpdate.forEach(y => {
                const key = y ? `${currentIndex}-${sheetIdx}-${y}` : `${currentIndex}-${sheetIdx}`;
                let currentData = newState[key];

                if (!currentData) {
                    // Initialisation si pas encore de modification (même logique que l'affichage)
                    if (y && sheet.structured_data.annees && sheet.structured_data.annees.length > 1) {
                        currentData = {
                            ...sheet.structured_data,
                            annees: [y],
                            lignes: sheet.structured_data.lignes.map(ligne => ({
                                ...ligne,
                                valeurs: { [y]: ligne.valeurs[y] }
                            }))
                        };
                    } else {
                        currentData = sheet.structured_data;
                    }
                }

                // Suppression de la ligne
                newState[key] = {
                    ...currentData,
                    lignes: currentData.lignes.filter((_, idx) => idx !== rowIndex)
                };
            });

            return newState;
        });

        toast.success(applyToAll ? "Ligne supprimée sur tous les exercices" : "Ligne supprimée");
    }, [currentIndex, documents]);

    // 4. Extraction OCR
    const handleExtractText = async () => {
        if (!currentFile) return;

        setIsExtracting(true);

        try {
            const formData = new FormData();
            formData.append('file', currentFile);
            formData.append('use_ocr', 'true');

            console.log('📤 Envoi de la requête d\'extraction pour:', currentFile.name);

            const response = await fetchWithReauth('/excel/upload/', {
                method: 'POST',
                body: formData
            });

            console.log('📥 Réponse reçue:', response.status, response.statusText);
            console.log('📋 Content-Type:', response.headers.get('content-type'));

            // Vérifier le type de contenu
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('❌ Réponse non-JSON reçue:', textResponse.substring(0, 500));
                throw new Error(`Le serveur a renvoyé un format invalide (${response.status}). Vérifiez les logs du serveur.`);
            }

            const result = await response.json();
            console.log('📊 Données reçues:', result);

            if (response.ok) {
                setDocuments(prev => prev.map((doc, idx) => {
                    if (idx === currentIndex) {
                        return {
                            ...doc,
                            isExtracted: true,
                            rawResponse: result,
                            data: {
                                ...doc.data,
                                fileName: doc.file.name,
                                sheets: result.sheets || [],
                                extraction_method: result.extraction_method || 'OCR'
                            }
                        };
                    }
                    return doc;
                }));

                // Extraire les métadonnées d'entreprise de la première feuille
                const metadata = result.sheets[0]?.structured_data?.company_metadata || {};
                if (metadata && Object.keys(metadata).length > 0) {
                    setCompanyMetadata(prev => ({
                        ...prev,
                        [currentIndex]: metadata
                    }));
                    console.log('🏢 Métadonnées extraites:', metadata);
                }

                toast.success(`Extraction réussie ! ${result.sheets?.length || 0} feuille(s) détectée(s).`);
            } else {
                console.error('❌ Erreur serveur:', result);
                toast.error(result.error || "Erreur lors de l'extraction");
            }
        } catch (err) {
            console.error('❌ Erreur d\'extraction:', err);
            toast.error(`Échec de l'analyse : ${err.message || 'Vérifiez le fichier.'}`);
        } finally {
            setIsExtracting(false);
        }
    };

    // Extraction en lot
    const handleExtractAll = async () => {
        const docsToExtract = documents.filter(doc => !doc.isExtracted);

        if (docsToExtract.length === 0) {
            toast.success("Tous les documents sont déjà extraits.");
            return;
        }

        setIsBatchExtracting(true);
        let successCount = 0;
        let errors = [];

        try {
            // Extraction séquentielle (un par un) pour éviter la surcharge et les erreurs de concurrence
            for (const docToExtract of docsToExtract) {
                try {
                    const formData = new FormData();
                    formData.append('file', docToExtract.file);
                    formData.append('use_ocr', 'true');

                    const response = await fetchWithReauth('/excel/upload/', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setDocuments(prev => prev.map(doc => {
                            if (doc.id === docToExtract.id) {
                                return {
                                    ...doc,
                                    isExtracted: true,
                                    rawResponse: result,
                                    data: {
                                        ...doc.data,
                                        fileName: doc.file.name,
                                        sheets: result.sheets || [],
                                        extraction_method: result.extraction_method || 'OCR'
                                    }
                                };
                            }
                            return doc;
                        }));
                        successCount++;
                    } else {
                        console.error(`Erreur pour ${docToExtract.file.name}`, result);
                        errors.push(docToExtract.file.name);
                    }
                } catch (err) {
                    console.error(`Échec extraction pour ${docToExtract.file.name}`, err);
                    errors.push(docToExtract.file.name);
                }
            }

            if (errors.length > 0) {
                toast.error(`Échec pour ${errors.length} fichier(s): ${errors.join(', ')}`);
            } else {
                toast.success(`${successCount} documents extraits avec succès !`);
            }
        } catch (globalErr) {
            console.error(globalErr);
            toast.error("Erreur lors de l'extraction par lot.");
        } finally {
            setIsBatchExtracting(false);
        }
    };

    // 5. Validation
    // 5. Validation
    const handleValiderAll = async () => {
        if (!isLotValidatable) {
            return alert("Extraction OCR requise pour tous les documents.");
        }

        setIsSaving(true);
        let successCountTotal = 0;
        let bilansTotal = 0;
        let crTotal = 0;
        let journalsTotal = 0;
        const saveErrors = [];

        try {
            // Traiter chaque document séquentiellement
            for (let docIdx = 0; docIdx < documents.length; docIdx++) {
                const doc = documents[docIdx];
                const docSheetsData = [];

                // Préparer les données pour chaque feuille
                for (let sheetIdx = 0; sheetIdx < (doc.data.sheets || []).length; sheetIdx++) {
                    const sheet = doc.data.sheets[sheetIdx];
                    if (!sheet.structured_data) continue;

                    const docType = sheet.structured_data.type_document;
                    const years = sheet.structured_data.annees && sheet.structured_data.annees.length > 0
                        ? sheet.structured_data.annees
                        : [null];

                    // Pour chaque année détectée, créer une entrée de sauvegarde séparée
                    for (const year of years) {
                        const docSheetKey = year ? `${docIdx}-${sheetIdx}-${year}` : `${docIdx}-${sheetIdx}`;
                        const structuredData = editedData[docSheetKey] || sheet.structured_data;

                        let rows;
                        if (docType === 'JOURNAL') {
                            rows = structuredData.lignes.map((ligne, idx) => {
                                const debit = parseFloat(ligne.debit || 0);
                                const credit = parseFloat(ligne.credit || 0);
                                return {
                                    numero_compte: ligne.numero_compte,
                                    libelle: ligne.libelle || ligne.poste || '',
                                    date: ligne.date || new Date().toISOString().split('T')[0],
                                    numero_piece: ligne.numero_piece || '',
                                    type_journal: ligne.type_journal || 'OD',
                                    debit: debit,
                                    credit: credit,
                                    row_index: idx
                                };
                            });

                            const totalDebit = rows.reduce((sum, r) => sum + (r.debit || 0), 0);
                            const totalCredit = rows.reduce((sum, r) => sum + (r.credit || 0), 0);

                            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                                throw new Error(`Déséquilibre dans le journal "${sheet.sheet_name}" du fichier ${doc.file.name}`);
                            }
                        } else {
                            // Pour Bilan/CR, on prend uniquement la valeur de l'année concernée
                            rows = structuredData.lignes.map((ligne, idx) => {
                                const montant = (year && ligne.valeurs) ? (ligne.valeurs[year] || 0) : (Object.values(ligne.valeurs || {})[0] || 0);
                                return {
                                    numero_compte: ligne.numero_compte,
                                    libelle: ligne.poste,
                                    montant_ar: montant,
                                    date: year ? `${year}-12-31` : `${new Date().getFullYear()}-12-31`,
                                    row_index: idx,
                                    classe: ligne.classe,
                                    classe_libelle: ligne.classe_libelle,
                                    valeurs_annuelles: ligne.valeurs
                                };
                            });
                        }

                        docSheetsData.push({
                            sheet_name: sheet.sheet_name + (year ? ` (${year})` : ''),
                            detected_type: docType,
                            structured_data: structuredData,
                            company_metadata: companyMetadata[docIdx] || {},
                            rows: rows
                        });
                    }
                }

                if (docSheetsData.length === 0) continue;

                const formData = new FormData();
                if (doc.file) {
                    formData.append('file', doc.file);
                }
                formData.append('sheets', JSON.stringify(docSheetsData));
                formData.append('company_metadata', JSON.stringify(companyMetadata[docIdx] || {}));

                try {
                    const response = await fetchWithReauth('/excel/save/', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok) {
                        successCountTotal++;
                        bilansTotal += result.created_bilans || 0;
                        crTotal += result.created_compte_resultat || 0;
                        journalsTotal += result.created_journals || 0;
                    } else {
                        saveErrors.push(`${doc.file.name}: ${result.error || 'Erreur inconnue'}`);
                    }
                } catch (err) {
                    saveErrors.push(`${doc.file.name}: Erreur réseau`);
                }
            }

            // Clôture du processus
            if (successCountTotal > 0) {
                const parts = [];
                if (bilansTotal > 0) parts.push(`${bilansTotal} bilan(s)`);
                if (crTotal > 0) parts.push(`${crTotal} compte(s) de résultat`);
                if (journalsTotal > 0) parts.push(`${journalsTotal} écriture(s) journal`);

                const successMessage = `Importation réussie pour ${successCountTotal} fichier(s) ! ${parts.join(', ')} créé(s).`;
                toast.success(successMessage);

                setTimeout(() => {
                    handleClearAll();
                    setEditMode({});
                    setEditedData({});
                    setCompanyMetadata({});
                    if (onSaisieCompleted) onSaisieCompleted();
                }, 1000);
            }

            if (saveErrors.length > 0) {
                toast.error(`Erreurs critiques sur ${saveErrors.length} fichier(s) :\n${saveErrors.join('\n')}`);
            }

        } catch (error) {
            console.error("Erreur validation globale:", error);
            toast.error(error.message || "Erreur lors de la validation.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden pt-24 sm:pt-20">
            <style>{styles}</style>

            {/* OVERLAY DE CHARGEMENT */}
            {(isExtracting || isSaving || isBatchExtracting) && (
                <LoadingOverlay
                    message={isSaving ? "Validation et enregistrement en cours..." : (isBatchExtracting ? "Analyse par lot en cours..." : "Analyse en cours...")}
                />
            )}

            {documents.length > 0 && (
                <div className="lg:hidden flex gap-2 mb-2 flex-shrink-0">
                    <button
                        onClick={() => setShowFormOnMobile(false)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${!showFormOnMobile ? 'bg-gray-800 dark:bg-gray-700 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                        📄 Document
                    </button>
                    <button
                        onClick={() => setShowFormOnMobile(true)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${showFormOnMobile ? 'bg-gray-800 dark:bg-gray-700 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                        📝 Formulaire
                    </button>
                </div>
            )}

            <div className="flex-grow min-h-0 overflow-hidden lg:overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 max-w-7xl mx-auto h-full">
                    <div className={`${documents.length > 0 ? (showFormOnMobile ? 'hidden lg:flex' : 'flex') : 'flex'} lg:w-1/2 flex-col min-h-0`}>
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-t-lg text-white flex justify-between items-center shadow-md flex-shrink-0 relative overflow-hidden">
                            <h3 className="font-bold text-sm sm:text-base relative z-10">
                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2" />
                                Fichiers : {documents.length}
                            </h3>

                            {documents.length > 0 && (
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="text-xs sm:text-md font-bold text-gray-200">
                                        {currentIndex + 1} / {documents.length}
                                    </span>

                                    <button onClick={handlePrevious} disabled={currentIndex === 0}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 transition">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={handleNext} disabled={currentIndex === documents.length - 1}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 transition">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow min-h-0">
                            <ExcelDocumentViewer
                                file={currentFile}
                                onFileDrop={handleFileDrop}
                                onFileSelect={handleFileSelect}
                                onRemoveFile={handleRemoveCurrentDocument}
                                isDragActive={isDragActive}
                                isMultiple={true}
                            />
                        </div>
                    </div>

                    <div className={`${documents.length > 0 ? (showFormOnMobile ? 'flex' : 'hidden lg:flex') : 'hidden lg:flex'} lg:w-1/2 flex-col min-h-0`}>
                        <ExcelValidationForm
                            formData={currentFormData}
                            onValider={handleValiderAll}
                            isDocumentLoaded={!!currentFile}
                            isExtracted={currentIsExtracted}
                            onExtractText={handleExtractText}
                            documentsCount={documents.length}
                            isLotValidatable={isLotValidatable}
                            isLoading={isExtracting || isBatchExtracting}
                            isSaving={isSaving}
                            onExtractAll={handleExtractAll}
                            currentIndex={currentIndex}
                            editMode={editMode}
                            editedData={editedData}
                            setEditMode={setEditMode}
                            setEditedData={setEditedData}
                            companyMetadata={companyMetadata[currentIndex] || {}}
                            onMetadataChange={handleMetadataChange}
                            onDeleteRow={handleDeleteRow}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
