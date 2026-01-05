import React, { useState, useEffect } from 'react';
import { BASE_URL_API } from '../../constants/globalConstants';

const BalanceModal = ({ isOpen, onClose, startDate, endDate }) => {
  const [balanceData, setBalanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction utilitaire pour nettoyer et convertir les montants en nombres (si API renvoie string, sinon inutile mais garde de sécurité)
  const cleanAmount = (amount) => {
    if (typeof amount === 'number') return amount;
    if (!amount || amount === '-') return 0;
    return parseFloat(amount.toString().replace(/,/g, '').replace(/\s/g, '')) || 0;
  };

  // Fonction pour formater les montants en Ar xxx xxx xxx,xx
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' Ar';
  };


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // États de filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [natureFilter, setNatureFilter] = useState('Tous'); // 'Tous', 'Débiteur', 'Créditeur'

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      let url = `${BASE_URL_API}/balance/generale/?`;
      if (startDate) url += `date_start=${startDate}&`;
      if (endDate) url += `date_end=${endDate}`;

      fetch(url)
        .then(res => res.json())
        .then(data => setBalanceData(data))
        .catch(err => console.error("Erreur chargement Balance:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  // Calcul des totaux
  const totalDebit = balanceData.reduce((sum, item) => sum + cleanAmount(item.debit), 0);
  const totalCredit = balanceData.reduce((sum, item) => sum + cleanAmount(item.credit), 0);
  const soldeFinal = totalDebit - totalCredit;
  const isBalanced = Math.abs(soldeFinal) < 0.01;

  // Filtrage
  const getFilteredData = () => {
    let data = balanceData;

    // Filtre Recherche
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.compte.toLowerCase().includes(lower) ||
        item.libelle.toLowerCase().includes(lower)
      );
    }

    // Filtre Nature
    if (natureFilter !== 'Tous') {
      data = data.filter(item => item.nature === natureFilter);
    }

    return data;
  };

  const filteredData = getFilteredData();

  // Pagination sur données filtrées
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-2 sm:p-4">

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl h-[95vh] sm:h-[90vh] lg:h-[85vh] flex flex-col border-t-2 border-gray-300">

        {/* En-tête de la modale */}
        <div className="flex-none p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center z-10 bg-white rounded-t-lg">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">⚖️</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Balance Générale</h2>
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
        <div className="flex-none p-2 sm:p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Débit</p>
              <p className="text-sm sm:text-lg font-bold text-red-600">{formatAmount(totalDebit)}</p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Crédit</p>
              <p className="text-sm sm:text-lg font-bold text-emerald-600">{formatAmount(totalCredit)}</p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Statut</p>
              <p className={`text-sm sm:text-lg font-bold ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isBalanced ? '✓ Équilibrée' : formatAmount(soldeFinal)}
              </p>
            </div>
          </div>
        </div>

        {/* Barre de Filtres */}
        <div className="flex-none px-4 py-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="w-full sm:flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Rechercher</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="N° Compte, Libellé..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Filtrer par nature</label>
            <select
              className="mt-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm"
              value={natureFilter}
              onChange={(e) => {
                setNatureFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Tous">Toutes les natures</option>
              <option value="Débiteur">Débiteur uniquement</option>
              <option value="Créditeur">Créditeur uniquement</option>
            </select>
          </div>
        </div>

        {/* Corps du tableau (Zone Scrollable) */}
        <div className="flex-grow overflow-y-auto p-2 sm:p-4 min-h-0 bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex justify-center items-center">
              <div className="flex flex-col items-center max-w-sm w-full text-center">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-800 animate-pulse px-4">Chargement de la balance...</p>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs sm:text-sm whitespace-nowrap min-w-[640px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-800 text-white">
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Compte</th>
                    <th className="px-1 sm:px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Libellé</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Débit</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Crédit</th>
                    <th className="px-1 sm:px-2 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Solde</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide">Nature</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className={`hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5">
                        <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">{item.compte}</span>
                      </td>
                      <td className="border-b border-gray-100 px-1 sm:px-2 py-2 sm:py-2.5 text-gray-800 text-xs sm:text-sm truncate max-w-[200px]">{item.libelle}</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.debit)} Ar
                      </td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-right font-semibold text-emerald-600 text-xs sm:text-sm">
                        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.credit)} Ar
                      </td>
                      <td className={`border-b border-gray-100 px-1 sm:px-2 py-2 sm:py-2.5 text-right font-bold text-xs sm:text-sm ${item.nature === 'Débiteur' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.solde)} Ar
                      </td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-center">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] sm:text-xs font-bold rounded-full ${item.nature === 'Débiteur'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                          }`}>
                          {item.nature}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Lignes vides pour maintenir la hauteur fixe */}
                  {Array.from({ length: Math.max(0, itemsPerPage - currentData.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="bg-white">
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer avec Pagination Fixe */}
        <div className="flex-none p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <p className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
              <span className="font-semibold">{filteredData.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> / <span className="font-semibold">{filteredData.length}</span>
            </p>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">←</span> Préc.
              </button>
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Suiv. <span className="hidden sm:inline">→</span>
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default BalanceModal;