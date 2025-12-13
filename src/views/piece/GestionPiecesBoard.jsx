import React, { useState, useMemo } from 'react';
import { Trash2, X, FileText } from 'lucide-react';

// --- 0. COMPOSANT : Modale de Confirmation ---
const ConfirmationModal = ({ isOpen, document, onConfirm, onClose }) => {
    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-red-600 border-b pb-3 mb-4">
                    Confirmation de suppression
                </h3>
                
                <p className="text-gray-700 mb-4">
                    Êtes-vous sûr de vouloir supprimer la pièce **"{document.nom}"** ?
                </p>
                
                <p className="text-sm text-red-700 font-medium mb-6 p-2 bg-red-50 rounded">
                    ⚠️ Cette action entraînera la suppression de toutes les écritures comptables associées à ce fichier.
                </p>

                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => onConfirm(document.id)} 
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 font-semibold"
                    >
                        Confirmer la suppression
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 1. DONNÉES INITIALES ---
const PIECES_INITIALES = [
    { id: 1, type: 'Factures', nom: 'facture_achat_santatra.png', detail: 'Facture', date: '2025-11-29', ref: 'FAC-2024-124' },
    { id: 2, type: 'Factures', nom: 'FAC-2024-098889', detail: 'Facture', date: '2025-11-29', ref: 'FA-2024-1876' },
    { id: 3, type: 'Factures', nom: 'facture_achat_2.png', detail: 'Facture', date: '2025-08-22', ref: 'FAC-2024-142' },
    { id: 4, type: 'Factures', nom: 'facture_santatra_3.png', detail: 'Facture', date: '2025-11-29', ref: 'FAC-2024-142' },
    { id: 13, type: 'Factures', nom: 'facture_achat_santatra.png', detail: 'Facture', date: '2025-11-29', ref: 'FAC-2024-124' },
    { id: 5, type: 'Fiches de paie', nom: 'fiche_de_paie.png', detail: 'Fiche de paie', date: '2025-11-28', ref: 'FP-002' },
    { id: 6, type: 'Fiches de paie', nom: 'FP-001', detail: 'Fiche de paie', date: '2025-11-28', ref: 'FP-001' },
    { id: 14, type: 'Fiches de paie', nom: 'fiche_de_paie.png', detail: 'Fiche de paie', date: '2025-11-28', ref: 'FP-001' },
    { id: 7, type: 'Relevés bancaires', nom: 'releve_banque.png', detail: 'Relevé bancaire', date: '2025-06-11', ref: 'RB-001' },
    { id: 8, type: 'Relevés bancaires', nom: 'releve_bnl_1234', detail: 'Relevé bancaire', date: '2025-08-22', ref: 'BNI-1234' },
    { id: 15, type: 'Relevés bancaires', nom: 'releve_banque.jpeg', detail: 'Relevé bancaire', date: '2025-10-24', ref: 'BNI-0123' },
    { id: 16, type: 'Relevés bancaires', nom: 'releve_banque.jpeg', detail: 'Relevé bancaire', date: '2025-11-25', ref: 'BNI-12345' },
    { id: 17, type: 'Relevés bancaires', nom: 'releve_bnl_1234', detail: 'Relevé bancaire', date: '2025-11-25', ref: 'BNI-12345' },
    { id: 10, type: 'Autres', nom: 'fact.png', detail: 'Autre', date: '2025-10-16', ref: 'C-001' },
    { id: 11, type: 'Autres', nom: 'caisse_recu.png', detail: 'Autre', date: '2025-11-29', ref: 'REC-0225' },
    { id: 12, type: 'Autres', nom: 'justificatif_paiement.png', detail: 'Autre', date: '2025-07-18', ref: 'RB-0001' },
    { id: 18, type: 'Autres', nom: 'releve_bnl.png', detail: 'Autre', date: '2025-07-17', ref: 'BNI-123' },
    { id: 19, type: 'Autres', nom: 'caisse_recu.png', detail: 'Autre', date: '2025-11-29', ref: 'REC-0225' },
];

const CATEGORIES = [
    { key: 'Factures', label: 'Factures', color: 'border-blue-500', badge: 'bg-blue-500', bgCard: 'bg-white' }, 
    { key: 'Fiches de paie', label: 'Fiches de paie', color: 'border-green-500', badge: 'bg-green-500', bgCard: 'bg-green-50' },
    { key: 'Relevés bancaires', label: 'Relevés bancaires', color: 'border-purple-500', badge: 'bg-purple-500', bgCard: 'bg-purple-50' },
    { key: 'Autres', label: 'Autres', color: 'border-yellow-500', badge: 'bg-orange-500', bgCard: 'bg-orange-50' },
];

// --- 2. COMPOSANT : Carte de Document ---
const DocumentCard = ({ piece, onClick, onDelete, categoryConfig }) => {
    const borderColor = categoryConfig.color;
    const cardBgColor = categoryConfig.bgCard; 

    const handleDeleteClick = (e) => {
        e.stopPropagation(); 
        onDelete(piece); 
    };

    return (
        <div 
            className={`${cardBgColor} p-2.5 mb-2 rounded-lg shadow-sm border-l-4 hover:shadow-md cursor-pointer transition duration-150 ${borderColor} relative`} 
            onClick={() => onClick(piece)}
        >
            <div className="flex items-start space-x-2">
                <span className="text-sm pt-0.5 text-blue-600">
                    <FileText size={16} />
                </span>
                
                <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-900 truncate pr-6">{piece.nom}</p>
                    <p className="text-xs text-gray-500 -mt-0.5">{piece.detail}</p>
                </div>

                <button 
                    onClick={handleDeleteClick}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition duration-150 focus:outline-none"
                    aria-label={`Supprimer ${piece.nom}`}
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 truncate">Ref: {piece.ref}</p>
                <p className="text-xs text-gray-400 whitespace-nowrap ml-2">{piece.date}</p>
            </div>
        </div>
    );
};

// --- 3. COMPOSANT PRINCIPAL ---
export default function GestionPiecesBoard() {
    const [documents, setDocuments] = useState(PIECES_INITIALES);
    const [recherche, setRecherche] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [dateDebut, setDateDebut] = useState('2024-12-10'); 
    const [dateFin, setDateFin] = useState('2025-10-25'); 

    const handleDocumentClick = (piece) => {
        console.log(`Ouverture du document pour traitement : ${piece.nom}`);
    };

    const handleDocumentDelete = (document) => {
        setDocumentToDelete(document);
        setIsModalOpen(true);
    };
    
    const confirmDelete = (documentId) => {
        setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentId));
        console.log(`Document avec ID ${documentId} et écritures associées supprimés.`);
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setDocumentToDelete(null);
    };

    const groupedDocuments = useMemo(() => {
        const documentsFiltres = documents.filter(piece => 
            piece.nom.toLowerCase().includes(recherche.toLowerCase()) || 
            piece.ref.toLowerCase().includes(recherche.toLowerCase())
        );
        
        return documentsFiltres.reduce((acc, piece) => {
            const key = piece.type;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(piece);
            return acc;
        }, {});
    }, [documents, recherche]);

    return (
        <div className="pt-20 pb-6 h-screen bg-gray-50 overflow-hidden flex flex-col"> 
            
            <div className="px-6 space-y-4 flex-shrink-0">
                
                {/* 1. PÉRIODE D'EXERCICE - Style Dashboard */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="mb-3 sm:mb-0">
                        <p className="font-medium text-gray-700">Période d'exercice</p>
                        <p className="text-xs text-gray-500">Sélectionnez la période à analyser</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:space-x-4 items-center text-sm">
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-500 text-xs sm:text-sm">Du</label>
                            <input 
                                type="date" 
                                value={dateDebut} 
                                className="p-1 sm:p-2 border rounded-lg text-xs sm:text-sm" 
                                onChange={(e) => setDateDebut(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-500 text-xs sm:text-sm">Au</label>
                            <input 
                                type="date" 
                                value={dateFin} 
                                className="p-1 sm:p-2 border rounded-lg text-xs sm:text-sm" 
                                onChange={(e) => setDateFin(e.target.value)}
                            />
                        </div>
                        <button className="bg-gray-100 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-200">
                            11 déc. 2024 - 10 déc. 2025
                        </button>
                    </div>
                </div>

                {/* 2. BARRE DE RECHERCHE */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100"> 
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Numéro, nom du fichier" 
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            className="w-full p-2 border-0 focus:ring-0 text-sm placeholder-gray-400" 
                        />
                    </div>
                </div>
            </div>

            {/* 3. ZONE DE COLONNES (Workflow) */}
            <div className="flex-1 overflow-hidden px-6 pt-4"> 
                <div className="flex flex-col space-x-0 space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0 items-stretch h-full overflow-y-auto lg:overflow-x-auto pb-4"> 
                    {CATEGORIES.map((category) => {
                        const pieces = groupedDocuments[category.key] || [];
                        const piecesCount = pieces.length;
                        
                        return (
                            <div 
                                key={category.key} 
                                className="flex-shrink-0 w-full lg:flex-1 lg:min-w-[280px] bg-gray-50 rounded-xl shadow-lg p-4 flex flex-col h-auto lg:h-full border border-gray-200"
                            >
                                <div className={`flex items-center justify-between pb-3 mb-3 border-b border-gray-200 flex-shrink-0`}>
                                    <h3 className="text-base font-semibold text-gray-800">{category.label}</h3>
                                    <span className={`text-xs font-bold text-white px-3 py-0.5 rounded-full ${category.badge}`}>
                                        {piecesCount}
                                    </span>
                                </div>

                                <div className="flex-grow overflow-y-auto pr-1"> 
                                    {piecesCount > 0 ? (
                                        pieces.map(piece => (
                                            <DocumentCard 
                                                key={piece.id} 
                                                piece={piece} 
                                                onClick={handleDocumentClick}
                                                onDelete={handleDocumentDelete} 
                                                categoryConfig={category}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-8">
                                            Aucune pièce.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODALE */}
            <ConfirmationModal
                isOpen={isModalOpen}
                document={documentToDelete}
                onConfirm={confirmDelete}
                onClose={closeModal}
            />
        </div>
    );
}