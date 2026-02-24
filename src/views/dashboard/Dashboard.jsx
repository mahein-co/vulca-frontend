import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage, selectActiveFilter } from '../../states/dashboard/dashboardFilterSlice';
import BalanceModal from '../balance/BalanceModal';
import LoadingOverlay from '../../components/layout/LoadingOverlay';
import FilterManager from '../../components/dashboard/FilterManager';

import BarCharts from '../../components/charts/BarCharts';
import TvaBarChart from '../../components/charts/TvaBarChart';
import PieChartRepartition from '../../components/charts/PieChartRepartition';
import LineChartCAEvolution from '../../components/charts/LineChartCAEvolution';
import LineChartCategorized from '../../components/charts/LineChartCategorized';
import ThreePieCharts from '../../components/charts/ThreePieCharts';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  BarChart2,
  PieChart,
  Calendar,
  AlertCircle,
  XCircle,
  Loader,
  LayoutDashboard,
  Target,
  Zap,
  CheckCircle,
  Briefcase,
  DollarSign,
  Droplets,
  Activity,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { fetchWithReauth } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';





// --- 1. Helpers ---
const formatCurrencyHelper = (amount, decimals = 2) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ');
};



// --- 2. Composants de Support ---

const JournalRepartition = ({ globalStartDate, globalEndDate, onLoad }) => {
  const [totalFormatted, setTotalFormatted] = useState('0 Ar');
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [journals, setJournals] = useState([]);
  const projectId = useProjectId();

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
    let url = `/journals/repartition/?`;
    if (globalStartDate) url += `date_start=${globalStartDate}&`;
    if (globalEndDate) url += `date_end=${globalEndDate}`;

    fetchWithReauth(url)
      .then(res => res.json())
      .then(data => {
        setJournals(data.journals || []);
        setTotalGlobal(data.total_global || 0);
        setTotalFormatted(`${formatCurrencyHelper(data.total_global || 0)} Ar`);
      })
      .catch(err => console.error("Erreur chargement répartition journaux:", err))
      .finally(() => {
        if (onLoad) onLoad(false);
      });
  }, [globalStartDate, globalEndDate, projectId]);

  // 2. Charger le DÉTAIL quand un journal est sélectionné (avec pagination, date et recherche)
  useEffect(() => {
    if (!selectedJournal) return;
    setIsLoadingEntries(true);
    let url = `/journals/?type=${selectedJournal.code}&page=${currentPage}&page_size=${itemsPerPage}`;

    if (globalStartDate) url += `&date_start=${globalStartDate}`;
    if (globalEndDate) url += `&date_end=${globalEndDate}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    fetchWithReauth(url)
      .then(res => res.json())
      .then(data => {
        setJournalEntries(data.results || []);
        setTotalEntriesCount(data.count || 0); // data.totals.count si disponible, sinon data.count du paginator
      })
      .catch(err => console.error("Erreur chargement détail journal:", err))
      .finally(() => setIsLoadingEntries(false));
  }, [selectedJournal, currentPage, globalStartDate, globalEndDate, searchTerm, projectId]);


  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const totalPages = Math.ceil(totalEntriesCount / itemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700 h-full">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">Répartition par journal</h3>
        {globalStartDate && globalEndDate && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(globalStartDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {new Date(globalEndDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
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
                {formatCurrencyHelper(journal.amount)} Ar
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
                    {formatCurrencyHelper(selectedJournal.amount)} Ar
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
                <LoadingOverlay message="Chargement du journal..." fullScreen={false} />
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
                              <span className="text-red-600 dark:text-red-400 font-semibold">{formatCurrencyHelper(Number(entry.debit_ar))} Ar</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">-</span>
                            )}
                          </td>
                          <td className="border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                            {Number(entry.credit_ar) > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrencyHelper(Number(entry.credit_ar))} Ar</span>
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
  const dispatch = useDispatch(); // NOUVEAU: Indispensable pour Redux
  const activeFilter = useSelector(selectActiveFilter);

  // --- NOUVEAU: Orchestration du chargement global ---
  const [loadingStates, setLoadingStates] = useState({
    main: true,
    ca: true,
    metrics: true,
    bar: true,
    tva: true,
    pie: true,
    journals: true
  });

  const isGlobalLoading = Object.values(loadingStates).some(v => v);

  const handleLoadStatus = (key) => (isLoading) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  // Helper pour adapter la taille de police des grands nombres
  const getAdaptiveFontSize = (value) => {
    if (!value) return "text-[10px] sm:text-base";
    const valStr = String(value);
    const len = valStr.length;
    if (len > 22) return "text-[8px] sm:text-[10px]";
    if (len > 18) return "text-[9px] sm:text-xs";
    if (len > 14) return "text-[10px] sm:text-sm";
    return "text-[10px] sm:text-base";
  };





  // Calculer les 6 derniers mois par défaut (ex: Février -> Août)
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 6);
  defaultStartDate.setDate(1);

  const [globalDateStart, setGlobalDateStart] = useState(defaultStartDate.toISOString().split('T')[0]);
  const [globalDateEnd, setGlobalDateEnd] = useState(defaultEndDate.toISOString().split('T')[0]);
  const projectId = useProjectId();

  // Reset loading states on date change
  useEffect(() => {
    setLoadingStates({
      main: true, ca: true, metrics: true, bar: true, tva: true, pie: true, journals: true
    });
  }, [globalDateStart, globalDateEnd]);

  // NOUVEAU: Synchroniser la page actuelle pour le chatbot
  useEffect(() => {
    dispatch(setCurrentPage("dashboard"));
  }, [dispatch]);

  // RÉTABLISSEMENT : Synchroniser les dates quand le filtre change dans le header (Redux)
  useEffect(() => {
    if (activeFilter?.type === 'date' && activeFilter.value) {
      if (activeFilter.value.start) setGlobalDateStart(activeFilter.value.start);
      if (activeFilter.value.end) setGlobalDateEnd(activeFilter.value.end);
    }
  }, [activeFilter]);

  // Chargement automatique de la plage de dates disponible (Min/Max des journaux)

  // États Indicateurs Financiers (Chargés en une seule fois)
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

  // CHARGEMENT OPTIMISÉ (APPEL UNIQUE AU BACKEND)
  useEffect(() => {
    setLoadingStates(prev => ({ ...prev, main: true }));

    let url = `/dashboard/indicators/?`;
    if (globalDateStart) url += `date_start=${globalDateStart}&`;
    if (globalDateEnd) url += `date_end=${globalDateEnd}`;

    fetchWithReauth(url)
      .then(res => res.json())
      .then(allData => {
        // 1. Mise à jour Indicators Global
        setIndicators({
          ca: allData.ca || 0,
          ebe: allData.ebe || 0,
          resultatNet: allData.resultat_net || 0,
          caf: allData.caf || 0,
          bfr: allData.bfr || 0,
          leverage: allData.leverage || 0,
          totalBalance: allData.total_balance || 0,
          ratios: allData.ratios || {}
        });

        // 2. Mise à jour des données détaillées (via les objets pré-calculés par le backend)
        setRoeData(allData.roe_data || { roe: 0, variation: null });
        setRoaData(allData.roa_data || { roa: 0, variation: null });
        setCurrentRatioData(allData.current_ratio_data || { current_ratio: 0, variation: null });
        setQuickRatioData(allData.quick_ratio_data || { quick_ratio: 0, variation: null });
        setGearingData(allData.gearing_data || { gearing: 0, variation: null });
        setRotationStockData(allData.rotation_stock_data || { rotation_stock: 0, variation: null });
        setMargeOperationnelleData(allData.marge_operationnelle_data || { marge_operationnelle: 0, variation: null });

        // 3. Mise à jour des variations simples
        const vars = allData.variations || {};
        setCaData({ ca: allData.ca || 0, variation: vars.ca });
        setCafDataVar({ caf: allData.caf || 0, variation: vars.caf });
        setEbeDataVar({ ebe: allData.ebe || 0, variation: vars.ebe });
        setLeverageDataVar({ leverage: allData.leverage || 0, variation: vars.leverage });
        setBfrDataVar({ bfr: allData.bfr || 0, variation: vars.bfr });
        setMargeBruteDataVar({ marge_brute: allData.marge_brute || 0, variation: vars.marge_brute });
        setMargeNetteDataVar({ marge_nette: allData.marge_nette || 0, variation: vars.marge_nette });
        setTresorerieDataVar({ tresorerie: allData.tresorerie || 0, variation: vars.tresorerie });

      })
      .catch(err => {
        console.error("Erreur chargement indicateurs dashboard:", err);
      })
      .finally(() => setLoadingStates(prev => ({ ...prev, main: false })));
  }, [globalDateStart, globalDateEnd, projectId]);




  // ✅ SUMMARY CARDS DYNAMIQUE
  const formattedLeverage = (() => {
    const n = Number(leverageDataVar.leverage);
    return Number.isFinite(n) ? n.toFixed(2) : '—';
  })();
  const summaryCards = [
    {
      title: "Chiffre d'affaires",
      value: `Ar ${formatCurrencyHelper(caData.ca, 0)}`,
      icon: '📊',
      action: 'none',
      variation: caData.variation
    },
    {
      title: "CAF",
      value: `Ar ${formatCurrencyHelper(cafDataVar.caf, 0)}`,
      // unit: "Capacité d'Autofinancement",
      icon: "🏦",
      variation: cafDataVar.variation
    },
    {
      title: "Marge brute",
      value: `Ar ${formatCurrencyHelper(margeBruteDataVar.marge_brute, 0)}`,
      icon: "💎",
      variation: margeBruteDataVar.variation
    },
    {
      title: "EBE",
      value: `Ar ${formatCurrencyHelper(ebeDataVar.ebe, 0)}`,
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
      value: `Ar ${formatCurrencyHelper(indicators.totalBalance, 2)}`,
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
      value: `Ar ${formatCurrencyHelper(bfrDataVar.bfr, 0)}`,
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
      value: `Ar ${formatCurrencyHelper(tresorerieDataVar.tresorerie, 0)}`,
      icon: "🏦",
      variation: tresorerieDataVar.variation
    },
  ];


  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);

  // États pour l'analyse IA
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  // Fonction pour analyser le dashboard avec l'IA
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    // Préparer les données du dashboard
    const dashboardData = {
      indicators: {
        ca: caData.ca,
        caf: cafDataVar.caf,
        ebe: ebeDataVar.ebe,
        marge_brute: margeBruteDataVar.marge_brute,
        bfr: bfrDataVar.bfr,
        tresorerie: tresorerieDataVar.tresorerie,
      },
      ratios: {
        roe: roeData.roe,
        roa: roaData.roa,
        marge_nette: margeNetteDataVar.marge_nette,
        marge_operationnelle: margeOperationnelleData.marge_operationnelle,
        current_ratio: currentRatioData.current_ratio,
        quick_ratio: quickRatioData.quick_ratio,
        rotation_stock: rotationStockData.rotation_stock,
        annuite_caf: indicators.ratios?.annuite_caf,
        dette_caf: indicators.ratios?.dette_caf,
        fi_ebe: indicators.ratios?.fi_ebe,
        fi_ca: indicators.ratios?.fi_ca,
        gearing: indicators.ratios?.gearing,
        leverage: indicators.ratios?.leverage,
      },
      date_range: {
        start_date: globalDateStart,
        end_date: globalDateEnd
      }
    };

    try {
      const response = await fetchWithReauth('/dashboard/ai-analysis/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboardData)
      });

      const data = await response.json();

      if (data.success) {
        setAiAnalysis(data.analysis);
        setHasAnalyzed(true);
      } else {
        setAnalysisError(data.error || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      setAnalysisError('Impossible de contacter le serveur d\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Déclencher l'analyse automatiquement à l'ouverture de la modale
  useEffect(() => {
    if (isIndicatorsModalOpen && !hasAnalyzed && !isAnalyzing) {
      handleAIAnalysis();
    }
  }, [isIndicatorsModalOpen]);

  // Réinitialiser l'analyse quand les dates changent
  useEffect(() => {
    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setAiAnalysis(null);
    }
  }, [globalDateStart, globalDateEnd]);

  return (
    <div className="px-4 sm:px-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-gray-900 min-h-screen transition-colors duration-200">


      {/* Loader Global Syncé */}
      {isGlobalLoading && (
        <LoadingOverlay message="Mise à jour du tableau de bord..." />
      )}

      <div className="relative z-[10001]">
        <FilterManager
          page="dashboard"
          rightAction={
            <button
              onClick={() => setIsIndicatorsModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Analyser en détails"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyse IA
            </button>
          }
        />
      </div>

      <div className="relative">

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
                      <p className={`${getAdaptiveFontSize(card.value)} font-extrabold text-indigo-700 dark:text-indigo-400 mb-0.5 whitespace-normal break-words leading-tight`}>
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
          <LineChartCAEvolution
            globalDateStart={globalDateStart}
            globalDateEnd={globalDateEnd}
            onLoad={handleLoadStatus('ca')}
          />
        </div>

        {/* 3b. Graphique d'Évolution des Métriques Financières (Catégorisé) */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Évolution des Métriques Financières</h3>
          <LineChartCategorized
            globalDateStart={globalDateStart}
            globalDateEnd={globalDateEnd}
            onLoad={handleLoadStatus('metrics')}
          />
        </div>

        {/* 4. Top 10 comptes mouvementés + TVA côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch mb-4">
          <div className="w-full">
            <BarCharts
              globalDateStart={globalDateStart}
              globalDateEnd={globalDateEnd}
              onLoad={handleLoadStatus('bar')}
            />
          </div>
          <div className="w-full">
            <TvaBarChart
              globalDateStart={globalDateStart}
              globalDateEnd={globalDateEnd}
              onLoad={handleLoadStatus('tva')}
            />
          </div>
        </div>
        {/* 5. Trois Camemberts: Produits, Charges, et Comparaison */}
        <ThreePieCharts
          globalDateStart={globalDateStart}
          globalDateEnd={globalDateEnd}
          onLoad={handleLoadStatus('pie')}
        />

        {/* 8. Répartition par Journal */}
        <JournalRepartition
          globalStartDate={globalDateStart}
          globalEndDate={globalDateEnd}
          onLoad={handleLoadStatus('journals')}
        />
      </div>

      {/* La modale de la Balance */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        startDate={globalDateStart}
        endDate={globalDateEnd}
      />

      {/* Modale d'Analyse des Indicateurs */}
      {isIndicatorsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10010] flex justify-center items-center p-2 sm:p-4 animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-purple-100 dark:border-purple-900/30">

            {/* En-tête Modale - Style TransactionView */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 flex items-center">
                  <Sparkles className="mr-2 sm:mr-3 text-purple-600 dark:text-purple-400 shrink-0" size={24} />
                  <span className="truncate">Analyse des Indicateurs Financiers</span>
                </h3>
                <p className="text-[10px] sm:text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">Auto-analyse intelligente de votre performance</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsIndicatorsModalOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors group"
                >
                  <XCircle className="text-gray-400 group-hover:text-red-500 transition-colors" size={24} />
                </button>
              </div>
            </div>

            {/* Corps scrollable */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">

                  {/* Section: Analyse IA */}
                  {aiAnalysis && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Période Analysée */}
                      {globalDateStart && globalDateEnd && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 inline-flex items-center space-x-2">
                          <Calendar size={14} className="text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            Analyse du {new Date(globalDateStart).toLocaleDateString('fr-FR')} au {new Date(globalDateEnd).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}

                      {/* Vue d'ensemble */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-5 rounded-xl border-l-4 border-purple-500 shadow-sm transition-all hover:shadow-md">
                        <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center">
                          <LayoutDashboard className="mr-2 text-purple-600" size={18} /> Vue d'Ensemble
                        </h4>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed font-medium">
                          "{aiAnalysis.vue_ensemble}"
                        </p>
                      </div>

                      {/* Analyse des Indicateurs Principaux */}
                      {aiAnalysis.indicateurs_principaux && (
                        <div className="bg-blue-50/30 dark:bg-blue-900/5 p-4 sm:p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                          <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center uppercase text-xs tracking-widest">
                            <BarChart3 className="mr-2 text-blue-600" size={16} /> Indicateurs Principaux
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiAnalysis.indicateurs_principaux.ca && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <BarChart2 size={14} className="mr-2 text-blue-500" /> CA
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.indicateurs_principaux.ca}</p>
                              </div>
                            )}
                            {aiAnalysis.indicateurs_principaux.caf && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Briefcase size={14} className="mr-2 text-blue-500" /> CAF
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.indicateurs_principaux.caf}</p>
                              </div>
                            )}
                            {aiAnalysis.indicateurs_principaux.ebe && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <DollarSign size={14} className="mr-2 text-blue-500" /> EBE
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.indicateurs_principaux.ebe}</p>
                              </div>
                            )}
                            {aiAnalysis.indicateurs_principaux.bfr && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Activity size={14} className="mr-2 text-blue-500" /> BFR
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.indicateurs_principaux.bfr}</p>
                              </div>
                            )}
                            {aiAnalysis.indicateurs_principaux.tresorerie && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Droplets size={14} className="mr-2 text-blue-500" /> Trésorerie
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.indicateurs_principaux.tresorerie}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Analyse des Ratios */}
                      {aiAnalysis.ratios && (
                        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-4 sm:p-5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                          <h5 className="font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center uppercase text-xs tracking-widest">
                            <TrendingUp className="mr-2 text-emerald-600" size={16} /> Ratios Financiers
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiAnalysis.ratios.rentabilite && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Activity size={14} className="mr-2 text-emerald-500" /> Rentabilité
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{aiAnalysis.ratios.rentabilite}</p>
                              </div>
                            )}
                            {aiAnalysis.ratios.liquidite && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Droplets size={14} className="mr-2 text-emerald-500" /> Liquidité
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{aiAnalysis.ratios.liquidite}</p>
                              </div>
                            )}
                            {aiAnalysis.ratios.endettement && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <AlertCircle size={14} className="mr-2 text-emerald-500" /> Endettement
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{aiAnalysis.ratios.endettement}</p>
                              </div>
                            )}
                            {aiAnalysis.ratios.activite && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <TrendingUp size={14} className="mr-2 text-emerald-500" /> Activité
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{aiAnalysis.ratios.activite}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Analyse des Graphiques et Visualisations */}
                      {aiAnalysis.graphiques && (
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center uppercase text-xs tracking-widest">
                            <PieChart className="mr-2 text-slate-500" size={16} /> Visualisations & Tendances
                          </h4>
                          <div className="space-y-4">
                            {aiAnalysis.graphiques.tendances && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <BarChart3 size={14} className="mr-2 text-indigo-500" /> Analyse des Tendances
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.graphiques.tendances}</p>
                              </div>
                            )}
                            {aiAnalysis.graphiques.repartition && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <PieChart size={14} className="mr-2 text-indigo-500" /> Répartition
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.graphiques.repartition}</p>
                              </div>
                            )}
                            {aiAnalysis.graphiques.insights_visuels && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h6 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center text-xs">
                                  <Sparkles size={14} className="mr-2 text-indigo-500" /> Insights Visuels
                                </h6>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.graphiques.insights_visuels}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Points Forts et Faibles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Points Forts */}
                        {aiAnalysis.points_forts && aiAnalysis.points_forts.length > 0 && (
                          <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 transition-all">
                            <h5 className="font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center text-xs sm:text-sm uppercase tracking-widest">
                              <CheckCircle className="mr-2" size={16} /> Points Forts
                            </h5>
                            <ul className="space-y-2">
                              {aiAnalysis.points_forts.map((point, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start leading-tight">
                                  <span className="text-emerald-500 mr-2 shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Points Faibles */}
                        {aiAnalysis.points_faibles && aiAnalysis.points_faibles.length > 0 && (
                          <div className="bg-red-50/30 dark:bg-red-900/5 p-4 rounded-xl border border-red-200/50 dark:border-red-800/30 transition-all">
                            <h5 className="font-bold text-red-800 dark:text-red-400 mb-3 flex items-center text-xs sm:text-sm uppercase tracking-widest">
                              <AlertCircle className="mr-2" size={16} /> Risques & Faiblesses
                            </h5>
                            <ul className="space-y-2">
                              {aiAnalysis.points_faibles.map((point, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start leading-tight">
                                  <span className="text-red-500 mr-2 shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Insights et Corrélations */}
                      {aiAnalysis.correlations_insights && aiAnalysis.correlations_insights.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/20 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center uppercase text-xs tracking-widest">
                            <Zap className="mr-2 text-indigo-500" size={16} /> Insights & Synthèse
                          </h4>
                          <ul className="space-y-3">
                            {aiAnalysis.correlations_insights.map((insight, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start leading-relaxed">
                                <span className="text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5 font-bold">{idx + 1}.</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommandations */}
                      {aiAnalysis.recommandations && aiAnalysis.recommandations.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center px-1 uppercase text-xs tracking-widest">
                            <Target className="mr-2 text-purple-600" size={16} /> Plan d'Action Recommandé
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aiAnalysis.recommandations.map((rec, idx) => {
                              const priorityColors = {
                                'URGENT': 'border-t-red-500 bg-red-50/30 dark:bg-red-900/10',
                                'IMPORTANT': 'border-t-orange-500 bg-orange-50/30 dark:bg-orange-900/10',
                                'SOUHAITABLE': 'border-t-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                              };
                              const priorityClass = priorityColors[rec.priorite] || priorityColors['SOUHAITABLE'];

                              return (
                                <div key={idx} className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm transition-all hover:shadow-lg border-t-4 group ${priorityClass}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${rec.priorite === 'URGENT' ? 'bg-red-100 text-red-700' :
                                      rec.priorite === 'IMPORTANT' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                      }`}>
                                      {rec.priorite}
                                    </span>
                                  </div>
                                  <h6 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {rec.action}
                                  </h6>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium capitalize">
                                    {rec.justification}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Erreur d'analyse */}
                  {analysisError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-2xl flex flex-col items-center text-center animate-shake">
                      <AlertCircle className="text-red-500 mb-4" size={56} />
                      <h4 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Analyse Interrompue</h4>
                      <p className="text-red-600 dark:text-red-400 mb-6 max-w-md">{analysisError}</p>
                      <button
                        onClick={handleAIAnalysis}
                        className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-xl shadow-red-200 dark:shadow-none active:scale-95 flex items-center space-x-2"
                      >
                        <Sparkles size={18} />
                        <span>Relancer l'Analyse</span>
                      </button>
                    </div>
                  )}
            </div>

            {/* Footer Modale */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50/50 dark:bg-gray-900/20">
              <button
                onClick={() => setIsIndicatorsModalOpen(false)}
                className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-200 dark:hover:shadow-none active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;