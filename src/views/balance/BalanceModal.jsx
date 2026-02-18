import React, { useState, useEffect } from 'react';
import { BASE_URL_API } from '../../constants/globalConstants';
import { fetchWithReauth } from '../../utils/apiUtils';
import LoadingOverlay from '../../components/layout/LoadingOverlay';

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
    }).format(amount).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ') + ' Ar';
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

      fetchWithReauth(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBalanceData(data);
          } else {
            console.error("Format inattendu:", data);
            setBalanceData([]);
          }
        })
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

      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[95vh] sm:h-[90vh] lg:h-[85vh] flex flex-col border-t-2 border-gray-300 dark:border-gray-700">

        {/* En-tête de la modale */}
        <div className="flex-none p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">⚖️</span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Balance Générale</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats cards */}
        <div className="flex-none p-2 sm:p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-row justify-between gap-2">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 text-center sm:text-left">
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Débit</p>
              <p className="text-xs sm:text-lg font-bold text-red-600 truncate">{formatAmount(totalDebit)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 text-center sm:text-left">
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Crédit</p>
              <p className="text-xs sm:text-lg font-bold text-emerald-600 truncate">{formatAmount(totalCredit)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 text-center sm:text-left">
              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Statut</p>
              <p className={`text-xs sm:text-lg font-bold truncate ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isBalanced ? '✓ OK' : formatAmount(soldeFinal)}
              </p>
            </div>
          </div>
        </div>

        {/* Barre de Filtres */}
        <div className="flex-none px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-row gap-2 items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">Rechercher</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-7 sm:pl-10 text-[10px] sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-1.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Compte..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="w-1/3 sm:w-auto min-w-[100px] sm:min-w-[200px]">
            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">Nature</label>
            <select
              className="block w-full pl-2 pr-6 py-1.5 sm:py-2 text-[10px] sm:text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              value={natureFilter}
              onChange={(e) => {
                setNatureFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Tous">Tous</option>
              <option value="Débiteur">Débiteur</option>
              <option value="Créditeur">Créditeur</option>
            </select>
          </div>
        </div>

        {/* Corps du tableau (Zone Scrollable) */}
        <div className="flex-grow p-2 sm:p-4 min-h-0 bg-white dark:bg-gray-800 relative flex flex-col">
          {isLoading && <LoadingOverlay message="Chargement de la balance..." fullScreen={false} />}

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col flex-grow min-h-0">
            <div className="overflow-auto min-h-0">
              <table className="w-full border-collapse text-xs sm:text-sm whitespace-nowrap min-w-[640px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100">
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
                    <tr key={index} className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5">
                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">{item.compte}</span>
                      </td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-1 sm:px-2 py-2 sm:py-2.5 text-gray-800 dark:text-gray-100 text-xs sm:text-sm truncate max-w-[200px]">{item.libelle}</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                        {formatAmount(item.debit)}
                      </td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-right font-semibold text-emerald-600 text-xs sm:text-sm">
                        {formatAmount(item.credit)}
                      </td>
                      <td className={`border-b border-gray-100 dark:border-gray-700 px-1 sm:px-2 py-2 sm:py-2.5 text-right font-bold text-xs sm:text-sm ${item.nature === 'Débiteur' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatAmount(item.solde)}
                      </td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-center">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] sm:text-xs font-bold rounded-full ${item.nature === 'Débiteur'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}>
                          {item.nature}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Lignes vides pour maintenir la hauteur fixe */}
                  {Array.from({ length: Math.max(0, itemsPerPage - currentData.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="bg-white dark:bg-gray-800">
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                      <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer avec Pagination Fixe */}
        <div className="flex-none p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredData.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-semibold text-gray-800 dark:text-gray-200">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> / <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredData.length}</span>
            </p>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">←</span> Préc.
              </button>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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