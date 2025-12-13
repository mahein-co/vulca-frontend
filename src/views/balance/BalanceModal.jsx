import React, { useState } from 'react';

// Données fictives pour la balance (basé sur 4.jpeg)
const balanceData = [
  { compte: '641', libelle: 'Rémunérations du personnel', debit: '2,350,000.00', credit: '-', solde: '2,350,000.00', nature: 'Débiteur' },
  { compte: '421', libelle: 'Personnel - Rémunérations dues', debit: '-', credit: '2,150,000.00', solde: '2,150,000.00', nature: 'Créditeur' },
  { compte: '411', libelle: 'Clients (Créances)', debit: '105,370,800', credit: '18,048,000', solde: '87,322,800', nature: 'Débiteur' },
  { compte: '401', libelle: 'Fournisseurs (Dettes)', debit: '23,733,000', credit: '59,301,000', solde: '35,568,000', nature: 'Créditeur' },
  { compte: '512', libelle: 'Banques (Compte courant)', debit: '11,316,000', credit: '12,288,000', solde: '972,000', nature: 'Créditeur' },
  { compte: '612', libelle: 'Achats stockés de matières premières et fournitures', debit: '16,307,500', credit: '-', solde: '16,307,500', nature: 'Débiteur' },
  { compte: '645', libelle: 'Charges patronales', debit: '400,000', credit: '-', solde: '400,000', nature: 'Débiteur' },
  { compte: '530', libelle: 'Caisse', debit: '8,500,000', credit: '3,200,000', solde: '5,300,000', nature: 'Débiteur' },
  { compte: '701', libelle: 'Ventes de produits finis', debit: '-', credit: '79,670,000', solde: '79,670,000', nature: 'Créditeur' },
  { compte: '607', libelle: 'Achats de marchandises', debit: '45,200,000', credit: '-', solde: '45,200,000', nature: 'Débiteur' },
  { compte: '445', libelle: 'TVA à décaisser', debit: '3,800,000', credit: '5,600,000', solde: '1,800,000', nature: 'Créditeur' },
  { compte: '101', libelle: 'Capital social', debit: '-', credit: '50,000,000', solde: '50,000,000', nature: 'Créditeur' },
];

// Fonction utilitaire pour nettoyer et convertir les montants en nombres
const cleanAmount = (amount) => {
  if (amount === '-') return 0;
  return parseFloat(amount.replace(/,/g, '').replace(/\s/g, '')) || 0;
};

// Fonction pour formater les montants en Ar xxx xxx xxx,xx
const formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('$', 'Ar').replace(/\sUSD/, '').replace('.', ',');
};

const BalanceModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (!isOpen) return null;

  // Calcul des totaux
  const totalDebit = balanceData.reduce((sum, item) => sum + cleanAmount(item.debit), 0);
  const totalCredit = balanceData.reduce((sum, item) => sum + cleanAmount(item.credit), 0);
  const soldeFinal = totalDebit - totalCredit;
  const isBalanced = Math.abs(soldeFinal) < 0.01;

  // Pagination
  const totalPages = Math.ceil(balanceData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = balanceData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col border-t-2 border-gray-300">

        {/* En-tête de la modale */}
        <div className="flex-none p-4 border-b border-gray-200 flex justify-between items-center z-10 bg-white rounded-t-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚖️</span>
            <h2 className="text-xl font-bold text-gray-800">Balance Générale</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats cards */}
        <div className="flex-none p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Débit</p>
              <p className="text-lg font-bold text-red-600">{formatAmount(totalDebit)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Crédit</p>
              <p className="text-lg font-bold text-emerald-600">{formatAmount(totalCredit)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Statut</p>
              <p className={`text-lg font-bold ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isBalanced ? '✓ Équilibrée' : formatAmount(soldeFinal)}
              </p>
            </div>
          </div>
        </div>

        {/* Corps du tableau (Zone Scrollable) */}
        <div className="flex-grow overflow-y-auto p-4 min-h-0 bg-white">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-800 text-white">
                  <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Compte</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Libellé</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Débit</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Crédit</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Solde</th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide">Nature</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={index} className={`hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="border-b border-gray-100 px-3 py-2.5">
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{item.compte}</span>
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-gray-800">{item.libelle}</td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-right">
                      {item.debit !== '-' ? (
                        <span className="text-red-600 font-semibold">{item.debit} Ar</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-right">
                      {item.credit !== '-' ? (
                        <span className="text-emerald-600 font-semibold">{item.credit} Ar</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className={`border-b border-gray-100 px-3 py-2.5 text-right font-bold ${item.nature === 'Débiteur' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {item.solde} Ar
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-full ${item.nature === 'Débiteur'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {item.nature}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer avec Pagination Fixe */}
        <div className="flex-none p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {/* Pagination */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              Affichage <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + itemsPerPage, balanceData.length)}</span> sur <span className="font-semibold">{balanceData.length}</span> comptes
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Suivant →
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default BalanceModal;