// Fichier : GestionPiecesBoard.jsx

import React, { useState, useMemo } from 'react';

// --- 1. DONNÉES ET CONFIGURATION (Inchangées) ---
const PIECES_INITIALES = [
    { id: 1, type: 'Factures', nom: 'facture_achat_santatra.png', detail: 'Facture Achat', date: '2025-11-29', ref: 'FAC-2024-124' },
    { id: 2, type: 'Factures', nom: 'FAC-2024-098889', detail: 'Facture Vente', date: '2025-11-29', ref: 'FA-2024-1876' },
    { id: 3, type: 'Factures', nom: 'facture_achat_2.png', detail: 'Facture Achat', date: '2025-08-22', ref: 'FAC-2024-142' },
    { id: 4, type: 'Factures', nom: 'facture_santatra_3.png', detail: 'Facture Vente', date: '2025-11-29', ref: 'FA-2024-1876' },
    { id: 5, type: 'Fiches de paie', nom: 'fiche_de_paie.png', detail: 'Fiche de paie', date: '2025-11-28', ref: 'FP-002' },
    { id: 6, type: 'Fiches de paie', nom: 'FP-001', detail: 'Fiche de paie', date: '2025-11-28', ref: 'FP-001' },
    { id: 7, type: 'Relevés bancaires', nom: 'releve_banque.png', detail: 'Relevé bancaire', date: '2025-06-11', ref: 'RB-001' },
    { id: 8, type: 'Relevés bancaires', nom: 'releve_bnl_1234', detail: 'Relevé bancaire', date: '2025-08-22', ref: 'BNI-1234' },
    { id: 9, type: 'Relevés bancaires', nom: 'releve_banque.jpeg', detail: 'Relevé bancaire', date: '2025-11-25', ref: 'BNI-12345' },
    { id: 10, type: 'Autres', nom: 'fact.png', detail: 'Autre', date: '2025-10-16', ref: 'C-001' },
    { id: 11, type: 'Autres', nom: 'caisse_recu.png', detail: 'Ticket de caisse', date: '2025-11-29', ref: 'REC-0225' },
    { id: 12, type: 'Autres', nom: 'justificatif_paiement.png', detail: 'Justificatif', date: '2025-07-18', ref: 'RB-0001' },
];

const CATEGORIES = [
    { key: 'Factures', label: 'Factures', color: 'border-blue-500', badge: 'bg-blue-500' },
    { key: 'Fiches de paie', label: 'Fiches de paie', color: 'border-green-500', badge: 'bg-green-500' },
    { key: 'Relevés bancaires', label: 'Relevés bancaires', color: 'border-purple-500', badge: 'bg-purple-500' },
    { key: 'Autres', label: 'Autres', color: 'border-yellow-500', badge: 'bg-yellow-500' },
];

// --- 2. SOUS-COMPOSANT : Carte de Pièce (Inchangé) ---
const getIconForType = (type) => {
    switch (type) {
        case 'Factures': return '🧾';
        case 'Fiches de paie': return '💵';
        case 'Relevés bancaires': return '🏦';
        case 'Autres': return '📎';
        default: return '📄';
    }
};

const DocumentCard = ({ piece, onClick, borderColor }) => (
    <div 
        className={`bg-white p-2.5 mb-2 rounded-lg shadow border-l-4 hover:shadow-lg cursor-pointer transition duration-150 ${borderColor}`} 
        onClick={() => onClick(piece)}
    >
        <div className="flex items-start space-x-2">
            <span className="text-sm pt-0.5 text-gray-500">{getIconForType(piece.type)}</span>
            
            <div className="flex-grow">
                <p className="text-sm font-semibold text-gray-900 truncate">{piece.nom}</p>
                <p className="text-xs text-gray-600 -mt-0.5">{piece.detail}</p>
            </div>
        </div>
        
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
            <p className="text-xs font-medium text-indigo-600">Ref: {piece.ref}</p>
            <p className="text-xs text-gray-400">{piece.date}</p>
        </div>
    </div>
);


// --- 3. COMPOSANT PRINCIPAL : GestionPiecesBoard ---
export default function GestionPiecesBoard() {
    const [documents] = useState(PIECES_INITIALES);
    const [recherche, setRecherche] = useState('');
    
    // États pour la période 
    const [dateDebut, setDateDebut] = useState('2024-12-10'); 
    const [dateFin, setDateFin] = useState('2025-12-10'); 
    const [periodeLabel] = useState('11 déc. 2024 - 10 déc. 2025'); 

    const handleDocumentClick = (piece) => {
        console.log(`Ouverture du document pour traitement : ${piece.nom}`);
    };

    // Logique de filtrage et groupement (Inchangée)
    const groupedDocuments = useMemo(() => {
        const documentsFiltres = documents.filter(piece => 
            piece.nom.toLowerCase().includes(recherche.toLowerCase()) || 
            piece.ref.toLowerCase().includes(recherche.toLowerCase())
        );

        const documentsParDate = documentsFiltres.filter(piece => {
            const pieceDate = new Date(piece.date);
            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);
            fin.setDate(fin.getDate() + 1); 

            return pieceDate >= debut && pieceDate < fin;
        });

        return documentsParDate.reduce((acc, piece) => {
            const key = piece.type;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(piece);
            return acc;
        }, {});
    }, [documents, recherche, dateDebut, dateFin]);


    // --- Rendu avec Tailwind CSS ---
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            
            {/* CARTE 1 : Période d'exercice (REMIS EN PLACE avec les états) */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-3"> 
                
                <div className="flex justify-between items-start text-sm">
                    
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-900 whitespace-nowrap"> 
                            Période d'exercice
                        </span>
                        <span className="p-0 border-0 bg-white text-gray-500 focus:ring-0 focus:border-0 text-sm mt-0.5 cursor-pointer">
                            Sélectionnez la période à analyser
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-600 text-sm">Du</span>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={dateDebut}
                                    onChange={(e) => setDateDebut(e.target.value)}
                                    className="pl-2 pr-8 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 w-[120px]"
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">🗓️</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-600 text-sm">Au</span>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={dateFin}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    className="pl-2 pr-8 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 w-[120px]"
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">🗓️</span>
                            </div>
                        </div>

                        <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg whitespace-nowrap border border-gray-200">
                            {periodeLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* CARTE 2 : Recherche de Fichier (Inchangée) */}
            <div className="bg-white p-2 rounded-xl shadow-lg mb-6"> 
                <input 
                    type="text" 
                    placeholder="Numéro, nom du fichier" 
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="w-full p-2 border-0 focus:ring-0 text-sm" 
                />
            </div>

            {/* ZONE DE COLONNES (Workflow) */}
            {/* CHANGEMENT CLÉ : Remplacement de "overflow-x-auto" par "flex-wrap". */}
            <div className="flex space-x-6 pb-4 items-stretch h-[calc(100vh-250px)] flex-wrap"> 
                {CATEGORIES.map((category) => {
                    const pieces = groupedDocuments[category.key] || [];
                    const piecesCount = pieces.length;
                    
                    return (
                        <div 
                            key={category.key} 
                            // Changements de classes ici : Suppression de 'min-w-[300px]' 
                            // Utilisation de w-full pour les petits écrans, w-[calc(50%-12px)] pour tablettes (2 colonnes) 
                            // et w-[calc(25%-18px)] pour les grands écrans (4 colonnes) afin d'éviter le débordement.
                            className="flex-shrink-0 w-full mb-6 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white rounded-xl shadow-xl p-4 flex flex-col h-full"
                        >
                            
                            {/* En-tête de la Colonne */}
                            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${category.color} flex-shrink-0`}>
                                <h3 className="text-lg font-bold text-gray-800">{category.label}</h3>
                                <span className={`text-sm font-bold text-white px-3 py-1 rounded-full ${category.badge}`}>
                                    {piecesCount}
                                </span>
                            </div>

                            {/* Corps de la Colonne : Défilement Vertical Conservé (overflow-y-auto) */}
                            <div className="flex-grow overflow-y-auto pr-1"> 
                                {piecesCount > 0 ? (
                                    pieces.map(piece => (
                                        <DocumentCard 
                                            key={piece.id} 
                                            piece={piece} 
                                            onClick={handleDocumentClick}
                                            borderColor={category.color}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">
                                        Aucune pièce ne correspond aux filtres.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}