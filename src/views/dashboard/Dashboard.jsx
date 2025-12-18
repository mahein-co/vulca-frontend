import React, { useState, useEffect } from 'react';
import BalanceModal from '../balance/BalanceModal';

import BarCharts from '../../components/charts/BarCharts';
import TvaBarChart from '../../components/charts/TvaBarChart';
import PieChartRepartition from '../../components/charts/PieChartRepartition';
import LineChartCAEvolution from '../../components/charts/LineChartCAEvolution';
import { BASE_URL_API } from '../../constants/globalConstants';






// --- 2. Composants de Support ---

const JournalRepartition = ({ globalStartDate, globalEndDate }) => {
  const [totalFormatted, setTotalFormatted] = useState('0 Ar');
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
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Répartition par journal</h3>
      {journals.map((journal) => (
        <div key={journal.name} className="mb-3">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
            <span className="font-medium text-gray-700">
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
            <span className="text-gray-800 font-medium">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', currencyDisplay: 'narrowSymbol' }).format(journal.amount).replace('MGA', 'Ar')}
              <span className="text-gray-500 ml-1">({journal.percentage}%)</span>
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-2 ${journal.color} rounded-full transition-all duration-300`}
              style={{ width: `${journal.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between">
        <span className="font-semibold text-gray-700">Total</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900">{totalFormatted}</span>
      </div>

      {/* Modal Journal Detail */}
      {/* Modal Journal Detail - STYLE EXACT BALANCE MODAL */}
      {selectedJournal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-2 sm:p-4">

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl h-[95vh] sm:h-[90vh] lg:h-[85vh] flex flex-col border-t-2 border-gray-300">

            {/* En-tête de la modale */}
            <div className="flex-none p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center z-10 bg-white rounded-t-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${selectedJournal.color} mr-2 sm:mr-3 shadow-sm`}></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Journal : {selectedJournal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats cards - Style Balance */}
            <div className="flex-none p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Montant Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', currencyDisplay: 'narrowSymbol' }).format(selectedJournal.amount).replace('MGA', 'Ar')}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Part du total</p>
                  <p className="text-lg font-bold text-gray-900">{selectedJournal.percentage}%</p>
                </div>
              </div>
            </div>

            {/* Barre de Filtres - Style Balance */}
            <div className="flex-none px-4 py-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              <div className="w-full">
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
            <div className="flex-grow overflow-y-auto p-2 sm:p-4 min-h-0 bg-white">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm whitespace-nowrap min-w-[500px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-800 text-white">
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
                        <tr key={idx} className={`hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-gray-600 font-medium text-xs sm:text-sm hidden sm:table-cell">{entry.date}</td>
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">{entry.numero_compte}</span>
                          </td>
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-gray-800 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{entry.libelle}</td>
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                            {Number(entry.debit_ar) > 0 ? (
                              <span className="text-red-600 font-semibold">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(entry.debit_ar))} Ar</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm">
                            {Number(entry.credit_ar) > 0 ? (
                              <span className="text-emerald-600 font-semibold">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(entry.credit_ar))} Ar</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Lignes vides pour maintenir la hauteur fixe (Filler Rows) */}
                      {Array.from({ length: Math.max(0, itemsPerPage - journalEntries.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="bg-white">
                          <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none hidden sm:table-cell">-</td>
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

            {/* Footer avec Pagination Fixe - Style Balance */}
            <div className="flex-none p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-0">
                <p className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
                  <span className="font-semibold">{totalEntriesCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> - <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalEntriesCount)}</span> / <span className="font-semibold">{totalEntriesCount}</span>
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
                    {currentPage}/{totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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

  // CHARGEMENT OPTIMISÉ (1 seul appel API)
  useEffect(() => {
    setLoadingIndicators(true);
    let url = `${BASE_URL_API}/dashboard/indicators/?`;
    if (globalDateStart) url += `date_start=${globalDateStart}&`;
    if (globalDateEnd) url += `date_end=${globalDateEnd}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setIndicators({
          ca: data.ca || 0,
          ebe: data.ebe || 0,
          resultatNet: data.resultat_net || 0,
          caf: data.caf || 0,
          bfr: data.bfr || 0,
          leverage: data.leverage || 0,
          totalBalance: data.total_balance || 0,
          ratios: data.ratios || {}
        });
      })
      .catch(err => console.error("Erreur chargement indicateurs dashboard:", err))
      .finally(() => setLoadingIndicators(false));
  }, [globalDateStart, globalDateEnd]);


  // ✅ SUMMARY CARDS DYNAMIQUE
  const formattedLeverage = (() => {
    const n = Number(indicators.leverage);
    return Number.isFinite(n) ? n.toFixed(2) : '—';
  })();
  const summaryCards = [
    {
      title: "Chiffre d'affaires",
      value: loadingIndicators
        ? "..."
        : `Ar ${Number(indicators.ca).toLocaleString("fr-FR")}`,
      icon: '📊',
      action: 'none'
    },
    {
      title: "CAF",
      value: `Ar ${Number(indicators.caf).toLocaleString("fr-FR")}`,
      unit: "Capacité d'Autofinancement",
      icon: "🏦"
    },
    {
      title: "EBE",
      value: `Ar ${Number(indicators.ebe).toLocaleString("fr-FR")}`,
      unit: "Excédent Brut d'Exploitation",
      icon: "💰",
      action: 'none'
    },
    {
      title: "Bénéfice net",
      value: `Ar ${Number(indicators.resultatNet).toLocaleString("fr-FR")}`,
      unit: "Bénéfice net",
      icon: "📈"
    },
    {
      title: 'BALANCE',
      value: `Ar ${Number(indicators.totalBalance).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      icon: '⚖️',
      action: 'openBalance'
    },
    {
      title: "Leverage brut",
      value: formattedLeverage,
      unit: "Endettement / EBE",
      icon: "📊",
      action: 'none'
    },
    {
      title: "BFR",
      value: `Ar ${Number(indicators.bfr).toLocaleString("fr-FR")}`,
      unit: "Besoin en Fonds de Roulement",
      icon: "💵"
    },
  ];


  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  return (
    <div className="px-4 sm:px-0 bg-gradient-to-br from-gray-50 to-slate-50 min-h-screen">

      {/* 1. Sélecteur de Période */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-3 sm:p-4 rounded-lg shadow-md border-t-2 border-gray-300">
        <div className="mb-2 sm:mb-0">
          <p className="font-semibold text-gray-800">Période d'exercice</p>
          <p className="text-xs text-gray-500">Sélectionnez la période à analyser</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm">
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 text-xs sm:text-sm">Du</label>
            <input
              type="date"
              value={globalDateStart}
              onChange={(e) => setGlobalDateStart(e.target.value)}
              className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 text-xs sm:text-sm">Au</label>
            <input
              type="date"
              value={globalDateEnd}
              onChange={(e) => setGlobalDateEnd(e.target.value)}
              className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
          </div>
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-900 font-medium shadow-sm transition-all">
            11 déc. 2024 - 10 déc. 2025
          </button>
        </div>
      </div>

      {/* 2. Cartes de Résumé */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 mb-6 items-start">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-start text-left p-2 sm:p-3 rounded-lg shadow-sm bg-white border-t border-gray-200 h-24 sm:h-28 ${card.action === 'openBalance' ? 'cursor-pointer hover:shadow-md hover:border-emerald-400' : 'hover:shadow-md'} transition-all duration-150`}
            onClick={card.action === 'openBalance' ? () => handleCardClick(card.action) : null}
          >
            <div className="p-1 rounded-md mr-3 bg-emerald-50 text-emerald-300 flex-shrink-0">
              <span className="text-xl">{card.icon}</span>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{card.title}</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 my-0.5">{card.value}</p>
              {card.unit && <p className="text-[11px] text-gray-400">{card.unit}</p>}
            </div>
          </div>
        ))}
      </div>


      {/* 6. Autres indicateurs (Alertes & Risques + Rentabilité) */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300 mb-4">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3 text-gray-400">📊</span>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Autres indicateurs</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alertes & Risques */}
          <div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-semibold">Indicateur</th>
                    <th className="px-4 py-3 font-semibold text-right">Ratio</th>
                    <th className="px-4 py-3 font-semibold text-right">Seuil</th>
                    <th className="px-4 py-3 font-semibold text-center">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {/* ANNUITÉ / CAF */}
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      Annuité d'emprunt / CAF
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">
                      {indicators.ratios && indicators.ratios.annuite_caf ? Number(indicators.ratios.annuite_caf.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">
                      &lt; 0.50
                    </td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.annuite_caf && indicators.ratios.annuite_caf.alerte ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">⚠ Alerte</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* DETTE / CAF */}
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">Dette LMT / CAF</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {indicators.ratios && indicators.ratios.dette_caf ? Number(indicators.ratios.dette_caf.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      &lt; 3.50
                    </td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.dette_caf && indicators.ratios.dette_caf.alerte ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* RESULTAT NET / CA (Marge Nette) */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      Résultat net / Chiffre d'affaires
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {indicators.ratios && indicators.ratios.marge_nette ? Number(indicators.ratios.marge_nette.value).toFixed(2) + " %" : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      ≥ 10 %
                    </td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.marge_nette ? (
                        Number(indicators.ratios.marge_nette.value) < 5 ? (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Faible</span>
                        ) : Number(indicators.ratios.marge_nette.value) < 10 ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Correct</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Excellent</span>
                        )
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">N/A</span>
                      )}
                    </td>
                  </tr>

                  {/* CHARGE FINANCIERE / EBE */}
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      Charge financière / EBE
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {indicators.ratios && indicators.ratios.fi_ebe ? Number(indicators.ratios.fi_ebe.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      &lt; 0.30
                    </td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.fi_ebe && indicators.ratios.fi_ebe.alerte ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* CHARGE FI / CA */}
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">Charge financière / CA</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {indicators.ratios && indicators.ratios.fi_ca ? (Number(indicators.ratios.fi_ca.value) * 100).toFixed(2) + " %" : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">&lt; 5%</td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.fi_ca && indicators.ratios.fi_ca.alerte ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>

                  {/* GEARING (Dette CMLT / Fonds Propres) */}
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">Marge d'endettement (CMLT / FP)</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {indicators.ratios && indicators.ratios.gearing ? Number(indicators.ratios.gearing.value).toFixed(2) : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      &lt; 1.3
                    </td>
                    <td className="px-4 py-3 text-center">
                      {indicators.ratios && indicators.ratios.gearing && indicators.ratios.gearing.alerte ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Alerte</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rentabilité */}
          <div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-semibold">Indicateur</th>
                    <th className="px-4 py-3 font-semibold text-right">Valeur</th>
                    <th className="px-4 py-3 font-semibold text-right">Variation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Return on Equity (ROE)</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">12.5%</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">↘ -1.5%</td>
                  </tr>
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Return on Assets (ROA)</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">8.7%</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +0.8%</td>
                  </tr>

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Current Ratio</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">1.8</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +0.1</td>
                  </tr>

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Quick Ratio</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">1.2</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +0.05</td>
                  </tr>

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Gearing</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">45%</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">↘ -2%</td>
                  </tr>

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Rotation des stocks</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">6x</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +0.5x</td>
                  </tr>

                  {/* <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Délais clients</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">45 j</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↘ -3 j</td>
                  </tr>

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Délais fournisseurs</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">60 j</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↘ -2 j</td>
                  </tr> */}

                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Marge opérationnelle</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">15.3%</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +2.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* 3. Graphique d'Évolution du Chiffre d'Affaires */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Évolution du Chiffre d'Affaires</h3>
        <LineChartCAEvolution />
      </div>

      {/* 4. Top 10 comptes mouvementés + TVA côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch mb-4">
        <div>
          <BarCharts />
        </div>
        <div>
          <TvaBarChart />
        </div>
      </div>

      {/* 5. Produits et Charges */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Répartition Produits et Charges</h3>
        </div>
        <PieChartRepartition />
      </div>

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
    </div>
  );
};

export default Dashboard;