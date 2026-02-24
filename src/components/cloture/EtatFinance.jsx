import React, { useState, useMemo, useEffect } from 'react';
import LoadingOverlay from '../layout/LoadingOverlay';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage, selectActiveFilter } from '../../states/dashboard/dashboardFilterSlice';
import FilterManager from '../dashboard/FilterManager';
import {
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CheckCircle,
  XCircle,
  Scale,
  DollarSign,
  Users,
  Briefcase,
  AlertCircle,
  Loader
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

// Configuration API - À MODIFIER selon votre backend
const API_CONFIG = {
  bilanUrl: 'https://votre-api.com/api/bilan',
  compteResultatUrl: 'https://votre-api.com/api/compte-resultat',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_TOKEN' // Si nécessaire
  }
};

const MetricCard = ({ title, value, icon: Icon, change, isRatio }) => {
  let changeIcon, changeColor, cardBg, cardBorder, cardText;

  if (title === 'Résultat Net') {
    cardBg = 'bg-white';
    cardBorder = 'border-emerald-400';
    cardText = 'text-emerald-700';
  } else if (title === 'Ratio Endettement') {
    cardBg = 'bg-white';
    cardBorder = 'border-red-400';
    cardText = 'text-red-700';
  } else {
    cardBg = 'bg-white';
    cardBorder = 'border-gray-200';
    cardText = 'text-indigo-700';
  }

  if (isRatio) {
    changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '•';
    changeColor =
      change > 0 ? 'text-red-600' :
        change < 0 ? 'text-green-600' :
          'text-gray-400';
  } else if (change !== undefined && change !== null) {
    changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '•';
    changeColor =
      change > 0 ? 'text-green-600' :
        change < 0 ? 'text-red-600' :
          'text-gray-400';
  }

  let variationMessage = null;
  if (title === 'Résultat Net') {
    if (change === null || change === undefined) {
      variationMessage = `Aucune donnée précédente`;
    } else if (change === 0) {
      variationMessage = `Stable`;
    } else {
      const montant = Math.abs(change).toLocaleString('fr-FR') + ' Ar';
      variationMessage = `${change > 0 ? '+' : '-'} ${montant}`;
    }
  }

  return (
    <div className={`${cardBg} border ${cardBorder} rounded-lg p-3 flex flex-col items-start shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] group w-[165px] h-[100px] min-w-[165px] max-w-[165px] min-h-[100px] max-h-[100px]`}>
      <div className="flex items-center gap-2 w-full mb-1">
        <div className={`p-1 rounded-full ${cardText} bg-white border ${cardBorder} shadow group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tight mb-0.5 whitespace-normal leading-tight">{title}</p>
          <p className={`text-[10px] sm:text-xs font-extrabold ${cardText} mb-0.5 whitespace-normal break-words leading-tight`}>{value}</p>
        </div>
      </div>
      {title === 'Résultat Net' && variationMessage && (
        <div className={`mt-0.5 text-[10px] font-bold ${changeColor} w-full text-right`}>
          <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 shadow-sm">{variationMessage}</span>
        </div>
      )}
      {title !== 'Résultat Net' && (change !== undefined && change !== null || isRatio) && (
        <div className={`mt-0.5 text-[10px] font-bold ${changeColor} w-full text-right`}>
          <span className="inline-block px-1.5 py-0.5 rounded-full bg-gray-100 shadow-sm">{changeIcon} {Math.abs(change)}{!isRatio ? '%' : '%'}</span>
        </div>
      )}
    </div>
  );
};

const PaginationControls = ({ currentPage, totalPages, setCurrentPage }) => {
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex justify-between items-center mt-0 p-4 bg-gray-100 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Page <span className="font-semibold">{currentPage}</span> sur <span className="font-semibold">{totalPages}</span>
      </p>
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={isPrevDisabled}
          className="px-4 py-2 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
        >
          <ChevronLeft size={16} className="mr-1" />
          Précédent
        </button>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={isNextDisabled}
          className="px-4 py-2 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
        >
          Suivant
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(amount) + ' Ar';

const EtatFinance = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('Annuel');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  // États pour les données API
  const [bilanData, setBilanData] = useState([]);
  const [compteResultatData, setCompteResultatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState({
    resultatNetPrevious: null,
    endettementPrevious: 35
  });

  // Fonction pour normaliser les données du Bilan
  const normalizeBilanData = (data) => {
    // Si data est un tableau, on le retourne tel quel
    if (Array.isArray(data)) {
      return data.map(item => ({
        numeroCompte: item.numeroCompte || item.compte || item.code || '',
        libelle: item.libelle || item.label || item.description || '',
        categorie: item.categorie || item.category || item.type || '',
        montant: parseFloat(item.montant || item.amount || item.value || 0),
        date: item.date || new Date().toISOString()
      }));
    }

    // Si data est un objet avec une propriété contenant le tableau
    if (data.details) return normalizeBilanData(data.details);
    if (data.bilan) return normalizeBilanData(data.bilan);
    if (data.data) return normalizeBilanData(data.data);
    if (data.results) return normalizeBilanData(data.results);

    return [];
  };

  // Fonction pour normaliser les données du Compte de Résultat
  const normalizeCompteResultatData = (data) => {
    if (Array.isArray(data)) {
      return data.map(item => ({
        numeroCompte: item.numeroCompte || item.compte || item.code || '',
        libelle: item.libelle || item.label || item.description || '',
        nature: item.nature || item.type || item.category || '',
        montant: parseFloat(item.montant || item.amount || item.value || 0),
        date: item.date || new Date().toISOString()
      }));
    }

    // Si data est un objet avec une propriété contenant le tableau
    if (data.details) return normalizeCompteResultatData(data.details);
    if (data.compteResultat) return normalizeCompteResultatData(data.compteResultat);
    if (data.data) return normalizeCompteResultatData(data.data);
    if (data.results) return normalizeCompteResultatData(data.results);

    return [];
  };

  // Fonction pour récupérer les données du Bilan
  const fetchBilanData = async () => {
    try {
      const response = await fetch(API_CONFIG.bilanUrl, {
        method: 'GET',
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const normalizedData = normalizeBilanData(data);
      setBilanData(normalizedData);

      console.log('Données Bilan récupérées:', normalizedData);
    } catch (err) {
      console.error('Erreur lors de la récupération du bilan:', err);
      throw err;
    }
  };

  // Fonction pour récupérer les données du Compte de Résultat
  const fetchCompteResultatData = async () => {
    try {
      const response = await fetch(API_CONFIG.compteResultatUrl, {
        method: 'GET',
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const normalizedData = normalizeCompteResultatData(data);
      setCompteResultatData(normalizedData);

      console.log('Données Compte de Résultat récupérées:', normalizedData);
    } catch (err) {
      console.error('Erreur lors de la récupération du compte de résultat:', err);
      throw err;
    }
  };

  const dispatch = useDispatch();

  // NOUVEAU: Synchroniser la page actuelle pour le chatbot
  useEffect(() => {
    dispatch(setCurrentPage("finance"));
  }, [dispatch]);

  // NOUVEAU: Synchroniser avec le filtre global
  const activeFilter = useSelector(selectActiveFilter);
  useEffect(() => {
    if (activeFilter && activeFilter.type === 'date') {
      const { start, end } = activeFilter.value;
      const d = new Date(start);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        // On pourrait aussi extraire le mois/trimestre mais le filtrage par date range dans calculations est plus précis
      }
    }
  }, [activeFilter]);

  // Chargement initial des données

  // Fonction de filtrage par période
  const filterByPeriod = (details) => {
    if (!details || !Array.isArray(details)) return [];

    return details.filter(item => {
      if (!item.date) return true;

      const d = new Date(item.date);
      if (isNaN(d.getTime())) return true;

      if (d.getFullYear() !== Number(selectedYear)) return false;
      if (selectedPeriod === 'Annuel') return true;
      if (selectedPeriod === 'Mensuel') return d.getMonth() + 1 === Number(selectedMonth);
      if (selectedPeriod === 'Trimestriel') return Math.floor(d.getMonth() / 3) + 1 === Number(selectedQuarter);
      return true;
    });
  };

  // Calculs financiers
  const calculations = useMemo(() => {
    const bilan = filterByPeriod(bilanData);
    const compteResultat = filterByPeriod(compteResultatData);

    const actifCourant = bilan
      .filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && i.categorie.toLowerCase().includes('courant'))
      .reduce((a, b) => a + b.montant, 0);

    const actifNonCourant = bilan
      .filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && !i.categorie.toLowerCase().includes('courant'))
      .reduce((a, b) => a + b.montant, 0);

    const passifCourant = bilan
      .filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && i.categorie.toLowerCase().includes('courant'))
      .reduce((a, b) => a + b.montant, 0);

    const passifNonCourant = bilan
      .filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && !i.categorie.toLowerCase().includes('courant'))
      .reduce((a, b) => a + b.montant, 0);

    const capitauxPropres = bilan
      .filter(i => i.categorie && (i.categorie.toLowerCase().includes('capitaux') || i.categorie.toLowerCase().includes('propres')))
      .reduce((a, b) => a + b.montant, 0);

    const totalActif = actifCourant + actifNonCourant;
    const totalPassif = passifCourant + passifNonCourant + capitauxPropres;

    const produits = compteResultat
      .filter(i => i.nature && (i.nature.toLowerCase().includes('produit') || i.nature.toLowerCase().includes('revenue')))
      .reduce((a, b) => a + b.montant, 0);

    const charges = compteResultat
      .filter(i => i.nature && (i.nature.toLowerCase().includes('charge') || i.nature.toLowerCase().includes('expense')))
      .reduce((a, b) => a + b.montant, 0);

    const resultatNet = produits - charges;
    const endettementRatio = capitauxPropres ? ((passifCourant + passifNonCourant) / capitauxPropres * 100) : 0;

    let resultatNetChange;
    if (historicalData.resultatNetPrevious === null ||
      historicalData.resultatNetPrevious === undefined ||
      isNaN(historicalData.resultatNetPrevious) ||
      !isFinite(historicalData.resultatNetPrevious)) {
      resultatNetChange = null;
    } else {
      resultatNetChange = resultatNet - historicalData.resultatNetPrevious;
    }

    const endettementChange = historicalData.endettementPrevious
      ? (endettementRatio - historicalData.endettementPrevious).toFixed(1)
      : null;

    return {
      actifCourant,
      actifNonCourant,
      passifCourant,
      passifNonCourant,
      capitauxPropres,
      totalActif,
      totalPassif,
      produits,
      charges,
      resultatNet,
      endettementRatio,
      bilanEquilibre: Math.abs(totalActif - totalPassif) < 0.01,
      resultatNetChange,
      endettementChange
    };
  }, [bilanData, compteResultatData, selectedPeriod, selectedYear, selectedMonth, selectedQuarter, historicalData, activeFilter]);

  const cards = [
    ['Actif Courant', calculations.actifCourant, null, false, DollarSign],
    ['Actif Non Courant', calculations.actifNonCourant, null, false, Scale],
    ['Capitaux Propres', calculations.capitauxPropres, null, false, Users],
    ['Passif Courant', calculations.passifCourant, null, false, Briefcase],
    ['Passif Non Courant', calculations.passifNonCourant, null, false, Briefcase],
    ['Résultat Net', calculations.resultatNet, calculations.resultatNetChange, false, TrendingUp],
    ['Ratio Endettement', calculations.endettementRatio.toFixed(1), calculations.endettementChange, true, FileText]
  ];

  const allDetails = useMemo(() => {
    if (!selectedSection) return [];
    return selectedSection === 'bilan'
      ? filterByPeriod(bilanData)
      : filterByPeriod(compteResultatData);
  }, [selectedSection, bilanData, compteResultatData, selectedPeriod, selectedYear, selectedMonth, selectedQuarter]);

  const totalPages = Math.ceil(allDetails.length / ITEMS_PER_PAGE);

  const paginatedDetails = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allDetails.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, allDetails]);

  // Affichage pendant le chargement
  if (loading) {
    return <LoadingOverlay message="Chargement des données financières..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* NOUVEAU: Filtre Chatbot ici aussi */}
        <FilterManager page="finance" />

        {/* Message d'erreur en bandeau rouge */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-red-800 mb-1">Erreur de chargement</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition flex-shrink-0"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-extrabold text-gray-800 mb-5 flex items-center">
          <Wallet className="mr-2 text-indigo-600" size={24} />
          Tableau de bord Financier
        </h1>

        <div className="flex gap-2 items-center mb-6 flex-wrap">
          <select value={selectedPeriod} onChange={e => { setSelectedPeriod(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="Annuel">Annuel</option>
            <option value="Trimestriel">Trimestriel</option>
            <option value="Mensuel">Mensuel</option>
          </select>
          <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {selectedPeriod === 'Mensuel' && (
            <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          )}
          {selectedPeriod === 'Trimestriel' && (
            <select value={selectedQuarter} onChange={e => { setSelectedQuarter(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {[1, 2, 3, 4].map(q => <option key={q} value={q}>{`T${q}`}</option>)}
            </select>
          )}
        </div>

        <div className="flex gap-2 pb-2 overflow-x-auto mb-6">
          {cards.map(([title, value, change, isRatio, Icon], idx) => (
            <div key={idx} className="flex-shrink-0">
              <MetricCard
                title={title}
                value={isRatio ? value + '%' : formatCurrency(value)}
                icon={Icon}
                change={change}
                isRatio={isRatio}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div
            onClick={() => { setSelectedSection('bilan'); setCurrentPage(1); }}
            className="p-6 bg-white border rounded-xl shadow hover:border-indigo-400 cursor-pointer transition-all duration-300"
          >
            <h2 className="text-xl font-bold flex gap-2 text-indigo-600">
              <Scale /> Bilan
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Actif :</span>
                <span className="font-bold text-indigo-700">{formatCurrency(calculations.totalActif)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Passif :</span>
                <span className="font-bold text-indigo-700">{formatCurrency(calculations.totalPassif)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {calculations.bilanEquilibre
                ? <CheckCircle className="text-green-600" />
                : <XCircle className="text-red-600" />}
              <span className="font-semibold text-sm">
                {calculations.bilanEquilibre ? "Bilan équilibré" : "Bilan déséquilibré"}
              </span>
            </div>
          </div>

          <div
            onClick={() => { setSelectedSection('compteResultat'); setCurrentPage(1); }}
            className="p-6 bg-white border rounded-xl shadow hover:border-emerald-400 cursor-pointer transition-all duration-300"
          >
            <h2 className="text-xl font-bold flex gap-2 text-emerald-600">
              <TrendingUp /> Compte de Résultat
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Produits :</span>
                <span className="font-bold text-emerald-700">{formatCurrency(calculations.produits)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Charges :</span>
                <span className="font-bold text-emerald-700">{formatCurrency(calculations.charges)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-base text-emerald-800">Résultat Net :</span>
              <span className="font-extrabold text-base text-emerald-800">{formatCurrency(calculations.resultatNet)}</span>
            </div>
          </div>
        </div>

        {selectedSection && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <h2 className="text-lg font-bold p-4 text-gray-800 border-b border-gray-200">
              Détails du {selectedSection === 'bilan' ? 'Bilan' : 'Compte de Résultat'} (Période Filtrée)
            </h2>
            <div className="overflow-x-auto relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Compte</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Libellé</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      {selectedSection === 'bilan' ? 'Catégorie' : 'Nature'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Montant (Ar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedDetails.length > 0 ? (
                    paginatedDetails.map((item, i) => (
                      <tr key={i} className={`transition duration-150 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">{item.numeroCompte}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 max-w-[250px] truncate">{item.libelle}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.categorie || item.nature}</td>
                        <td className="px-4 py-2 text-right text-sm text-indigo-700 font-bold font-mono">{formatCurrency(item.montant)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500 bg-gray-50">Aucune donnée trouvée pour la période sélectionnée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EtatFinance;