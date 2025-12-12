import React, { useState, useCallback, useMemo, useEffect } from 'react';

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
const formatCurrency = (value) => {
    // Supprime tous les caractères non numériques et non point (pour décimal)
    const numberValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(numberValue)) return '';
    // Utilise le format de la locale pour la lisibilité
    return numberValue.toLocaleString('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

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
        let iconColor = "text-indigo-500";

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
            className={`bg-white border-2 border-dashed rounded-xl flex flex-col items-center p-3 sm:p-4 h-full cursor-pointer transition duration-300 relative
                ${isDragActive ? 'border-indigo-500 bg-indigo-50' : isLoaded ? 'border-gray-200 shadow-lg' : 'border-gray-300 hover:border-gray-400'}`
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
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 hover:text-red-600 transition duration-150 z-10"
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
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-base sm:text-lg font-bold text-gray-600">
                        Déposer ici
                    </p>
                    <p className="text-sm sm:text-md text-gray-500 mt-1 px-2">
                        ou <span className="text-indigo-600 font-bold hover:text-indigo-700">Ajouter</span> (Max {MAX_FILE_UPLOAD})
                    </p>
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
    formData, onFormChange, onValider, isDocumentLoaded, isExtracted, onExtractText, onCancelExtraction, documentsCount, isLotValidatable // AJOUT: isLotValidatable
}) => {
    // Calcul de la TVA et du Taux
    const totalTTC = parseFloat(String(formData.montant).replace(/[^0-9.]/g, '')) || 0;
    const totalHT = parseFloat(String(formData.totalHT).replace(/[^0-9.]/g, '')) || 0;
    const totalTVA = totalTTC - totalHT;
    const tauxTVA = totalHT > 0 ? ((totalTVA / totalHT) * 100).toFixed(2) : 0;
    const isFieldActive = isExtracted;

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-4 h-full flex flex-col min-h-0">
            
            {/* Boutons d'Action OCR */}
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-3 flex-shrink-0">
                <button 
                    type="button"
                    onClick={onExtractText}
                    disabled={!isDocumentLoaded || isExtracted}
                    className={`flex items-center justify-center space-x-2 py-2 sm:py-1.5 px-3 rounded-lg shadow-md text-xs sm:text-sm font-medium transition duration-150 w-full sm:w-auto
                        ${!isDocumentLoaded || isExtracted 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'}`
                    }
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 8-3-3m3 3l3-3m-3 3zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
                    <span>Extraire Texte (OCR)</span>
                </button>

                {isExtracted && (
                    <button 
                        type="button"
                        onClick={onCancelExtraction}
                        className="py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                    >
                        Annuler l'Extraction
                    </button>
                )}
            </div>
            
            {/* Nom du Fichier Source */}
            <div className="mb-3 flex-shrink-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Fichier Source</label>
                <input 
                    type="text" 
                    name="fileName"
                    value={formData.fileName}
                    disabled={true} 
                    className="block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm bg-gray-100 text-gray-600 cursor-default"
                    placeholder="Aucun fichier sélectionné"
                />
            </div>
            
            {/* Contenu du Formulaire : SCROLL INTERNE */}
            <div className="flex-grow min-h-0 overflow-y-auto pr-1 sm:pr-2"> 
                
                {isExtracted && (
                    <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-yellow-800 mb-3 sm:mb-4">
                        <p className="font-semibold">⚠️ Vérification OCR :</p>
                        <p className="mt-1">Veuillez vérifier les données extraites (champs jaunes).</p>
                    </div>
                )}
                
                <div className="mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Montant Total TTC</label>
                    <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-2 sm:px-3 text-gray-500 text-xs sm:text-sm">Ar</span>
                        <input 
                            type="text" 
                            name="montant"
                            value={formatCurrency(formData.montant)}
                            onChange={(e) => onFormChange(e.target.name, e.target.value)}
                            disabled={!isFieldActive}
                            className={`block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm 
                                ${isFieldActive ? 'bg-yellow-100' : 'bg-gray-50 cursor-not-allowed'}`}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="mb-3 p-2 sm:p-3 border border-gray-100 rounded-lg bg-gray-50">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Détails des Montants</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Total HT</label>
                            <input type="text" name="totalHT" value={formatCurrency(formData.totalHT)} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`w-full border-gray-300 rounded-md text-xs sm:text-sm ${isFieldActive ? 'bg-yellow-100' : 'bg-gray-50 cursor-not-allowed'}`} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">TVA</label>
                            <input type="text" value={formatCurrency(totalTVA)} readOnly className="w-full border-gray-300 bg-gray-200 rounded-md text-xs sm:text-sm cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Taux %</label>
                            <input type="text" value={tauxTVA} readOnly className="w-full border-gray-300 bg-gray-200 rounded-md text-xs sm:text-sm cursor-not-allowed" />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Client / Tiers</label>
                        <input type="text" name="client" value={formData.client} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? 'bg-yellow-100' : 'bg-gray-50 cursor-not-allowed'}`} />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Numéro Facture</label>
                        <input type="text" name="numeroFacture" value={formData.numeroFacture} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? 'bg-yellow-100' : 'bg-gray-50 cursor-not-allowed'}`} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
                        <input type="date" name="dateEmission" value={formData.dateEmission} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? '' : 'bg-gray-50 cursor-not-allowed'}`} />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                        <input type="date" name="dateEcheance" value={formData.dateEcheance} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? '' : 'bg-gray-50 cursor-not-allowed'}`} />
                    </div>
                    
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Compte Comptable</label>
                        <select name="ventilation" value={formData.ventilation} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? '' : 'bg-gray-50 cursor-not-allowed'}`}>
                            <option value="">Sélectionner...</option>
                            <option value="701">701 - Ventes de produits finis</option>
                            <option value="411">411 - Clients</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <input type="text" name="categorie" value={formData.categorie} onChange={(e) => onFormChange(e.target.name, e.target.value)} disabled={!isFieldActive} className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? '' : 'bg-gray-50 cursor-not-allowed'}`} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Commentaires</label>
                    <textarea 
                        name="commentaires"
                        value={formData.commentaires}
                        onChange={(e) => onFormChange(e.target.name, e.target.value)}
                        placeholder="Ajouter un commentaire..." 
                        rows="2" 
                        disabled={!isFieldActive}
                        className={`block w-full rounded-md border-gray-300 shadow-sm text-xs sm:text-sm ${isFieldActive ? '' : 'bg-gray-50 cursor-not-allowed'}`}
                    ></textarea>
                </div>
                
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Justificatif Paiement</span>
                        <button type="button" disabled={!isFieldActive} className={`text-xs sm:text-sm font-medium ${isFieldActive ? 'text-indigo-600 hover:text-indigo-700' : 'text-gray-400 cursor-not-allowed'}`}>+ Ajouter</button>
                    </div>
                    <p className="text-xs text-gray-500">Reçu de virement ou quittance (optionnel).</p>
                </div>
            </div>

            {/* Bouton de Validation */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end flex-shrink-0">
                <button 
                    type="submit"
                    onClick={onValider}
                    // MODIFIÉ: Utilise la validation du lot
                    disabled={!isLotValidatable} 
                    className={`w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white transition duration-150
                        ${isLotValidatable ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400 cursor-not-allowed'}`
                    }
                >
                    {documentsCount > 1 ? `Valider le Lot (${documentsCount})` : 'Importer et Valider'}
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

    // Données du document actuellement sélectionné
    const currentDocument = documents[currentIndex];
    const currentFile = currentDocument ? currentDocument.file : null;
    const currentFormData = currentDocument ? currentDocument.data : EMPTY_FORM_DATA;
    const currentIsExtracted = currentDocument ? currentDocument.isExtracted : false;

    // NOUVEAU: Vérifie si TOUS les documents sont extraits pour valider le lot
    const isLotValidatable = useMemo(() => {
        return documents.length > 0 && documents.every(doc => doc.isExtracted);
    }, [documents]);

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
             // Nettoie la valeur des séparateurs de milliers pour le stockage interne
             value = String(rawValue).replace(/[^\d.]/g, ''); 
        }
        updateCurrentDocument({
            data: { ...currentFormData, [name]: value }
        });
    }, [currentDocument, currentFormData, updateCurrentDocument]);
    
    // Simule l'extraction OCR
    const handleExtractText = useCallback(() => {
        if (!currentFile) return;
        updateCurrentDocument({
            data: { ...INITIAL_FORM_DATA, fileName: currentFile.name },
            isExtracted: true
        });
    }, [currentFile, updateCurrentDocument]);

    // Annule l'extraction (réinitialise le formulaire)
    const handleCancelExtraction = useCallback(() => {
        if (!currentFile) return;
        updateCurrentDocument({
            data: { ...EMPTY_FORM_DATA, fileName: currentFile.name },
            isExtracted: false
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
        
        // Se positionne sur le premier document si la liste était vide
        if (documents.length === 0 && newDocuments.length > 0) {
             setCurrentIndex(0);
        }
        
        if (Array.from(newFiles).length > filesToProcess.length) {
             alert(`Seuls ${filesToProcess.length} fichiers ajoutés, limite de ${MAX_FILE_UPLOAD} atteinte.`);
        }
    }, [documents.length, documents]);

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        processFiles(e.dataTransfer.files);
    };
    
    const handleFileSelect = (e) => {
        processFiles(e.target.files);
        e.target.value = null; 
    };

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

    const handleValiderAll = () => {
        // Double vérification, même si le bouton est déjà désactivé par isLotValidatable
        if (!isLotValidatable) {
            alert(`Attention : Veuillez extraire les données de TOUS les documents (${documents.filter(doc => !doc.isExtracted).length} restant) avant de valider le lot.`);
            return;
        }

        console.log('Lot validé !', documents.map(d => ({ fileName: d.data.fileName, data: d.data })));
        alert(`${documents.length} document(s) importés avec succès!`);
        handleClearAll();
    };

    return (
        <div className="fixed inset-0 p-2 sm:p-3 bg-gray-50 flex flex-col overflow-hidden">
            
            {/* Titre */}
            <div className="flex-shrink-0 mb-2 sm:mb-3">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 border-b pb-2 sm:pb-3">
                    📋 Importation Facture Client
                </h2>
            </div>

            {/* Toggle Mobile View */}
            {documents.length > 0 && (
                <div className="lg:hidden flex gap-2 mb-2 flex-shrink-0">
                    <button
                        onClick={() => setShowFormOnMobile(false)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${!showFormOnMobile ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        📄 Document
                    </button>
                    <button
                        onClick={() => setShowFormOnMobile(true)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${showFormOnMobile ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        📝 Formulaire
                    </button>
                </div>
            )}
             

            {/* Conteneur principal */}
            <div className="flex-grow min-h-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 max-w-7xl mx-auto h-full">

                    {/* BLOC GAUCHE : VISUALISATION */}
                    <div className={`${documents.length > 0 ? (showFormOnMobile ? 'hidden lg:flex' : 'flex') : 'flex'} lg:w-1/2 flex-col min-h-0`}>
                        {/* Navigation */}
                        <div className="bg-gray-800 p-2 sm:p-3 rounded-t-xl text-white flex justify-between items-center shadow-lg flex-shrink-0">
                            <h3 className="font-semibold text-xs sm:text-sm">
                                Fichiers : {documents.length}
                            </h3>
                            
                            {documents.length > 0 && (
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="text-xs sm:text-md font-bold">
                                        {currentIndex + 1} / {documents.length}
                                    </span>

                                    <button 
                                        onClick={handlePrevious} 
                                        disabled={currentIndex === 0}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-indigo-600 disabled:opacity-30 transition"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button 
                                        onClick={handleNext} 
                                        disabled={currentIndex === documents.length - 1}
                                        className="p-1 sm:p-1.5 rounded-full bg-gray-700 hover:bg-indigo-600 disabled:opacity-30 transition"
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
                            isLotValidatable={isLotValidatable} // PROPAGATION
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}