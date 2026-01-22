import React, { useState, useEffect } from 'react';
import BalanceModal from '../balance/BalanceModal';

import BarCharts from '../../components/charts/BarCharts';
import TvaBarChart from '../../components/charts/TvaBarChart';
import PieChartRepartition from '../../components/charts/PieChartRepartition';
import LineChartCAEvolution from '../../components/charts/LineChartCAEvolution';
import LineChartCategorized from '../../components/charts/LineChartCategorized';
import ThreePieCharts from '../../components/charts/ThreePieCharts';
import { BASE_URL_API } from '../../constants/globalConstants';






// --- 2. Composants de Support ---

const JournalRepartition = ({ globalStartDate, globalEndDate }) => {
  const [totalFormatted, setTotalFormatted] = useState('0 Ar');
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [journals, setJournals] = useState([]);

  // États de sélection et pagination
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // États pour le détail (modal)
  const [journalEntries, setJournalEntries] = useState([]);
  const [totalEntriesCount, setTotalEntriesCount] = useState(0);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Filtre recherche
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Charger la RÉPARTITION (barres de progression)
  useEffect(() => {
    let url = `${BASE_URL_API}/journals/repartition/?`;
    if (globalStartDate) url += `date_start=${globalStartDate}&`;
    if (globalEndDate) url += `date_end=${globalEndDate}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setJournals(data.journals || []);
        setTotalGlobal(data.total_global || 0);
        setTotalFormatted(new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', currencyDisplay: 'narrowSymbol' }).format(data.total_global || 0).replace('MGA', 'Ar'));
      })
      .catch(err => console.error("Erreur chargement répartition journaux:", err));
  }, [globalStartDate, globalEndDate]);

  // 2. Charger le DÉTAIL quand un journal est sélectionné (avec pagination, date et recherche)
  useEffect(() => {
    if (!selectedJournal) return;

    setIsLoadingEntries(true);
    let url = `${BASE_URL_API}/journals/?type=${selectedJournal.code}&page=${currentPage}&page_size=${itemsPerPage}`;

    if (globalStartDate) url += `&date_start=${globalStartDate}`;
    if (globalEndDate) url += `&date_end=${globalEndDate}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setJournalEntries(data.results || []);
        setTotalEntriesCount(data.count || 0); // data.totals.count si disponible, sinon data.count du paginator
      })
      .catch(err => console.error("Erreur chargement détail journal:", err))
      .finally(() => setIsLoadingEntries(false));
  }, [selectedJournal, currentPage, globalStartDate, globalEndDate, searchTerm]);


  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const totalPages = Math.ceil(totalEntriesCount / itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Répartition par journal</h3>
      {journals.map((journal) => {
        // Mapping des couleurs du backend vers les classes Tailwind
        const colorMap = {
          'bg-red-800': { bar: 'bg-red-800', dot: 'bg-red-800' },
          'bg-emerald-900': { bar: 'bg-emerald-900', dot: 'bg-emerald-900' },
          'bg-blue-900': { bar: 'bg-blue-900', dot: 'bg-blue-900' },
          'bg-amber-800': { bar: 'bg-amber-800', dot: 'bg-amber-800' },
          'bg-gray-600': { bar: 'bg-gray-600', dot: 'bg-gray-600' },
          'bg-purple-800': { bar: 'bg-purple-800', dot: 'bg-purple-800' }
        };

        const colors = colorMap[journal.color] || { bar: 'bg-gray-500', dot: 'bg-gray-500' };

        // Calcul du pourcentage (Entier ou < 1%)
        const rawPercent = totalGlobal > 0 ? (journal.amount / totalGlobal) * 100 : 0;
        const percentageDisplay = (rawPercent > 0 && rawPercent < 1) ? '< 1' : rawPercent.toFixed(0);

        return (
          <div key={journal.name} className="mb-3">
            <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${colors.dot} mr-2`}></span>
                {journal.name}
                <button
                  onClick={() => handleSelectJournal(journal)}
                  className="inline-flex items-center text-xs text-emerald-600 ml-2 cursor-pointer hover:text-emerald-700 font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  voir détails
                </button>
              </span>
              <span className="text-gray-800 dark:text-gray-100 font-medium">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', currencyDisplay: 'narrowSymbol' }).format(journal.amount).replace('MGA', 'Ar')}
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  ({percentageDisplay}%)
                </span>
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-2 ${colors.bar} rounded-full transition-all duration-300`}
                style={{ width: `${journal.value}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3 flex justify-between">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Total</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{totalFormatted}</span>
      </div>

      {/* Modal Journal Detail */}
      {/* Modal Journal Detail - STYLE EXACT BALANCE MODAL */}
      {selectedJournal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center p-2 sm:p-4">

          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] h-auto flex flex-col border-t-2 border-gray-300 dark:border-gray-700">

            {/* En-tête de la modale */}
            <div className="flex-none p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10 bg-white dark:bg-gray-800 rounded-t-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${selectedJournal.color} mr-2 sm:mr-3 shadow-sm`}></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Journal : {selectedJournal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-all"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats cards - Style Balance */}
            <div className="flex-none p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Montant Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', currencyDisplay: 'narrowSymbol' }).format(selectedJournal.amount).replace('MGA', 'Ar')}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Part du total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedJournal.percentage}%</p>
                </div>
              </div>
            </div>

            {/* Barre de Filtres - Style Balance */}
            <div className="flex-none px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rechercher</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Compte, Libellé..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Corps du tableau (Zone Scrollable) - Style Balance */}
            <div className="flex-grow p-2 sm:p-4 min-h-0 bg-white dark:bg-gray-800 relative flex flex-col">
              {isLoadingEntries && (
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-20 flex justify-center items-center">
                  <div className="flex flex-col items-center max-w-sm w-full text-center">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                      <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 animate-pulse px-4">Chargement du journal...</p>
                  </div>
                </div>
              )}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col flex-grow min-h-0">
                <div className="overflow-auto min-h-0">
                  <table className="w-full border-collapse text-xs sm:text-sm whitespace-nowrap min-w-[500px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-800 dark:bg-black text-white">
                        <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide hidden sm:table-cell">Date</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Compte</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Libellé</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Débit</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Crédit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Données réelles */}
                      {journalEntries.map((entry, idx) => (
                        <tr key={idx} className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm hidden sm:table-cell">{entry.date}</td>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">{entry.numero_compte}</span>
                          </td>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{entry.libelle}</td>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                            {Number(entry.debit_ar) > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-semibold">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(entry.debit_ar))} Ar</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">-</span>
                            )}
                          </td>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                            {Number(entry.credit_ar) > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(entry.credit_ar))} Ar</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Lignes vides pour maintenir la hauteur fixe (Filler Rows) */}
                      {Array.from({ length: Math.max(0, itemsPerPage - journalEntries.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="bg-white dark:bg-gray-800">
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none hidden sm:table-cell">-</td>
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

            {/* Footer avec Pagination Fixe - Style Balance */}
            <div className="flex-none p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-0">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  <span className="font-semibold">{totalEntriesCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> - <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalEntriesCount)}</span> / <span className="font-semibold">{totalEntriesCount}</span>
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
                    {currentPage}/{totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Suiv. <span className="hidden sm:inline">→</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};


// --- 3. Composant Principal Dashboard ---

const Dashboard = () => {





  // États globaux de date pour le filtrage
  const [globalDateStart, setGlobalDateStart] = useState('2019-01-01');
  const [globalDateEnd, setGlobalDateEnd] = useState('2025-12-31');

  // Chargement automatique de la plage de dates disponible (Min/Max des journaux)
  useEffect(() => {
    fetch(`${BASE_URL_API}/journals/date-range/`)
      .then(res => res.json())
      .then(data => {
        if (data.min_date) setGlobalDateStart(data.min_date);
        if (data.max_date) setGlobalDateEnd(data.max_date);
      })
      .catch(err => console.error("Erreur chargement date range:", err));
  }, []);

  // États Indicateurs Financiers (Chargés en une seule fois)
  const [indicators, setIndicators] = useState({
    ca: 0,
    ebe: 0,
    resultatNet: 0,
    caf: 0,
    bfr: 0,
    leverage: 0,
    totalBalance: 0,
    ratios: {
      annuite_caf: { value: 0, alerte: false },
      dette_caf: { value: 0, alerte: false },
      marge_nette: { value: 0 },
      fi_ebe: { value: 0, alerte: false },
      fi_ca: { value: 0, alerte: false },
      gearing: { value: 0, alerte: false }
    }
  });

  const [loadingIndicators, setLoadingIndicators] = useState(true);

  // État pour le ROE
  const [roeData, setRoeData] = useState({
    roe: null,
    resultat_net: 0,
    fonds_propres: 0,
    variation: null
  });

  // État pour le ROA
  const [roaData, setRoaData] = useState({
    roa: null,
    resultat_net: 0,
    total_actif: 0,
    variation: null
  });

  // État pour le Current Ratio
  const [currentRatioData, setCurrentRatioData] = useState({
    current_ratio: null,
    actifs_courants: 0,
    passifs_courants: 0,
    variation: null
  });

  // État pour le Quick Ratio
  const [quickRatioData, setQuickRatioData] = useState({
    quick_ratio: null,
    actifs_courants: 0,
    stocks: 0,
    passifs_courants: 0,
    variation: null
  });

  // État pour le Gearing
  const [gearingData, setGearingData] = useState({
    gearing: null,
    dettes_financieres: 0,
    fonds_propres: 0,
    variation: null
  });

  // État pour la Rotation des stocks
  const [rotationStockData, setRotationStockData] = useState({
    rotation_stock: null,
    duree_stock_jours: null,
    cout_ventes: 0,
    stocks: 0,
    variation: null
  });

  // État pour la Marge opérationnelle
  const [margeOperationnelleData, setMargeOperationnelleData] = useState({
    marge_operationnelle: null,
    chiffre_affaire: 0,
    charges_exploitation: 0,
    resultat_operationnel: 0,
    variation: null
  });

  // États pour les variations des indicateurs scorecards
  const [caData, setCaData] = useState({ ca: 0, variation: null });
  const [cafDataVar, setCafDataVar] = useState({ caf: 0, variation: null });
  const [ebeDataVar, setEbeDataVar] = useState({ ebe: 0, variation: null });
  const [leverageDataVar, setLeverageDataVar] = useState({ leverage: 0, variation: null });
  const [bfrDataVar, setBfrDataVar] = useState({ bfr: 0, variation: null });
  const [margeBruteDataVar, setMargeBruteDataVar] = useState({ marge_brute: 0, variation: null });
  const [margeNetteDataVar, setMargeNetteDataVar] = useState({ marge_nette: null, variation: null });
  const [tresorerieDataVar, setTresorerieDataVar] = useState({ tresorerie: 0, variation: null });

  // CHARGEMENT OPTIMISÉ (Tous les indicateurs en parallèle)
  useEffect(() => {
    setLoadingIndicators(true);

    const fetchIndicator = (endpoint) => {
      let url = `${BASE_URL_API}/${endpoint}/?`;
      if (globalDateStart) url += `date_start=${globalDateStart}&`;
      if (globalDateEnd) url += `date_end=${globalDateEnd}`;
      return fetch(url).then(res => res.json()).catch(err => {
        console.error(`Erreur chargement ${endpoint}:`, err);
        return {}; // Retourner objet vide en cas d'erreur pour ne pas casser Promise.all
      });
    };

    Promise.all([
      fetchIndicator('dashboard/indicators'), // 0
      fetchIndicator('roe'), // 1
      fetchIndicator('roa'), // 2
      fetchIndicator('current-ratio'), // 3
      fetchIndicator('quick-ratio'), // 4
      fetchIndicator('gearing'), // 5
      fetchIndicator('rotation-stock'), // 6
      fetchIndicator('marge-operationnelle'), // 7
      fetchIndicator('chiffre-affaire'), // 8
      fetchIndicator('caf'), // 9
      fetchIndicator('ebe'), // 10
      fetchIndicator('leverage-brut'), // 11
      fetchIndicator('bfr'), // 12
      fetchIndicator('marge-brute'), // 13
      fetchIndicator('marge-nette'), // 14
      fetchIndicator('tresorerie'), // 15
    ]).then(([
      indicatorsData,
      roe,
      roa,
      currentRatio,
      quickRatio,
      gearing,
      rotationStock,
      margeOp,
      ca,
      caf,
      ebe,
      leverage,
      bfr,
      margeBrute,
      margeNette,
      tresorerie
    ]) => {
      // 1. Mise à jour Indicators Global
      setIndicators({
        ca: indicatorsData.ca || 0,
        ebe: indicatorsData.ebe || 0,
        resultatNet: indicatorsData.resultat_net || 0,
        caf: indicatorsData.caf || 0,
        bfr: indicatorsData.bfr || 0,
        leverage: indicatorsData.leverage || 0,
        totalBalance: indicatorsData.total_balance || 0,
        ratios: indicatorsData.ratios || {}
      });

      // 2. Mise à jour ROE
      setRoeData({
        roe: roe.roe,
        resultat_net: roe.resultat_net || 0,
        fonds_propres: roe.fonds_propres || 0,
        variation: roe.variation
      });

      // 3. Mise à jour ROA
      setRoaData({
        roa: roa.roa,
        resultat_net: roa.resultat_net || 0,
        total_actif: roa.total_actif || 0,
        variation: roa.variation
      });

      // 4. Mise à jour Current Ratio
      setCurrentRatioData({
        current_ratio: currentRatio.current_ratio,
        actifs_courants: currentRatio.actifs_courants || 0,
        passifs_courants: currentRatio.passifs_courants || 0,
        variation: currentRatio.variation
      });

      // 5. Mise à jour Quick Ratio
      setQuickRatioData({
        quick_ratio: quickRatio.quick_ratio,
        actifs_courants: quickRatio.actifs_courants || 0,
        stocks: quickRatio.stocks || 0,
        passifs_courants: quickRatio.passifs_courants || 0,
        variation: quickRatio.variation
      });

      // 6. Mise à jour Gearing
      setGearingData({
        gearing: gearing.gearing,
        dettes_financieres: gearing.dettes_financieres || 0,
        fonds_propres: gearing.fonds_propres || 0,
        variation: gearing.variation
      });

      // 7. Mise à jour Rotation Stock
      setRotationStockData({
        rotation_stock: rotationStock.rotation_stock,
        duree_stock_jours: rotationStock.duree_stock_jours,
        cout_ventes: rotationStock.cout_ventes || 0,
        stocks: rotationStock.stocks || 0,
        variation: rotationStock.variation
      });

      // 8. Mise à jour Marge Opérationnelle
      setMargeOperationnelleData({
        marge_operationnelle: margeOp.marge_operationnelle,
        chiffre_affaire: margeOp.chiffre_affaire || 0,
        charges_exploitation: margeOp.charges_exploitation || 0,
        resultat_operationnel: margeOp.resultat_operationnel || 0,
        variation: margeOp.variation
      });

      // 9. Mise à jour CA Variation
      setCaData({
        ca: ca.chiffre_affaire || 0,
        variation: ca.variation
      });

      // 10. Mise à jour CAF Variation
      setCafDataVar({
        caf: caf.caf || 0,
        variation: caf.variation
      });

      // 11. Mise à jour EBE Variation
      setEbeDataVar({
        ebe: ebe.ebe || 0,
        variation: ebe.variation
      });

      // 12. Mise à jour Leverage Variation
      setLeverageDataVar({
        leverage: leverage.leverage_brut || 0,
        variation: leverage.variation
      });

      // 13. Mise à jour BFR Variation
      setBfrDataVar({
        bfr: bfr.bfr || 0,
        variation: bfr.variation
      });

      // 14. Mise à jour Marge Brute Variation
      setMargeBruteDataVar({
        marge_brute: margeBrute.marge_brute || 0,
        variation: margeBrute.variation
      });

      // 15. Mise à jour Marge Nette Variation
      setMargeNetteDataVar({
        marge_nette: margeNette.marge_nette,
        variation: margeNette.variation
      });

      // 16. Mise à jour Trésorerie Variation
      setTresorerieDataVar({
        tresorerie: tresorerie.tresorerie || 0,
        variation: tresorerie.variation
      });

    }).finally(() => {
      setLoadingIndicators(false);
    });

  }, [globalDateStart, globalDateEnd]);



  // ✅ SUMMARY CARDS DYNAMIQUE
  const formattedLeverage = (() => {
    const n = Number(leverageDataVar.leverage);
    return Number.isFinite(n) ? n.toFixed(2) : '—';
  })();
  const summaryCards = [
    {
      title: "Chiffre d'affaires",
      value: `Ar ${Number(caData.ca).toLocaleString("fr-FR")}`,
      icon: '📊',
      action: 'none',
      variation: caData.variation
    },
    {
      title: "CAF",
      value: `Ar ${Number(cafDataVar.caf).toLocaleString("fr-FR")}`,
      // unit: "Capacité d'Autofinancement",
      icon: "🏦",
      variation: cafDataVar.variation
    },
    {
      title: "Marge brute",
      value: `Ar ${Number(margeBruteDataVar.marge_brute).toLocaleString("fr-FR")}`,
      icon: "💎",
      variation: margeBruteDataVar.variation
    },
    {
      title: "EBE",
      value: `Ar ${Number(ebeDataVar.ebe).toLocaleString("fr-FR")}`,
      // unit: "Excédent Brut d'Exploitation",
      icon: "💰",
      action: 'none',
      variation: ebeDataVar.variation
    },
    // {
    //   title: "Resultat net",
    //   value: `Ar ${Number(indicators.resultatNet).toLocaleString("fr-FR")}`,
    //   icon: "📈"
    // },
    {
      title: 'BALANCE',
      value: `Ar ${Number(indicators.totalBalance).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      icon: '⚖️',
      action: 'openBalance'
    },
    {
      title: "Leverage brut",
      value: formattedLeverage,
      // unit: "Endettement / EBE",
      icon: "📊",
      action: 'none',
      variation: leverageDataVar.variation,
      invertColors: true  // Special flag for inverted color logic
    },
    {
      title: "BFR",
      value: `Ar ${Number(bfrDataVar.bfr).toLocaleString("fr-FR")}`,
      // unit: "Besoin en Fonds de Roulement",
      icon: "💵",
      variation: bfrDataVar.variation
    },
    {
      title: "ROE",
      value: roeData.roe !== null ? `${Number(roeData.roe).toFixed(2)}%` : '--',
      icon: "📈",
      variation: roeData.variation
    },
    {
      title: "ROA",
      value: roaData.roa !== null ? `${Number(roaData.roa).toFixed(2)}%` : '--',
      icon: "💹",
      variation: roaData.variation
    },
    {
      title: "Rotation stocks",
      value: rotationStockData.rotation_stock !== null ? `${Number(rotationStockData.rotation_stock).toFixed(1)}x` : '--',
      icon: "🔄",
      variation: rotationStockData.variation
    },
    {
      title: "Marge opé.",
      value: margeOperationnelleData.marge_operationnelle !== null ? `${Number(margeOperationnelleData.marge_operationnelle).toFixed(1)}%` : '--',
      icon: "�",
      variation: margeOperationnelleData.variation
    },
    {
      title: "Marge nette",
      value: margeNetteDataVar.marge_nette !== null ? `${Number(margeNetteDataVar.marge_nette).toFixed(1)}%` : '--',
      icon: "💰",
      variation: margeNetteDataVar.variation
    },
    {
      title: "Trésorerie",
      value: `Ar ${Number(tresorerieDataVar.tresorerie).toLocaleString("fr-FR")}`,
      icon: "🏦",
      variation: tresorerieDataVar.variation
    },
  ];


  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  return (
    <div className="px-4 sm:px-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-gray-900 min-h-screen transition-colors duration-200">

      {/* 1. Sélecteur de Période */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700">
        <div className="mb-2 sm:mb-0">
          <p className="font-semibold text-gray-800 dark:text-gray-100">Période d'exercice</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sélectionnez la période à analyser</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm">
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Du</label>
            <input
              type="date"
              value={globalDateStart}
              onChange={(e) => setGlobalDateStart(e.target.value)}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Au</label>
            <input
              type="date"
              value={globalDateEnd}
              onChange={(e) => setGlobalDateEnd(e.target.value)}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Bouton d'affichage dynamique de la période */}
          <button className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-900 dark:hover:bg-gray-600 font-medium shadow-sm transition-all focus:outline-none">
            {new Date(globalDateStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(globalDateEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </button>
        </div>
      </div>

      {/* 2. Cartes de Résumé - identique au style des cartes Bilan & États */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3 pb-2 mb-6">
        {summaryCards.map((card, index) => {
          const hasVariation = card.variation !== undefined && card.variation !== null;
          const isPositive = hasVariation && card.variation >= 0;
          const variationClass = card.invertColors
            ? hasVariation && (card.variation < 0 ? 'text-green-600' : 'text-red-600')
            : hasVariation && (card.variation >= 0 ? 'text-green-600' : 'text-red-600');

          return (
            <div key={index}>
              <div
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-5 flex flex-col items-start shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] group h-full min-h-[60px] ${card.action === 'openBalance' ? 'cursor-pointer hover:border-emerald-400' : ''
                  }`}
                onClick={card.action === 'openBalance' ? () => handleCardClick(card.action) : null}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="p-1 rounded-full text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                    <span className="text-sm sm:text-base">{card.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-0.5 sm:truncate">
                      {card.title}
                    </p>
                    <p className="text-[10px] sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-400 mb-0.5 whitespace-normal break-words leading-tight">
                      {card.value}
                    </p>
                  </div>

                  {hasVariation && (
                    <div className={`text-[9px] font-bold ${variationClass} flex-shrink-0 self-start mt-0.5 pl-1`}>
                      <span className="inline-block whitespace-nowrap">
                        {card.invertColors
                          ? (card.variation < 0 ? '↓' : '↑')
                          : (isPositive ? '↑' : '↓')}{' '}
                        {Math.abs(card.variation).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* 6. Autres indicateurs (Alertes & Risques + Rentabilité) */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700 mb-4">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3 text-gray-400">📊</span>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Autres indicateurs</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alertes & Risques */}
          <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-[10px] sm:text-xs">Indicateur</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-right text-[10px] sm:text-xs">Ratio</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-right text-[10px] sm:text-xs">Seuil</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-center text-[10px] sm:text-xs">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {/* ANNUITÉ / CAF */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">
                      Annuité / CAF
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.annuite_caf ? Number(indicators.ratios.annuite_caf.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 text-[9px] sm:text-xs text-right whitespace-nowrap">
                      &lt; 0.50
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.annuite_caf && indicators.ratios.annuite_caf.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">⚠ Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* DETTE / CAF */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Dette LMT / CAF</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.dette_caf ? Number(indicators.ratios.dette_caf.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
                      &lt; 3.50
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.dette_caf && indicators.ratios.dette_caf.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* RESULTAT NET / CA (Marge Nette) */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">
                      R. Net / CA
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.marge_nette ? Number(indicators.ratios.marge_nette.value).toFixed(2) + "%" : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
                      ≥ 10%
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.marge_nette ? (
                        Number(indicators.ratios.marge_nette.value) < 5 ? (
                          <span className="text-red-700 text-[10px] sm:text-xs font-bold">Faible</span>
                        ) : Number(indicators.ratios.marge_nette.value) < 10 ? (
                          <span className="text-yellow-700 text-[10px] sm:text-xs font-bold">Correct</span>
                        ) : (
                          <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">Excel.</span>
                        )
                      ) : (
                        <span className="text-gray-500 text-[10px] sm:text-xs font-bold">N/A</span>
                      )}
                    </td>
                  </tr>

                  {/* CHARGE FINANCIERE / EBE */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">
                      Ch. Fi. / EBE
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.fi_ebe ? Number(indicators.ratios.fi_ebe.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
                      &lt; 0.30
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.fi_ebe && indicators.ratios.fi_ebe.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* CHARGE FI / CA */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Ch. Fi. / CA</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.fi_ca ? (Number(indicators.ratios.fi_ca.value) * 100).toFixed(2) + "%" : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">&lt; 5%</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.fi_ca && indicators.ratios.fi_ca.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* GEARING (Dette CMLT / Fonds Propres) */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Gearing</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.gearing ? Number(indicators.ratios.gearing.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
                      &lt; 1.3
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.gearing && indicators.ratios.gearing.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* LEVERAGE BRUT (Dette / EBE) */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Leverage Brut</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-right font-mono text-[10px] sm:text-sm">
                      {indicators.ratios && indicators.ratios.leverage ? Number(indicators.ratios.leverage.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs text-gray-400 whitespace-nowrap">
                      &lt; 3.5
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {indicators.ratios && indicators.ratios.leverage && indicators.ratios.leverage.alerte ? (
                        <span className="text-red-700 text-[10px] sm:text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] sm:text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rentabilité */}
          <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-[10px] sm:text-xs">Indicateur</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-right text-[10px] sm:text-xs">Valeur</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-right text-[10px] sm:text-xs">Variation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Current Ratio</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100 font-bold text-right text-[10px] sm:text-sm">
                      {currentRatioData.current_ratio !== null ? Number(currentRatioData.current_ratio).toFixed(2) : '--'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium text-[10px] sm:text-sm">
                      {currentRatioData.variation !== null ? (
                        <span className={currentRatioData.variation >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {currentRatioData.variation >= 0 ? '↗' : '↘'} {currentRatioData.variation >= 0 ? '+' : ''}{Number(currentRatioData.variation).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>

                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Quick Ratio</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100 font-bold text-right text-[10px] sm:text-sm">
                      {quickRatioData.quick_ratio !== null ? Number(quickRatioData.quick_ratio).toFixed(2) : '--'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium text-[10px] sm:text-sm">
                      {quickRatioData.variation !== null ? (
                        <span className={quickRatioData.variation >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {quickRatioData.variation >= 0 ? '↗' : '↘'} {quickRatioData.variation >= 0 ? '+' : ''}{Number(quickRatioData.variation).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>

                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800 dark:text-gray-200 font-medium text-[10px] sm:text-sm">Gearing</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-gray-100 font-bold text-right text-[10px] sm:text-sm">
                      {gearingData.gearing !== null ? `${Number(gearingData.gearing).toFixed(2)}%` : '--'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium text-[10px] sm:text-sm">
                      {gearingData.variation !== null ? (
                        <span className={gearingData.variation >= 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {gearingData.variation >= 0 ? '↗' : '↘'} {gearingData.variation >= 0 ? '+' : ''}{Number(gearingData.variation).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* 3. Graphique d'Évolution du Chiffre d'Affaires */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Évolution du Chiffre d'Affaires</h3>
        <LineChartCAEvolution />
      </div>

      {/* 3b. Graphique d'Évolution des Métriques Financières (Catégorisé) */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Évolution des Métriques Financières</h3>
        <LineChartCategorized globalDateStart={globalDateStart} globalDateEnd={globalDateEnd} />
      </div>

      {/* 4. Top 10 comptes mouvementés + TVA côte à côte */}
      {/* 4. Top 10 comptes mouvementés + TVA côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch mb-4">
        <div className="w-full">
          <BarCharts globalDateStart={globalDateStart} globalDateEnd={globalDateEnd} />
        </div>
        <div className="w-full">
          <TvaBarChart globalDateStart={globalDateStart} globalDateEnd={globalDateEnd} />
        </div>
      </div>
      {/* 5. Trois Camemberts: Produits, Charges, et Comparaison */}
      <ThreePieCharts globalDateStart={globalDateStart} globalDateEnd={globalDateEnd} />

      {/* 8. Répartition par Journal */}
      {/* 8. Répartition par Journal */}
      <JournalRepartition
        globalStartDate={globalDateStart}
        globalEndDate={globalDateEnd}
      />

      {/* La modale de la Balance */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        startDate={globalDateStart}
        endDate={globalDateEnd}
      />
    </div >
  );
};

export default Dashboard;