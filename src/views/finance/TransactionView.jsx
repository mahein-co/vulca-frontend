import React, { useState, useMemo } from 'react';

// --- Données Fictives Communes ---

// Données pour la vue VENTES (Produits - Comptes 7xx)
const salesData = {
    title: 'Gestion Vente (Produits - Comptes 7xx)',
    transactions: [
        { ref: 'FC2025-045', date: '01/12/2025', tier: 'SARL Alpha', montantHT: '12 000 000', montantTTC: '14 400 000', statut: 'Payée', statutClass: 'bg-green-100 text-green-800' },
        { ref: 'FC2025-046', date: '05/12/2025', tier: 'Cabinet Delta', montantHT: '8 500 000', montantTTC: '10 200 000', statut: 'En retard', statutClass: 'bg-red-100 text-red-800' },
        { ref: 'FC2025-047', date: '10/12/2025', tier: 'SA Beta', montantHT: '4 300 000', montantTTC: '5 160 000', statut: 'En attente', statutClass: 'bg-yellow-100 text-yellow-800' },
        { ref: 'AVOIR-01', date: '12/12/2025', tier: 'SARL Alpha', montantHT: '-1 200 000', montantTTC: '-1 440 000', statut: 'Validé', statutClass: 'bg-indigo-100 text-indigo-800' },
        // AJOUT DE DONNÉES FICTIVES POUR LA PAGINATION
        ...Array.from({ length: 16 }, (_, i) => ({ 
            ref: `FC2025-${50 + i}`, 
            date: `15/12/2025`, 
            tier: `Client Test ${i+1}`, 
            montantHT: '1 000 000', 
            montantTTC: '1 200 000', 
            statut: (i % 3 === 0 ? 'Payée' : 'En attente'), 
            statutClass: (i % 3 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
        })),
    ],
    summary: { totalHT: '30 800 000 Ar', totalTVA: '6 160 000 Ar', totalTTC: '36 960 000 Ar' },
};

// Données pour la vue ACHATS (Charges - Comptes 6xx)
const purchaseData = {
    title: 'Gestion Achat (Charges - Comptes 6xx)',
    transactions: [
        { ref: 'FF2025-021', date: '05/12/2025', tier: 'Fournisseur A', montantHT: '3 500 000', montantTTC: '4 200 000', statut: 'En attente', statutClass: 'bg-yellow-100 text-yellow-800' },
        { ref: 'FF2025-022', date: '08/12/2025', tier: 'Grossiste Z', montantHT: '10 200 000', montantTTC: '12 240 000', statut: 'Payée', statutClass: 'bg-green-100 text-green-800' },
        { ref: 'FF2025-023', date: '11/12/2025', tier: 'Prestataire Info', montantHT: '1 500 000', montantTTC: '1 800 000', statut: 'Régularisation', statutClass: 'bg-blue-100 text-blue-800' },
        { ref: 'AVR-04', date: '14/12/2025', tier: 'Fournisseur B', montantHT: '-500 000', montantTTC: '-600 000', statut: 'Validé', statutClass: 'bg-indigo-100 text-indigo-800' },
         // AJOUT DE DONNÉES FICTIVES POUR LA PAGINATION
        ...Array.from({ length: 6 }, (_, i) => ({ 
            ref: `FF2025-${30 + i}`, 
            date: `16/12/2025`, 
            tier: `Fournisseur XYZ ${i+1}`, 
            montantHT: '500 000', 
            montantTTC: '600 000', 
            statut: (i % 2 === 0 ? 'Payée' : 'En retard'), 
            statutClass: (i % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
        })),
    ],
    summary: { totalHT: '14 700 000 Ar', totalTVA: '2 940 000 Ar', totalTTC: '17 640 000 Ar' },
};

const formatAmount = (amount) => `${amount} Ar`;

// --- Composant TransactionCard pour basculer ---
const TransactionCard = ({ label, active, onClick, icon }) => (
    <div
        onClick={onClick}
        className={`flex-1 p-4 rounded-lg shadow-md cursor-pointer transition duration-200 text-center border-b-4 
            ${active 
                ? 'bg-white border-indigo-600 shadow-lg' 
                : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
            }`}
    >
        <span className="text-2xl">{icon}</span>
        <p className={`text-sm font-semibold mt-1 ${active ? 'text-indigo-800' : 'text-gray-600'}`}>
            {label}
        </p>
    </div>
);


// --- Composant Principal TransactionView ---
const TransactionView = ({ onNewSaisieClick }) => {
    // État principal pour basculer entre 'sales' et 'purchase'
    const [viewType, setViewType] = useState('sales'); 
    const activeData = viewType === 'sales' ? salesData : purchaseData;
    
    // 1. GESTION DE LA RECHERCHE MANUELLE
    const [tempSearchTerm, setTempSearchTerm] = useState(''); // Valeur dans l'input
    const [activeSearchTerm, setActiveSearchTerm] = useState(''); // Valeur après clic sur Rechercher
    
    // 2. GESTION DE LA PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Fonctions de Manipulation ---
    
    const handleSearchClick = () => {
        // Déclenche la recherche et met à jour les transactions affichées
        setActiveSearchTerm(tempSearchTerm);
        setCurrentPage(1); // Retour à la première page après une nouvelle recherche
    };
    
    const handleViewTypeChange = (newViewType) => {
        setViewType(newViewType);
        // Réinitialiser les états de recherche et pagination lors du changement de vue
        setActiveSearchTerm(''); 
        setTempSearchTerm('');
        setCurrentPage(1);
    };

    // Filtrage et pagination des transactions (optimisé avec useMemo)
    const { currentTransactions, totalItems, totalPages, startIndex, endIndex } = useMemo(() => {
        let transactions = activeData.transactions;

        // Filtrage
        if (activeSearchTerm) {
            const lowerCaseSearch = activeSearchTerm.toLowerCase();
            transactions = transactions.filter(tx => 
                tx.ref.toLowerCase().includes(lowerCaseSearch) || 
                tx.tier.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        const total = transactions.length;
        const pages = Math.ceil(total / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const current = transactions.slice(start, end);
        
        return { 
            currentTransactions: current, 
            totalItems: total, 
            totalPages: pages, 
            startIndex: start, 
            endIndex: end 
        };
    }, [activeData.transactions, activeSearchTerm, currentPage, itemsPerPage]);


    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            
            {/* 1. Zone du Bouton d'Action Globale (Haut de page) */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Gestion des Transactions Comptables
                </h2>
                
                {/* Bouton unique pour créer une nouvelle Facture/Transaction (Appelle la modale) */}
                <button 
                    onClick={onNewSaisieClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition duration-150 flex items-center shadow-md"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau Document / Saisie
                </button>
            </div>


            {/* 2. Bascule Ventes / Achats (Cartes de basculement) */}
            <div className="flex space-x-4 mb-6">
                <TransactionCard 
                    label="PRODUITS (Ventes)" 
                    icon="💲"
                    active={viewType === 'sales'} 
                    onClick={() => handleViewTypeChange('sales')} 
                />
                <TransactionCard 
                    label="CHARGES (Achats)" 
                    icon="💳"
                    active={viewType === 'purchase'} 
                    onClick={() => handleViewTypeChange('purchase')} 
                />
            </div>

            {/* 3. En-tête de la Vue Actuelle */}
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Vue actuelle : {activeData.title}
            </h3>
            
            {/* 4. Barre de Recherche et Filtres */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                
                {/* Zone de recherche avec bouton */}
                <div className="flex w-full sm:w-1/3">
                    <input 
                        type="text" 
                        placeholder={`Référence ou nom de ${viewType === 'sales' ? 'client' : 'fournisseur'}...`}
                        value={tempSearchTerm}
                        onChange={(e) => setTempSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-l-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
                    />
                    <button
                        onClick={handleSearchClick}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-indigo-700 transition duration-150"
                    >
                        Rechercher
                    </button>
                </div>


                <div className="flex flex-wrap gap-2 text-sm">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">Statut (Tous)</option>
                        <option value="payee">Payée</option>
                        <option value="attente">En attente</option>
                        <option value="retard">En retard</option>
                    </select>
                    <input type="date" className="p-2 border border-gray-300 rounded-lg text-sm" placeholder="Date Début" />
                    <input type="date" className="p-2 border border-gray-300 rounded-lg text-sm" placeholder="Date Fin" />
                    <button className="text-gray-600 px-3 py-2 border rounded-lg hover:bg-gray-100">Appliquer Filtres</button>
                </div>
            </div>

            {/* 5. Tableau des Transactions (Paginé) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {viewType === 'sales' ? 'Client (Tiers)' : 'Fournisseur (Tiers)'}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant HT</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant TTC</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        Aucune transaction trouvée pour les critères de recherche ou de filtre.
                                    </td>
                                </tr>
                            ) : (
                                currentTransactions.map((tx, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer">{tx.ref}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.tier}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatAmount(tx.montantHT)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatAmount(tx.montantTTC)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.statutClass}`}>
                                                {tx.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <a href="#" className="text-gray-600 hover:text-gray-900 mr-2">{viewType === 'sales' ? 'Paiements' : 'Justifier'}</a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        
                        {/* Pied de Tableau avec Totaux (Dynamique) */}
                        <tfoot>
                            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                                <td colSpan="3" className="px-6 py-3 text-left text-sm font-bold text-indigo-800">
                                    Total {viewType === 'sales' ? 'Produits' : 'Charges'} Période
                                </td>
                                <td className="px-6 py-3 text-right text-sm font-bold text-gray-800">
                                    {activeData.summary.totalHT}
                                </td>
                                <td className="px-6 py-3 text-right text-sm font-bold text-green-700">
                                    {activeData.summary.totalTTC}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 6. Composant de Pagination */}
                {totalItems > 0 && (
                    <div className="flex justify-between items-center p-4 border-t bg-white">
                        <div className="text-sm text-gray-600">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur **{totalItems}** résultats
                        </div>
                        
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border hover:bg-gray-100 text-gray-700'}`}
                            >
                                Précédent
                            </button>
                            
                            {/* Numéros de page (simplifié) */}
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === index + 1 ? 'bg-indigo-600 text-white font-bold shadow' : 'bg-white border hover:bg-gray-100 text-gray-700'}`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border hover:bg-gray-100 text-gray-700'}`}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default TransactionView;