import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { formatDateToISO } from '../../../utils/dateUtils';

import { useExtractDataFromFileMutation, useSaveOneFileSourceMutation } from '../../../states/ocr/ocrApiSlice';

// Composant Overlay de Chargement
const LoadingOverlay = ({ message }) => (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[10000] flex flex-col items-center justify-center animate-simpleFadeIn p-4">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
            {/* Spinner style iOS/moderne */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 animate-pulse px-4">{message}</p>
        </div>
    </div>
);

const determinePieceType = (data) => {
    if (!data) return 'Autres';
    const typeDoc = (data.type_document || '').toUpperCase();
    if (typeDoc === 'VENTE' || typeDoc === 'ACHAT') return typeDoc;
    if (data.numeroFacture) return 'facture';
    if (typeDoc === 'BANQUE') return 'BANQUE';
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

@keyframes simpleFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.animate-simpleFadeIn {
    animation: simpleFadeIn 0.3s ease-out forwards;
}

.animate-fadeOut {
    animation: fadeOut 0.3s ease-out forwards;
}
`;

// --- Constantes et Données MOCK ---

const EMPTY_FORM_DATA = {
    fileName: '', montant: '', totalHT: '', client: '', numeroFacture: '',
    dateEmission: '', dateEcheance: '', ventilation: '', categorie: '', commentaires: ''
};
const ACCEPTED_FILE_TYPES = ".pdf,image/*,.xls,.xlsx,.csv";
const MAX_FILE_UPLOAD = 50;

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
                <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 text-left border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        {/* Icône Excel/CSV */}
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M8,11H16V13H8V11M8,15H16V17H8V15Z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Aperçu CSV</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{file.name}</p>
                        </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded overflow-auto max-h-64 sm:max-h-96">
                        <pre className="text-xs p-2 sm:p-3 whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                            {excelPreview.join('\n')}
                        </pre>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Affichage des 20 premières lignes</p>
                </div>
            );
        }

        if (file && file.name.match(/\.(xlsx?|xls)$/i)) {
            return (
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
            );
        }

        // Fichier générique
        let iconPath = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
        let iconColor = "text-gray-400 dark:text-gray-500";

        return (
            <div className="mt-4 sm:mt-8 text-gray-500 dark:text-gray-400 flex flex-col items-center px-4">
                <svg className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                </svg>
                <p className="mt-3 font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">Fichier document chargé</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all text-center">{file.name}</p>
            </div>
        );
    };

    return (
        <label
            htmlFor="file-upload-input"
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
                            {renderDocumentContent()}
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
                        Glissez vos fichiers ici
                    </p>
                    <p className="text-sm sm:text-md text-gray-500 dark:text-gray-400 mt-1 px-2">
                        ou <span className="text-gray-700 dark:text-gray-300 font-bold hover:underline">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Maximum {MAX_FILE_UPLOAD} fichiers</p>
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
    formData, onFormChange, onValider, isDocumentLoaded, isExtracted, onExtractText, onCancelExtraction, documentsCount, isLotValidatable, isLoading, errorNotification, onCloseError, currentDocument, isSaving, onExtractAll
}) => {



    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 sm:p-3 h-full flex flex-col min-h-0 overflow-hidden text-sm">
            {/* Top border instead of gradient */}
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
                                <span>Extraction des informations en cours...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 8-3-3m3 3l3-3m-3 3zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                                <span>Extraire les informations</span>
                            </>
                        )}
                    </button>
                </div>

                {isExtracted && (
                    <button
                        type="button"
                        onClick={onCancelExtraction}
                        className="py-1.5 px-2 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
                    >
                        Annuler
                    </button>
                )}
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
                        <p className="font-bold flex items-center">⚠️ Veuillez vérifier les informations extraites par l’OCR. En cas d’erreur, vous pouvez modifier les champs manuellement </p>
                    </div>
                ) : (
                    isDocumentLoaded && (
                        <div className="relative bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400 dark:border-blue-600 p-2 rounded-sm text-xs text-blue-900 dark:text-blue-200 mb-2">
                            <h4 className="font-bold mb-0.5 mb-1">{isLoading ? 'Extraction en cours...' : 'En attente d\'extraction'}</h4>
                            <p className="leading-tight">
                                {isLoading ? 'Veuillez patienter pendant l\'analyse de votre document.' : 'Cliquez sur "Extraire les informations" pour remplir le formulaire.'}
                            </p>
                        </div>
                    )
                )}

                {isExtracted && (
                    <>
                        {/* HEADER DU DOCUMENT */}
                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">Type de Document</label>
                                <input
                                    type="text"
                                    name="typeDocument"
                                    value={formData.typeDocument || ''}
                                    onChange={(e) => onFormChange('typeDocument', e.target.value)}
                                    className="block w-full rounded border-indigo-200 dark:border-gray-600 shadow-sm text-xs py-1 text-indigo-700 dark:text-indigo-300 font-bold uppercase bg-indigo-50 dark:bg-indigo-900/20 placeholder-indigo-300"
                                    placeholder="NON DÉTECTÉ"
                                />
                            </div>
                        </div>

                        {/* FORMULAIRE DYNAMIQUE BASÉ SUR LE JSON EXTRAIT */}
                        {formData.extractedJson && (
                            <div className="space-y-3">
                                {Object.entries(formData.extractedJson).map(([key, value]) => {
                                    // 1. Ignorer le type de document car déjà affiché en haut
                                    if (key === 'type_document' || key === 'typeDocument') return null;

                                    // 2. Ignorer 'objet_description' (demande utilisateur)
                                    if (key === 'objet_description' || key.toLowerCase() === 'objet description') return null;

                                    // 3. Ignorer les valeurs nulles, undefined (mais garder les chaînes vides pour permettre l'édition)
                                    // On garde aussi les 0 pour permettre la correction manuelle
                                    if (value === null || value === undefined) return null;

                                    // 4. Eviter doublon Reference si identique au Numéro Facture
                                    if (key === 'reference') {
                                        const numFacture = formData.extractedJson.numero_facture || formData.extractedJson.invoice_number;
                                        if (numFacture && String(numFacture).trim() === String(value).trim()) {
                                            return null;
                                        }
                                    }

                                    // 5. Eviter doublon Identifiant si identique à Reference
                                    if (key === 'identifiant') {
                                        const reference = formData.extractedJson.reference;
                                        if (reference && String(reference).trim() === String(value).trim()) {
                                            return null;
                                        }
                                    }

                                    // Ignorer les champs qui étaient null/undefined dès l'extraction initiale (code existant, conservé pour sécurité)
                                    const initialValue = currentDocument?.rawResponse?.extracted_json?.[key];
                                    if (initialValue === null || initialValue === undefined) {
                                        if (value === null || value === undefined) return null;
                                    }

                                    // ✅ CAS TABLEAU : Affichage différencié selon le type de contenu
                                    if (Array.isArray(value)) {
                                        if (value.length === 0) return null;

                                        // ✅ CAS SPÉCIAL : Si c'est "description" ET qu'on a des arrays de quantite/prix
                                        // VÉRIFICATION : Les arrays doivent avoir la MÊME LONGUEUR pour être fusionnés
                                        if (key === 'description' &&
                                            Array.isArray(formData.extractedJson?.quantite) &&
                                            Array.isArray(formData.extractedJson?.prix_unitaire) &&
                                            formData.extractedJson.quantite.length === value.length &&
                                            formData.extractedJson.prix_unitaire.length === value.length) {

                                            const descriptions = formData.extractedJson.description || [];
                                            const quantites = formData.extractedJson.quantite || [];
                                            const prixUnitaires = formData.extractedJson.prix_unitaire || [];
                                            const devise = formData.extractedJson.devise || 'Ar';

                                            // Calculer montant = quantite * prix_unitaire
                                            const items = descriptions.map((desc, idx) => ({
                                                description: desc,
                                                quantite: quantites[idx] || '-',
                                                prix_unitaire: prixUnitaires[idx] || 0,
                                                montant: (quantites[idx] || 0) * (prixUnitaires[idx] || 0)
                                            }));

                                            return (
                                                <div key={key} className="mb-3">
                                                    <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200 mb-2 capitalize border-b border-gray-100 dark:border-gray-700 pb-1">
                                                        Articles / Produits
                                                    </h5>
                                                    <div className="border border-gray-200 dark:border-gray-700 rounded overflow-x-auto bg-white dark:bg-gray-800 shadow-sm">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                        Description
                                                                    </th>
                                                                    <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                        Quantité
                                                                    </th>
                                                                    <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                        Prix Unitaire
                                                                    </th>
                                                                    <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                        Montant
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                                {items.map((item, idx) => (
                                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                                        <td className="px-3 py-2 text-gray-900 dark:text-gray-200 font-medium">
                                                                            {item.description}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                                                                            {item.quantite}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                                                                            {item.prix_unitaire.toLocaleString()} {devise}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                                            {item.montant.toLocaleString()} {devise}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            {/* Total supprimé - déjà affiché dans montant_ht */}
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // ✅ Si c'est quantite ou prix_unitaire mais PAS array de même longueur, on les affiche normalement
                                        // Sinon on les ignore (déjà fusionnés dans le tableau)
                                        if ((key === 'quantite' || key === 'prix_unitaire') &&
                                            Array.isArray(formData.extractedJson?.description) &&
                                            Array.isArray(formData.extractedJson?.[key]) &&
                                            formData.extractedJson[key].length === formData.extractedJson.description.length) {
                                            return null; // Déjà affiché dans le tableau fusionné
                                        }

                                        return (
                                            <div key={key} className="mb-2">
                                                <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200 mb-1 capitalize border-b border-gray-100 dark:border-gray-700 pb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </h5>

                                                {/* ✅ VÉRIFICATION : Array de strings ou d'objets ? */}
                                                {typeof value[0] === 'string' ? (
                                                    // CAS 1 : Array de strings - Liste à puces
                                                    <div className="border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 p-3">
                                                        <ul className="list-disc list-inside space-y-1.5">
                                                            {value.map((item, idx) => (
                                                                <li key={idx} className="text-xs text-gray-900 dark:text-gray-300 leading-relaxed">
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    // CAS 2 : Array d'objets - Tableau HTML
                                                    <div className="border border-gray-200 dark:border-gray-700 rounded overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                                <tr>
                                                                    {Object.keys(value[0] || {}).map((header) => (
                                                                        <th key={header} className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                            {header.replace(/_/g, ' ')}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                {value.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        {Object.values(item).map((val, vIdx) => (
                                                                            <td key={vIdx} className="px-2 py-1 text-[10px] text-gray-900 dark:text-gray-200 whitespace-nowrap">
                                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Cas objet (nested) : Affichage en sous-formulaire formatté
                                    if (typeof value === 'object' && value !== null) {
                                        return (
                                            <div key={key} className="mb-3 mt-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                                                <h6 className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </h6>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {Object.entries(value).map(([subKey, subValue]) => (
                                                        <div key={subKey}>
                                                            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 capitalize font-medium">
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
                                                                className="block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm text-xs py-1 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Cas standard : champ texte
                                    let isDate = key.toLowerCase().includes('date');

                                    // Pour les dates, s'assurer que la valeur est au format YYYY-MM-DD
                                    let inputValue = formData.extractedJson?.[key] !== undefined ? formData.extractedJson[key] : value;

                                    if (isDate && inputValue) {
                                        // Extraire seulement la partie date (YYYY-MM-DD) si c'est un datetime
                                        if (typeof inputValue === 'string' && inputValue.length > 10) {
                                            inputValue = inputValue.slice(0, 10);
                                        }
                                        // Vérifier que c'est un format valide YYYY-MM-DD
                                        if (!/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
                                            inputValue = ''; // Si format invalide, vider le champ
                                        }
                                    }

                                    return (
                                        <div key={key} className="mb-2">
                                            <label className="block text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-0.5 font-bold">
                                                {key.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                                type={isDate ? "date" : "text"}
                                                value={inputValue || ''}
                                                onChange={(e) => {
                                                    const newExtractedJson = { ...formData.extractedJson, [key]: e.target.value };
                                                    onFormChange('extractedJson', newExtractedJson);
                                                }}
                                                className={`block w-full rounded border-gray-300 dark:border-gray-600 shadow-sm text-xs py-1 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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

// --- 3. Composant Principal (ImportFichier) ---
export default function ImportFichier({ onSaisieCompleted }) {
    const [documents, setDocuments] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragActive, setIsDragActive] = useState(false);
    const [showFormOnMobile, setShowFormOnMobile] = useState(false);
    const [errorNotification, setErrorNotification] = useState(null);
    const [notification, setNotification] = useState(null);

    // API Hooks
    const [extractData, { isLoading: isExtracting }] = useExtractDataFromFileMutation();
    const [saveFile] = useSaveOneFileSourceMutation();


    // Etat pour le chargement global de la validation (batch)
    const [isSaving, setIsSaving] = useState(false);
    const [isBatchExtracting, setIsBatchExtracting] = useState(false);

    // Fonction pour afficher une notification d'erreur
    const showErrorNotification = useCallback((message) => {
        toast.error(message);
    }, []);

    // --- Logique Métier ---

    // 1. Gestion des Fichiers
    const addFiles = useCallback((newFiles) => {
        const validFiles = [...newFiles]; // Accepte tout pour l'instant, le filtrage est fait par l'input accept

        if (documents.length + validFiles.length > MAX_FILE_UPLOAD) {
            showErrorNotification(`Maximum ${MAX_FILE_UPLOAD} fichiers autorisés.`);
            return;
        }

        const newDocs = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            data: { ...EMPTY_FORM_DATA, fileName: file.name, typeDocument: 'NON DÉTECTÉ' },
            isExtracted: false
        }));

        setDocuments(prev => [...prev, ...newDocs]);
        // Si c'est le premier fichier, on le sélectionne
        if (documents.length === 0 && newDocs.length > 0) {
            setCurrentIndex(0);
        }
    }, [documents, showErrorNotification]);

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

        // Ajuster l'index
        if (newDocs.length === 0) {
            setCurrentIndex(0);
        } else if (currentIndex >= newDocs.length) {
            setCurrentIndex(newDocs.length - 1);
        }
    }, [documents, currentIndex]);

    const handleClearAll = useCallback(() => {
        setDocuments([]);
        setCurrentIndex(0);
        setNotification(null);
    }, []);

    // 2. Navigation
    const handlePrevious = () => setCurrentIndex(prev => Math.max(0, prev - 1));
    const handleNext = () => setCurrentIndex(prev => Math.min(documents.length - 1, prev + 1));

    // 3. Variables Dérivées du Document Courant
    const currentDocument = documents[currentIndex];
    const currentFile = currentDocument?.file || null;
    const currentIsExtracted = currentDocument?.isExtracted || false;

    // Fusion des données : priorité au form data local, sinon vide
    const currentFormData = currentDocument?.data || EMPTY_FORM_DATA;

    const isLotValidatable = useMemo(() => {
        return documents.length > 0 && documents.every(doc => doc.isExtracted);
    }, [documents]);


    // 4. Gestion du Formulaire
    const handleFormChange = useCallback((field, value) => {
        if (!currentDocument) return;

        setDocuments(prev => prev.map((doc, idx) => {
            if (idx === currentIndex) {
                return {
                    ...doc,
                    data: { ...doc.data, [field]: value }
                };
            }
            return doc;
        }));
    }, [currentDocument, currentIndex]);


    // 5. Extraction OCR
    const handleExtractText = async () => {
        if (!currentFile) return;

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const result = await extractData(formData).unwrap();

            // Mise à jour du document avec les résultats
            setDocuments(prev => prev.map((doc, idx) => {
                if (idx === currentIndex) {
                    // Mapping intelligent des résultats vers notre structure de formulaire
                    const extracted = result.extracted_json || {};
                    const typeDoc = determinePieceType(extracted);

                    // Normalize all date fields to YYYY-MM-DD format
                    const normalizedExtracted = { ...extracted };
                    Object.keys(normalizedExtracted).forEach(key => {
                        if (key.toLowerCase().includes('date') && normalizedExtracted[key]) {
                            const normalizedDate = formatDateToISO(normalizedExtracted[key]);
                            if (normalizedDate) {
                                normalizedExtracted[key] = normalizedDate;
                            }
                        }
                    });

                    return {
                        ...doc,
                        isExtracted: true,
                        rawResponse: result,
                        data: {
                            ...doc.data,
                            extractedJson: normalizedExtracted,
                            typeDocument: typeDoc,
                            montant: normalizedExtracted.montant_ttc || normalizedExtracted.total_amount || doc.data.montant,
                            totalHT: normalizedExtracted.montant_ht || normalizedExtracted.net_amount || doc.data.totalHT,
                            numeroFacture: normalizedExtracted.numero_facture || normalizedExtracted.invoice_number || doc.data.numeroFacture,
                            dateEmission: normalizedExtracted.date || normalizedExtracted.date_emission || doc.data.dateEmission,
                            // Simplification: on stocke tout le JSON extrait pour l'affichage dynamique
                        }
                    };
                }
                return doc;
            }));

        } catch (err) {
            console.error(err);
            showErrorNotification("Echec de l'extraction OCR verifiez le fichier.");
        }
    };

    const handleCancelExtraction = useCallback(() => {
        if (!currentDocument) return;

        setDocuments(prev => prev.map((doc, idx) => {
            if (idx === currentIndex) {
                return {
                    ...doc,
                    isExtracted: false,
                    // On garde le nom du fichier mais on reset le reste
                    data: { ...EMPTY_FORM_DATA, fileName: doc.file.name }
                };
            }
            return doc;
        }));
    }, [currentDocument, currentIndex]);

    // Extraction en lot (Batch)
    const handleExtractAll = async () => {
        // Filtrer les documents qui ne sont pas encore extraits
        const docsToExtract = documents.filter(doc => !doc.isExtracted);

        if (docsToExtract.length === 0) {
            toast.success("Tous les documents sont déjà extraits.");
            return;
        }

        setIsBatchExtracting(true);
        let successCount = 0;
        let errors = [];

        try {
            await Promise.all(docsToExtract.map(async (docToExtract) => {
                try {
                    const formData = new FormData();
                    formData.append('file', docToExtract.file);

                    const result = await extractData(formData).unwrap();

                    // Mettre à jour le document spécifique dans l'état
                    setDocuments(prev => prev.map(doc => {
                        if (doc.id === docToExtract.id) {
                            const extracted = result.extracted_json || {};
                            const typeDoc = determinePieceType(extracted);
                            return {
                                ...doc,
                                isExtracted: true,
                                rawResponse: result,
                                data: {
                                    ...doc.data,
                                    extractedJson: extracted,
                                    typeDocument: typeDoc,
                                    montant: extracted.montant_ttc || extracted.total_amount || doc.data.montant,
                                    totalHT: extracted.montant_ht || extracted.net_amount || doc.data.totalHT,
                                    numeroFacture: extracted.numero_facture || extracted.invoice_number || doc.data.numeroFacture,
                                    dateEmission: extracted.date || extracted.date_emission || doc.data.dateEmission,
                                }
                            };
                        }
                        return doc;
                    }));
                    successCount++;
                } catch (err) {
                    console.error(`Echec extraction pour ${docToExtract.file.name}`, err);
                    errors.push(docToExtract.file.name);
                }
            }));

            if (errors.length > 0) {
                showErrorNotification(`Echec pour ${errors.length} fichier(s): ${errors.join(', ')}`);
            } else {
                toast.success(`${successCount} documents extraits avec succès !`);
            }

        } catch (globalErr) {
            console.error(globalErr);
            showErrorNotification("Erreur lors de l'extraction par lot.");
        } finally {
            setIsBatchExtracting(false);
        }
    };

    // Validation du Lot via API (DRF)
    const handleValiderAll = async () => {
        if (!isLotValidatable) return alert("Extraction OCR requise pour tous les documents.");

        setIsSaving(true);
        try {
            const results = await Promise.all(documents.map(doc => {
                if (!doc.data.extractedJson) throw new Error("OCR manquant pour un document");

                const formData = new FormData();
                formData.append('file', doc.file);
                formData.append('extracted_json', JSON.stringify(doc.data.extractedJson));
                if (doc.data.ref_file) {
                    formData.append('ref_file', doc.data.ref_file);
                }

                return saveFile(formData).unwrap();
            }));

            const duplicates = results.filter(r => r.duplicate === true);
            const successes = results.filter(r => r.duplicate !== true);

            if (duplicates.length > 0) {
                const msg = `Ce document a déjà été importé dans le système. Veuillez vérifier la liste des fichiers existants.`;
                toast.error(msg);

                if (successes.length > 0) {
                    toast.success("Enregistrement succès");
                    setTimeout(() => {
                        if (onSaisieCompleted) onSaisieCompleted();
                    }, 1500);
                }
            } else {
                toast.success("Enregistrement succès");

                setTimeout(() => {
                    handleClearAll();
                    if (onSaisieCompleted) onSaisieCompleted();
                }, 1000);
            }

        } catch (error) {
            console.error("Erreur validation:", error);
            showErrorNotification(error.message || "Erreur inconnue lors de la validation.");
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
                    message={isSaving ? "Validation et enregistrement en cours..." : (isBatchExtracting ? "Extraction par lot en cours..." : "Extraction des données (OCR) en cours...")}
                />
            )}

            {errorNotification && (
                <div className="fixed top-40 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md
                    bg-red-500 text-white p-4 rounded-lg shadow-2xl border border-red-600
                    animate-fadeIn flex items-start gap-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">Erreur</p>
                        <p className="text-sm leading-snug whitespace-pre-line">{errorNotification}</p>
                    </div>
                </div>
            )}

            {notification && (
                <div className={`fixed top-40 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-out animate-[slideIn_0.3s_ease-out]
                    ${notification.type === 'success' ? 'bg-white dark:bg-gray-800 border-l-4 border-green-500' :
                        notification.type === 'warning' ? 'bg-white dark:bg-gray-800 border-l-4 border-yellow-500' :
                            'bg-white dark:bg-gray-800 border-l-4 border-red-500'}`}>
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
                    </div>
                </div>
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
                            isLoading={isExtracting || isBatchExtracting}
                            errorNotification={errorNotification}
                            onCloseError={() => setErrorNotification(null)}
                            currentDocument={currentDocument}
                            isSaving={isSaving}
                            onExtractAll={handleExtractAll}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}