import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useExtractDataFromFileMutation, useSaveOneFileSourceMutation } from '../../../states/ocr/ocrApiSlice';


const determinePieceType = (data) => {
    if (!data) return 'Autres';
    const typeDoc = (data.type_document || '').toUpperCase();
    if (typeDoc === 'VENTE' || typeDoc === 'ACHAT' || data.numeroFacture) return 'facture';
    if (typeDoc === 'VIREMENT') return 'virement bancaire';
    if (typeDoc === 'RELEVES') return 'relevé bancaire';
    if (typeDoc === 'BON_DE_CAISSE' || typeDoc === 'FICHE_PAYE') return typeDoc.replace('_', ' ').toLowerCase();
    return 'Autres';
};
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

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
    }
    to {
        opacity: 0;
        transform: translate(-50%, -60px) scale(0.9);
    }
}

@keyframes shake {
    0%, 100% { transform: translate(-50%, 0) rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: translate(-50%, 0) rotate(-2deg); }
    20%, 40%, 60%, 80% { transform: translate(-50%, 0) rotate(2deg); }
}

.animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards, shake 0.5s ease-in-out 0.3s;
}

.animate-fadeOut {
    animation: fadeOut 0.3s ease-out forwards;
}
`;

// --- Constantes et Données MOCK ---
const INITIAL_FORM_DATA = {
    fileName: 'Facture_SARL_2024.pdf', montant: '5880000', totalHT: '4900000', client: 'Santatra client SARL',
    numeroFacture: 'FAC-2024-128', dateEmission: '2025-11-29', dateEcheance: '2025-12-29',
    ventilation: '701', categorie: 'Vente', commentaires: ''
};
const EMPTY_FORM_DATA = {
    fileName: '', montant: '', totalHT: '', client: '', numeroFacture: '',
    dateEmission: '', dateEcheance: '', ventilation: '', categorie: '', commentaires: ''
};
const ACCEPTED_FILE_TYPES = ".pdf,image/*,.xls,.xlsx,.csv";
const MAX_FILE_UPLOAD = 5;

// --- Utilitaires ---

const readExcelPreview = async (file) => {
    // Simulation de lecture basique pour les fichiers CSV uniquement
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n').slice(0, 20); // Limite aux 20 premières lignes
            resolve(lines);
        };
        reader.readAsText(file);
    });
};

// --- 1. Composant : DocumentViewer ---
const DocumentViewer = ({ file, onFileDrop, isDragActive, onFileSelect, onRemoveFile, isMultiple }) => {
    const isLoaded = !!file;
    const [excelPreview, setExcelPreview] = useState(null);

    // Crée une URL pour l'objet fichier pour l'affichage
    const fileUrl = useMemo(() => {
        if (file instanceof File || file instanceof Blob) { return URL.createObjectURL(file); }
        return null;
    }, [file]);

    // Nettoie l'URL à la destruction du composant ou au changement de fichier
    useEffect(() => {
        return () => { if (fileUrl) { URL.revokeObjectURL(fileUrl); } };
    }, [fileUrl]);

    // Génère l'aperçu CSV
    useEffect(() => {
        if (file && file.name.match(/\.csv$/i)) {
            readExcelPreview(file).then(lines => setExcelPreview(lines));
        } else {
            setExcelPreview(null);
        }
    }, [file]);

    const renderDocumentContent = () => {
        if (file && file.type.startsWith('image/') && fileUrl) {
            return <img src={fileUrl} alt="Aperçu du document" className="w-full h-auto object-contain rounded-lg shadow-md" />;
        }

        if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && fileUrl) {
            return (
                <embed
                    src={`${fileUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-full rounded-lg shadow-md"
                    style={{ minHeight: '100%' }}
                />
            );
        }

        if (file && file.name.match(/\.csv$/i) && excelPreview) {
            return (
                <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-4 text-left">
                    <div className="flex items-center mb-3">
                        {/* Icône Excel/CSV */}
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M8,11H16V13H8V11M8,15H16V17H8V15Z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-sm sm:text-base text-gray-800">Aperçu CSV</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{file.name}</p>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded overflow-auto max-h-64 sm:max-h-96">
                        <pre className="text-xs p-2 sm:p-3 whitespace-pre-wrap font-mono text-gray-700 bg-gray-50">
                            {excelPreview.join('\n')}
                        </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">Affichage des 20 premières lignes</p>
                </div>
            );
        }

        if (file && file.name.match(/\.(xlsx?|xls)$/i)) {
            return (
                <div className="mt-4 sm:mt-8 text-gray-500 flex flex-col items-center max-w-md mx-auto px-4">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M8,11H16V13H8V11M8,15H16V17H8V15Z" />
                    </svg>
                    <p className="mt-3 font-semibold text-base sm:text-lg text-gray-700">Fichier Excel</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center break-all">{file.name}</p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 text-center">
                            💡 L'aperçu Excel natif n'est pas disponible
                        </p>
                        <p className="text-xs text-blue-600 mt-1 text-center">
                            Le fichier sera traité lors de l'extraction OCR
                        </p>
                    </div>
                </div>
            );
        }

        // Fichier générique
        let iconPath = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
        let iconColor = "text-gray-400";

        return (
            <div className="mt-4 sm:mt-8 text-gray-500 flex flex-col items-center px-4">
                <svg className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                </svg>
                <p className="mt-3 font-semibold text-sm sm:text-base text-gray-700">Fichier document chargé</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all text-center">{file.name}</p>
            </div>
        );
    };

    return (
        <label
            htmlFor="file-upload-input"
            className={`relative overflow-hidden border-2 border-dashed rounded-lg flex flex-col items-center p-3 sm:p-4 h-full cursor-pointer transition-all duration-300
                ${isDragActive
                    ? 'border-gray-500 bg-gray-50 scale-[1.01] shadow-xl'
                    : isLoaded
                        ? 'border-gray-300 bg-white shadow-md hover:shadow-lg'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:shadow-md'
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
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white shadow text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200 z-10"
                    aria-label="Supprimer le fichier"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {isLoaded ? (
                <div className="text-center w-full h-full flex flex-col min-h-0">
                    <p className="text-base sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 truncate max-w-[85%] sm:max-w-[90%] flex-shrink-0">
                        {file.name}
                    </p>

                    <div className="w-full flex-grow min-h-0 overflow-y-auto flex justify-center p-1 sm:p-2">
                        <div className="flex items-start justify-center w-full">
                            {renderDocumentContent()}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center flex flex-col items-center justify-center flex-grow">
                    <div className="mb-4">
                        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                        Glissez vos fichiers ici
                    </p>
                    <p className="text-sm sm:text-md text-gray-500 mt-1 px-2">
                        ou <span className="text-gray-700 font-bold hover:underline">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Maximum {MAX_FILE_UPLOAD} fichiers</p>
                </div>
            )}
            <input
                id="file-upload-input"
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

// --- 2. Composant : OcrValidationForm ---
const OcrValidationForm = ({
    formData, onFormChange, onValider, isDocumentLoaded, isExtracted, onExtractText, onCancelExtraction, documentsCount, isLotValidatable, isLoading, errorNotification, onCloseError, currentDocument
}) => {
    // Calcul de la TVA et du Taux
    const totalTTC = parseFloat(String(formData.montant || '0').replace(/[^0-9.]/g, '')) || 0;
    const totalHT = parseFloat(String(formData.totalHT || '0').replace(/[^0-9.]/g, '')) || 0;
    const totalTVA = totalTTC - totalHT;

    return (
        <div className="relative bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-3 h-full flex flex-col min-h-0 overflow-hidden text-sm">
            {/* Top border instead of gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200" />

            {/* Boutons d'Action OCR */}
            <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-gray-100 pb-2 flex-shrink-0">
                <button
                    type="button"
                    onClick={onExtractText}
                    disabled={!isDocumentLoaded || isExtracted || isLoading}
                    className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded text-xs font-medium transition duration-150 w-full sm:w-auto
                        ${!isDocumentLoaded || isExtracted || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'}`
                    }
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Extraction...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 8-3-3m3 3l3-3m-3 3zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                            <span>Extraire (OCR)</span>
                        </>
                    )}
                </button>

                {isExtracted && (
                    <button
                        type="button"
                        onClick={onCancelExtraction}
                        className="py-1.5 px-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                    >
                        Annuler
                    </button>
                )}
            </div>

            {/* Nom du Fichier Source */}
            <div className="mb-2 flex-shrink-0">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Fichier Source</label>
                <input
                    type="text"
                    name="fileName"
                    value={formData.fileName}
                    disabled={true}
                    className="block w-full rounded border-gray-300 shadow-sm text-xs bg-gray-50 text-gray-600 cursor-default py-1"
                    placeholder="Aucun fichier sélectionné"
                />
            </div>

            {/* Contenu du Formulaire : SCROLL INTERNE */}
            <div className="flex-grow min-h-0 overflow-y-auto pr-1">

                {isExtracted ? (
                    <div className="relative bg-amber-50 border-l-2 border-amber-400 p-2 rounded-sm text-xs text-amber-900 mb-2">
                        <p className="font-bold flex items-center">⚠️ Vérification OCR</p>
                    </div>
                ) : (
                    isDocumentLoaded && (
                        <div className="relative bg-blue-50 border-l-2 border-blue-400 p-2 rounded-sm text-xs text-blue-900 mb-2">
                            <h4 className="font-bold mb-0.5 mb-1">{isLoading ? 'Extraction en cours...' : 'En attente d\'extraction'}</h4>
                            <p className="leading-tight">
                                {isLoading ? 'Veuillez patienter pendant l\'analyse de votre document.' : 'Cliquez sur "Extraire (OCR)" pour remplir le formulaire.'}
                            </p>
                        </div>
                    )
                )}




                {isExtracted && (
                    <>
                        {/* HEADER DU DOCUMENT */}
                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-0.5">Type de Document</label>
                                <input
                                    type="text"
                                    name="typeDocument"
                                    value={formData.typeDocument || ''}
                                    onChange={(e) => onFormChange('typeDocument', e.target.value)}
                                    className="block w-full rounded border-indigo-200 shadow-sm text-xs py-1 text-indigo-700 font-bold uppercase bg-indigo-50 placeholder-indigo-300"
                                    placeholder="NON DÉTECTÉ"
                                />
                            </div>
                        </div>

                        {/* FORMULAIRE DYNAMIQUE BASÉ SUR LE JSON EXTRAIT */}
                        {formData.extractedJson && (
                            <div className="space-y-3">
                                {Object.entries(formData.extractedJson).map(([key, value]) => {
                                    // Ignorer le type de document car déjà affiché en haut
                                    if (key === 'type_document' || key === 'typeDocument') return null;

                                    // Ignorer les champs qui étaient null/undefined dès l'extraction initiale
                                    // MAIS garder les champs que l'utilisateur a vidés manuellement
                                    const initialValue = currentDocument?.rawResponse?.extracted_json?.[key];
                                    if (initialValue === null || initialValue === undefined) {
                                        // Si le champ n'existait pas dans l'extraction initiale, ne pas l'afficher
                                        if (value === null || value === '' || value === undefined) return null;
                                    }

                                    // Cas tableau : affichage tableau (ex: produits)
                                    if (Array.isArray(value)) {
                                        if (value.length === 0) return null;
                                        return (
                                            <div key={key} className="mb-2">
                                                <h5 className="font-bold text-xs text-gray-800 mb-1 capitalize border-b border-gray-100 pb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </h5>
                                                <div className="border border-gray-200 rounded overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {Object.keys(value[0] || {}).map((header) => (
                                                                    <th key={header} className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                                                        {header.replace(/_/g, ' ')}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {value.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    {Object.values(item).map((val, vIdx) => (
                                                                        <td key={vIdx} className="px-2 py-1 text-[10px] text-gray-900 whitespace-nowrap">
                                                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Cas objet (nested) : Affichage en sous-formulaire formatté
                                    if (typeof value === 'object') {
                                        return (
                                            <div key={key} className="mb-3 mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                                                <h6 className="text-[10px] font-bold text-gray-700 uppercase mb-2 border-b border-gray-200 pb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </h6>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {Object.entries(value).map(([subKey, subValue]) => (
                                                        <div key={subKey}>
                                                            <label className="block text-[10px] text-gray-500 mb-0.5 capitalize font-medium">
                                                                {subKey.replace(/_/g, ' ')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={String(formData.extractedJson?.[key]?.[subKey] || subValue)}
                                                                onChange={(e) => {
                                                                    const newExtractedJson = { ...formData.extractedJson };
                                                                    if (!newExtractedJson[key]) newExtractedJson[key] = {};
                                                                    newExtractedJson[key][subKey] = e.target.value;
                                                                    onFormChange('extractedJson', newExtractedJson);
                                                                }}
                                                                className="block w-full rounded border-gray-300 shadow-sm text-xs py-1 text-left bg-white"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Cas standard : champ texte
                                    let isDate = key.toLowerCase().includes('date');
                                    const displayValue = isDate && typeof value === 'string' ? value.slice(0, 10) : value;

                                    return (
                                        <div key={key} className="mb-2">
                                            <label className="block text-[10px] uppercase text-gray-500 mb-0.5 font-bold">
                                                {key.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                                type={isDate ? "date" : "text"}
                                                value={formData.extractedJson?.[key] !== undefined ? (isDate && typeof formData.extractedJson[key] === 'string' ? formData.extractedJson[key].slice(0, 10) : formData.extractedJson[key]) : displayValue}
                                                onChange={(e) => {
                                                    const newExtractedJson = { ...formData.extractedJson, [key]: e.target.value };
                                                    onFormChange('extractedJson', newExtractedJson);
                                                }}
                                                className={`block w-full rounded border-gray-300 shadow-sm text-xs py-1 text-left`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bouton de Validation */}
            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end flex-shrink-0">
                <button
                    type="submit"
                    onClick={onValider}
                    disabled={!isLotValidatable}
                    className={`w-full sm:w-auto py-1.5 px-4 border border-transparent rounded shadow-sm text-xs font-medium text-white transition duration-150
                        ${isLotValidatable ? 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-800' : 'bg-gray-300 cursor-not-allowed'}`
                    }
                >
                    {documentsCount > 1 ? `Valider Lot (${documentsCount})` : 'Valider'}
                </button>
            </div>
        </div>
    );
};

// --- 3. Composant Principal (ImportFichier) ---
export default function ImportFichier() {
    const [documents, setDocuments] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragActive, setIsDragActive] = useState(false);
    const [showFormOnMobile, setShowFormOnMobile] = useState(false);
    const [errorNotification, setErrorNotification] = useState(null);
    const [notification, setNotification] = useState(null); // { type: 'success'|'warning'|'error', message: '' }

    // API Hooks
    const [extractData, { isLoading: isExtracting }] = useExtractDataFromFileMutation();
    const [saveFile, { isLoading: isSaving }] = useSaveOneFileSourceMutation();

    // Fonction pour afficher une notification d'erreur animée
    const showErrorNotification = useCallback((message) => {
        setErrorNotification(message);
        // Ne disparaît pas automatiquement, l'utilisateur doit cliquer
    }, []);

    // Données du document actuellement sélectionné
    const currentDocument = documents[currentIndex];
    const currentFile = currentDocument ? currentDocument.file : null;
    const currentFormData = currentDocument ? currentDocument.data : EMPTY_FORM_DATA;
    const currentIsExtracted = currentDocument ? currentDocument.isExtracted : false;

    // Vérifie si TOUS les documents sont extraits pour valider le lot
    const isLotValidatable = useMemo(() => {
        return documents.length > 0 && documents.every(doc => doc.isExtracted) && !isSaving;
    }, [documents, isSaving]);

    const updateCurrentDocument = useCallback((updates) => {
        setDocuments(prevDocuments => {
            if (prevDocuments.length === 0) return prevDocuments;
            const newDocuments = [...prevDocuments];
            if (newDocuments[currentIndex]) {
                newDocuments[currentIndex] = {
                    ...newDocuments[currentIndex],
                    ...updates,
                    data: updates.data !== undefined ? updates.data : newDocuments[currentIndex].data
                };
            }
            return newDocuments;
        });
    }, [currentIndex]);

    const handleClearAll = useCallback(() => {
        setDocuments([]);
        setCurrentIndex(0);
        setShowFormOnMobile(false);
    }, []);

    const handleFormChange = useCallback((name, rawValue) => {
        if (!currentDocument) return;
        let value = rawValue;
        if (name === 'montant' || name === 'totalHT') {
            value = String(rawValue).replace(/[^\d.]/g, '');
        }
        updateCurrentDocument({
            data: { ...currentFormData, [name]: value }
        });
    }, [currentDocument, currentFormData, updateCurrentDocument]);

    const handleRemoveCurrentDocument = useCallback(() => {
        if (!currentDocument) return;
        const updatedDocuments = documents.filter((_, index) => index !== currentIndex);
        setDocuments(updatedDocuments);

        if (updatedDocuments.length === 0) {
            setCurrentIndex(0);
            setShowFormOnMobile(false);
        } else if (currentIndex >= updatedDocuments.length) {
            setCurrentIndex(updatedDocuments.length - 1);
        }
    }, [documents, currentIndex, currentDocument]);

    // ✅ Fonction utilitaire pour extraire et formater les dates de manière sûre
    const extractDate = useCallback((dateValue) => {
        if (!dateValue) return '';

        // Si c'est déjà une chaîne au format YYYY-MM-DD ou avec timestamp
        if (typeof dateValue === 'string') {
            // Extraire seulement la partie date (ignorer l'heure si présente)
            const match = dateValue.match(/(\d{4}-\d{2}-\d{2})/);
            if (match) return match[1];

            // Essayer de parser comme date si format différent
            try {
                const parsed = new Date(dateValue);
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().slice(0, 10);
                }
            } catch (e) {
                console.warn('Impossible de parser la date:', dateValue);
            }
        }

        // Si c'est un timestamp ou un objet Date
        if (typeof dateValue === 'number' || dateValue instanceof Date) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().slice(0, 10);
                }
            } catch (e) {
                console.error('Erreur conversion date:', e);
            }
        }

        return '';
    }, []);

    // Extraction OCR via API (DRF) - AVEC GESTION D'ERREUR
    const handleExtractText = useCallback(async () => {
        if (!currentFile) return;

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await extractData(formData).unwrap();
            console.log("OCR Response:", response);

            // ✅ Vérifier si le document est non reconnu
            if (response.error && response.error.includes("Document non reconnu")) {
                throw new Error("Document non reconnu");
            }

            // Extraction du sous-objet JSON s'il existe
            const extractedJson = response.extracted_json || response;

            // Mapping intelligent des données extraites
            const mappedData = {
                ...EMPTY_FORM_DATA,
                fileName: currentFile.name,
                typeDocument: response.type_document || extractedJson.type_document || '',
                extractedJson: extractedJson,

                montant: extractedJson.montant_total_facture_ttc || extractedJson.montant_ttc || extractedJson.amount_total || '',
                // Calcul du HT si manquant : TTC - TVA
                totalHT: (() => {
                    let ht = extractedJson.montant_ht || extractedJson.total_ht;
                    if (ht) return ht;

                    // Essayer de trouver la TVA
                    const tva = extractedJson.montant_tva || extractedJson.tax_amount || extractedJson.vat_amount || extractedJson.tva || extractedJson.montant_taxe;
                    const ttc = extractedJson.montant_total_facture_ttc || extractedJson.montant_ttc || extractedJson.amount_total;

                    if (ttc && tva) {
                        const ttcVal = parseFloat(String(ttc).replace(/[^0-9.]/g, ''));
                        const tvaVal = parseFloat(String(tva).replace(/[^0-9.]/g, ''));
                        if (!isNaN(ttcVal) && !isNaN(tvaVal)) {
                            return (ttcVal - tvaVal).toFixed(2); // Calcul HT = TTC - TVA
                        }
                    }
                    return '';
                })(),
                client: extractedJson.nom_client || extractedJson.client || extractedJson.supplier || '',
                adresse_client: extractedJson.adresse_client || '',
                telephone_client: extractedJson.telephone_client || '',
                telephone_commercial: extractedJson.telephone_commercial || '',
                numeroFacture: extractedJson.numero_facture || extractedJson.invoice_number || '',
                produits: extractedJson.description_produits || [],
                garantie: extractedJson.garantie || '',
                sav: extractedJson.sav || '',
                dateEmission: extractDate(extractedJson.date_facture || extractedJson.date_emission || extractedJson.date),
                dateEcheance: extractDate(extractedJson.date_echeance || extractedJson.due_date),
                fileId: response.id || response.file_id || null,
                ventilation: '',
                categorie: ''
            };

            updateCurrentDocument({
                data: mappedData,
                isExtracted: true,
                rawResponse: response
            });

        } catch (error) {
            console.error("Erreur Extraction:", error);

            // Réinitialiser le formulaire en cas d'erreur
            updateCurrentDocument({
                data: { ...EMPTY_FORM_DATA, fileName: currentFile.name },
                isExtracted: false,
                rawResponse: null
            });

            // ✅ Vérifier si l'erreur contient le message "Document non reconnu"
            const errorMessage = error.data?.error || error.data?.detail || error.message || 'Erreur inconnue';

            if (errorMessage.includes("Document non reconnu")) {
                showErrorNotification("Document non reconnu comme pièce comptable. Veuillez vérifier que le fichier est bien une facture, un devis ou un document comptable valide.");
                // Supprimer le fichier de la liste car invalide
                handleRemoveCurrentDocument();
            } else {
                showErrorNotification(`Erreur lors de l'extraction: ${errorMessage}`);
            }
        }
    }, [currentFile, extractData, updateCurrentDocument, showErrorNotification, handleRemoveCurrentDocument]);

    // Annule l'extraction (réinitialise le formulaire)
    const handleCancelExtraction = useCallback(() => {
        if (!currentFile) return;
        updateCurrentDocument({
            data: { ...EMPTY_FORM_DATA, fileName: currentFile.name },
            isExtracted: false,
            rawResponse: null
        });
    }, [currentFile, updateCurrentDocument]);

    const processFiles = useCallback((newFiles) => {
        if (!newFiles || newFiles.length === 0) return;
        const spaceAvailable = MAX_FILE_UPLOAD - documents.length;
        const filesToProcess = Array.from(newFiles).slice(0, spaceAvailable);

        if (filesToProcess.length === 0 && documents.length > 0) {
            alert(`Limite atteinte. Maximum ${MAX_FILE_UPLOAD} documents autorisés.`);
            return;
        }

        const newDocuments = filesToProcess.map(file => ({
            file: file,
            data: { ...EMPTY_FORM_DATA, fileName: file.name },
            isExtracted: false
        }));

        setDocuments(prev => [...prev, ...newDocuments]);

        if (documents.length === 0 && newDocuments.length > 0) {
            setCurrentIndex(0);
        }

        if (Array.from(newFiles).length > filesToProcess.length) {
            alert(`Seuls ${filesToProcess.length} fichiers ajoutés, limite de ${MAX_FILE_UPLOAD} atteinte.`);
        }
    }, [documents.length]);

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        processFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e) => {
        processFiles(e.target.files);
        e.target.value = null;
    };



    const handleNext = () => {
        if (currentIndex < documents.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Validation du Lot via API (DRF)
    const handleValiderAll = async () => {
        if (!isLotValidatable) return alert("Extraction OCR requise pour tous les documents.");

        try {
            const results = await Promise.all(documents.map(doc => {
                if (!doc.data.extractedJson) throw new Error("OCR manquant pour un document");

                // Préparer FormData pour l'upload du fichier avec les données extraites
                const formData = new FormData();
                formData.append('file', doc.file);
                formData.append('extracted_json', JSON.stringify(doc.data.extractedJson));
                if (doc.data.ref_file) {
                    formData.append('ref_file', doc.data.ref_file);
                }

                // Envoi au backend via /api/files/
                return saveFile(formData).unwrap();
            }));

            // Analyser les résultats
            const duplicates = results.filter(r => r.duplicate === true);
            const successes = results.filter(r => r.duplicate !== true);

            if (duplicates.length > 0) {
                const msg = `Ce document a déjà été importé dans le système.Veuillez vérifier la liste des fichiers existants ou importer un autre document!!!`;

                // Afficher comme une ERREUR (Rouge) comme demandé
                showErrorNotification(msg);

                // Si on a aussi des succès, on peut le notifier discrètement ou laisser l'erreur prévaloir
                if (successes.length > 0) {
                    console.log(`${successes.length} autres documents importés avec succès.`);
                }
            } else {
                alert(`${results.length} document(s) importés avec succès !`);
            }

            handleClearAll();
        } catch (error) {
            console.error("Erreur validation:", error);
            showErrorNotification(error.message || "Erreur inconnue lors de la validation.");
        }
    };

    return (
        <div className="fixed inset-0 p-2 sm:p-3 bg-gray-50 flex flex-col overflow-hidden pt-24 sm:pt-20">
            {/* Injection des styles CSS */}
            <style>{styles}</style>

            {/* Notification d'ERREUR Globale (Visible partout, même sur mobile) */}
            {errorNotification && (
                <div className="fixed top-40 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md
                    bg-red-500 text-white p-4 rounded-lg shadow-2xl border border-red-600
                    animate-fadeIn flex items-start gap-3">

                    <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>

                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">Erreur</p>
                        <p className="text-sm leading-snug whitespace-pre-line">
                            {errorNotification}
                        </p>
                    </div>

                    <button
                        onClick={() => setErrorNotification(null)}
                        className="text-white hover:bg-white/20 rounded-full p-1 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Notification Toast Moderne */}
            {notification && (
                <div
                    className={`fixed top-40 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-out animate-[slideIn_0.3s_ease-out]
                        ${notification.type === 'success' ? 'bg-white border-l-4 border-green-500' :
                            notification.type === 'warning' ? 'bg-white border-l-4 border-yellow-500' :
                                'bg-white border-l-4 border-red-500'}`}
                >
                    <div className="p-4 flex items-start">
                        <div className="flex-shrink-0">
                            {notification.type === 'success' && <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {notification.type === 'warning' && <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                            {notification.type === 'error' && <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">
                                {notification.type === 'success' ? 'Succès' :
                                    notification.type === 'warning' ? 'Attention' : 'Erreur'}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">{notification.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => setNotification(null)}
                            >
                                <span className="sr-only">Fermer</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Titre */}


            {/* Toggle Mobile View */}
            {documents.length > 0 && (
                <div className="lg:hidden flex gap-2 mb-2 flex-shrink-0">
                    <button
                        onClick={() => setShowFormOnMobile(false)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${!showFormOnMobile ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        📄 Document
                    </button>
                    <button
                        onClick={() => setShowFormOnMobile(true)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${showFormOnMobile ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        📝 Formulaire
                    </button>
                </div>
            )}

            {/* Conteneur principal */}
            <div className="flex-grow min-h-0 overflow-hidden lg:overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 max-w-7xl mx-auto h-full">

                    {/* BLOC GAUCHE : VISUALISATION */}
                    <div className={`${documents.length > 0 ? (showFormOnMobile ? 'hidden lg:flex' : 'flex') : 'flex'} lg:w-1/2 flex-col min-h-0`}>
                        {/* Navigation */}
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

                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 transition"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === documents.length - 1}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 transition"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DocumentViewer */}
                        <div className="flex-grow min-h-0">
                            <DocumentViewer
                                file={currentFile}
                                onFileDrop={handleFileDrop}
                                onFileSelect={handleFileSelect}
                                onRemoveFile={handleRemoveCurrentDocument}
                                isDragActive={isDragActive}
                                isMultiple={true}
                            />
                        </div>
                    </div>

                    {/* BLOC DROIT : FORMULAIRE */}
                    <div className={`${documents.length > 0 ? (showFormOnMobile ? 'flex' : 'hidden lg:flex') : 'hidden lg:flex'} lg:w-1/2 flex-col min-h-0`}>
                        <OcrValidationForm
                            formData={currentFormData}
                            onFormChange={handleFormChange}
                            onValider={handleValiderAll}
                            isDocumentLoaded={!!currentFile}
                            isExtracted={currentIsExtracted}
                            onExtractText={handleExtractText}
                            onCancelExtraction={handleCancelExtraction}
                            documentsCount={documents.length}
                            isLotValidatable={isLotValidatable}
                            isLoading={isExtracting}
                            errorNotification={errorNotification}
                            onCloseError={() => setErrorNotification(null)}
                            currentDocument={currentDocument}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}