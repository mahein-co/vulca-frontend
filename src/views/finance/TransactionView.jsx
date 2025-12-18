import React, { useState, useMemo, useEffect } from 'react';
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
    Loader,
    Columns2,
    Calendar,
    Search
} from 'lucide-react';
import { BASE_URL_API } from '../../constants/globalConstants';

const ITEMS_PER_PAGE = 5;

const API_CONFIG = {
    bilanUrl: `${BASE_URL_API}/bilans/`,
    compteResultatUrl: `${BASE_URL_API}/CompteResultats/`,
    headers: { 'Content-Type': 'application/json' }
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
};

const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0,00 Ar';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(amount) + ' Ar';
};

const MetricCard = ({ title, value, icon: Icon, change, isRatio, description }) => {
    const numericChange = parseFloat(change);

    // Default dashboard-like pastel gradient
    let iconBg = 'bg-gradient-to-br from-emerald-50 to-teal-50';
    let iconColor = 'text-emerald-600';

    // Couleur de variation : VERT pour +, ROUGE pour - (pour toutes les cartes)
    let changeColor = numericChange >= 0 ? 'text-emerald-600' : 'text-red-600';

    // Couleurs d'icône spécifiques par type de carte
    if (title === 'Résultat Net') {
        iconBg = 'bg-gradient-to-br from-emerald-100 to-teal-100';
    } else if (title.includes('Ratio')) {
        iconBg = 'bg-gradient-to-br from-rose-50 to-red-50';
        iconColor = 'text-red-500';
    } else if (title.includes('Passif') || title.includes('Capitaux')) {
        iconBg = 'bg-gradient-to-br from-orange-50 to-amber-50';
        iconColor = 'text-orange-600';
    } else if (title.includes('Actif')) {
        iconBg = 'bg-gradient-to-br from-blue-50 to-indigo-50';
        iconColor = 'text-blue-600';
    }

    const changeIcon = numericChange > 0 ? '↑' : numericChange < 0 ? '↓' : '•';

    return (
        <div className="bg-white rounded-lg shadow-md border-t-2 border-gray-300 p-2 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-w-[140px] w-full h-[110px]">
            <div className="flex items-start justify-between mb-1">
                <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} shadow-sm`}>
                    <Icon size={18} />
                </div>
                {change !== undefined && change !== null && (
                    <div className={`text-[10px] font-bold ${changeColor} flex items-center bg-gray-50 px-1.5 py-0.5 rounded-full`}>
                        {isRatio
                            ? (!isNaN(numericChange) && <>{changeIcon} {Math.abs(numericChange).toFixed(1)} pts</>)
                            : <>{changeIcon} {numericChange >= 0 ? '+' : ''}{Math.abs(numericChange).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Ar</>
                        }
                    </div>
                )}
            </div>

            <div className="mt-1">
                <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
                <p className="text-[9px] text-gray-400 truncate">{description}</p>
            </div>
        </div>
    );
};

const PaginationControls = ({ currentPage, totalPages, totalItems, setCurrentPage }) => {
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages || totalPages === 0;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 sm:mb-0">
                Lignes <span className="font-semibold">{startItem}</span> à <span className="font-semibold">{endItem}</span> sur <span className="font-semibold">{totalItems}</span> (Page <span className="font-semibold">{currentPage}</span>/<span className="font-semibold">{totalPages || 1}</span>)
            </p>
            <div className="flex justify-center space-x-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={isPrevDisabled}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    <ChevronLeft size={14} className="mr-1" />
                    Préc.
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={isNextDisabled}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    Suiv.
                    <ChevronRight size={14} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

const TransactionView = () => {
    const [selectedSection, setSelectedSection] = useState('bilan');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [recherche, setRecherche] = useState('');
    const [bilanData, setBilanData] = useState([]);
    const [compteResultatData, setCompteResultatData] = useState([]);
    const [kpiData, setKpiData] = useState(null);
    const [bilanKpisData, setBilanKpisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NOUVELLE LOGIQUE DE PÉRIODE
    const [availableYears, setAvailableYears] = useState([]);
    const [periodMode, setPeriodMode] = useState('ANNUAL'); // 'ANNUAL', 'QUARTERLY', 'MONTHLY'
    const [selectedSubPeriod, setSelectedSubPeriod] = useState(null); // 'T1', 'M1', etc.

    // Le useEffect qui charge les années
    useEffect(() => {
        const fetchAvailableYears = async () => {
            try {
                const res = await fetch(`${BASE_URL_API}/journals/years/`);
                if (res.ok) {
                    const years = await res.json();
                    setAvailableYears(years);
                    // Toujours utiliser la dernière année de la base (première dans la liste triée)
                    if (years.length > 0) {
                        const latestYear = years[0].toString();
                        setSelectedYear(latestYear);
                        // Force update dates for the latest year
                        setDateDebut(`${latestYear}-01-01`);
                        setDateFin(`${latestYear}-12-31`);
                    }
                }
            } catch (e) {
                console.error("Erreur chargement années:", e);
            }
        };
        fetchAvailableYears();
    }, []);

    // EFFET: Calculer automatiquement les dates de début/fin quand les sélecteurs changent
    useEffect(() => {
        const year = parseInt(selectedYear);
        let start = `${year}-01-01`;
        let end = `${year}-12-31`;

        if (periodMode === 'QUARTERLY' && selectedSubPeriod) {
            // T1, T2, T3, T4
            const q = parseInt(selectedSubPeriod.replace('T', ''));
            const startMonth = (q - 1) * 3 + 1;
            const endMonth = startMonth + 2;

            // Format YYYY-MM-DD
            const sM = startMonth.toString().padStart(2, '0');
            const eM = endMonth.toString().padStart(2, '0');
            // Trouver le dernier jour du mois de fin
            const lastDay = new Date(year, endMonth, 0).getDate();

            start = `${year}-${sM}-01`;
            end = `${year}-${eM}-${lastDay}`;
        }
        else if (periodMode === 'MONTHLY' && selectedSubPeriod) {
            // M1 ... M12
            const m = parseInt(selectedSubPeriod.replace('M', ''));
            const sM = m.toString().padStart(2, '0');
            const lastDay = new Date(year, m, 0).getDate();

            start = `${year}-${sM}-01`;
            end = `${year}-${sM}-${lastDay}`;
        }

        setDateDebut(start);
        setDateFin(end);
    }, [selectedYear, periodMode, selectedSubPeriod]);

    const normalizeBilanData = (data) => data.map(item => ({
        numero_compte: item.numero_compte || '',
        libelle: item.libelle || '',
        categorie: item.categorie || '',
        montant_ar: parseFloat(item.montant_ar || 0),
        date: item.date || new Date().toISOString()
    }));

    const normalizeCompteResultatData = (data) => data.map(item => ({
        numero_compte: item.numero_compte || '',
        libelle: item.libelle || '',
        nature: item.nature || '',
        montant_ar: parseFloat(item.montant_ar || 0),
        date: item.date || new Date().toISOString()
    }));

    const fetchWithParams = async (url, params, normalizer, setter) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await fetch(`${url}?${queryParams}`, { headers: API_CONFIG.headers });
        if (!res.ok) throw new Error("Erreur lors du chargement des données");

        const json = await res.json();
        const data = Array.isArray(json) ? json : (json.results || []);
        setter(normalizer(data));
    };

    const fetchKPIs = async () => {
        try {
            const queryParams = new URLSearchParams({
                date_start: dateDebut,
                date_end: dateFin
            }).toString();

            // Charger les KPIs du Résultat Net et du Bilan en parallèle
            const [resNetRes, bilanKpisRes] = await Promise.all([
                fetch(`${BASE_URL_API}/resultat-net/?${queryParams}`, { headers: API_CONFIG.headers }),
                fetch(`${BASE_URL_API}/bilan-kpis-variations/?${queryParams}`, { headers: API_CONFIG.headers })
            ]);

            if (resNetRes.ok) {
                const data = await resNetRes.json();
                setKpiData(data);
            }

            if (bilanKpisRes.ok) {
                const data = await bilanKpisRes.json();
                setBilanKpisData(data);
            }
        } catch (e) {
            console.error("Erreur KPI:", e);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            // Ne charger que si les dates sont définies (après chargement des années disponibles)
            if (!dateDebut || !dateFin) {
                return;
            }

            setLoading(true);
            setError(null);
            setCurrentPage(1);
            try {
                // Charger les données en parallèle
                await Promise.all([
                    // Bilan = période (dateDebut -> dateFin) - Aligné avec le Compte de Résultat
                    fetchWithParams(API_CONFIG.bilanUrl, { date_start: dateDebut, date_end: dateFin }, normalizeBilanData, setBilanData),
                    // CR = période (dateDebut -> dateFin)
                    fetchWithParams(API_CONFIG.compteResultatUrl, { date_start: dateDebut, date_end: dateFin }, normalizeCompteResultatData, setCompteResultatData),
                ]);
                // Charger les KPIs séparément (ne pas bloquer si ça échoue)
                fetchKPIs();
            } catch (err) {
                console.error("Erreur chargement:", err);
                // Ne pas afficher d'erreur si les données sont quand même chargées
            }
            finally { setLoading(false); }
        };
        loadData();
    }, [dateDebut, dateFin]);

    const filterData = (details, isBilan = false) => {
        const searchLower = recherche.toLowerCase().trim();
        let filtered = details;

        // Filtrer par période d'exercice
        // Le backend a déjà filtré par période (date_start -> date_end) pour le Bilan et le CR
        if (dateDebut && dateFin) {
            filtered = filtered.filter(item => {
                // Robust String Comparison (YYYY-MM-DD)
                const itemDate = (item.date || '').substring(0, 10);
                const start = (dateDebut || '').substring(0, 10);
                const end = (dateFin || '').substring(0, 10);

                // Bilan et CR : tous deux par période
                return itemDate >= start && itemDate <= end;
            });
        } else if (selectedYear) {
            filtered = filtered.filter(item => {
                const itemYear = new Date(item.date).getFullYear().toString();
                return itemYear === selectedYear;
            });
        }

        // Filtrer par recherche
        if (searchLower) {
            filtered = filtered.filter(item =>
                item.numero_compte.toLowerCase().includes(searchLower) ||
                item.libelle.toLowerCase().includes(searchLower) ||
                (item.categorie || item.nature || '').toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    };

    const calculations = useMemo(() => {
        // IMPORTANT: Pour le Bilan, on spécifie isBilan=true pour éviter le filtre par date de début
        // Cela permet aux KPI (Actif, Passif) de refléter le cumul historique
        const bilan = filterData(bilanData, true);
        const compteResultat = filterData(compteResultatData, false);

        const actifCourant = bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const actifNonCourant = bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const passifCourant = bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const passifNonCourant = bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const capitauxPropresBilan = bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('capitaux')).reduce((a, b) => a + b.montant_ar, 0);

        const produits = compteResultat.filter(i => i.nature.toLowerCase().includes('produit')).reduce((a, b) => a + b.montant_ar, 0);
        const charges = compteResultat.filter(i => i.nature.toLowerCase().includes('charge')).reduce((a, b) => a + b.montant_ar, 0);

        // Use backend value if available, else fallback to local calculation
        const resultatNet = kpiData && kpiData.resultat_net !== undefined ? parseFloat(kpiData.resultat_net) : (produits - charges);

        // Formule : Capitaux Propres = Comptes catégorie CAPITAUX_PROPRES + Résultat Net de la période
        const capitauxPropresTotal = capitauxPropresBilan + resultatNet;

        const totalActif = actifCourant + actifNonCourant;
        const totalPassif = passifCourant + passifNonCourant + capitauxPropresTotal;

        const totalDettes = passifCourant + passifNonCourant;
        const endettementRatio = capitauxPropresTotal ? (totalDettes / capitauxPropresTotal * 100) : 0;

        // Backend provides variations
        const resultatNetChange = kpiData && kpiData.variation !== undefined ? parseFloat(kpiData.variation) : 0;

        // Variations des KPIs du Bilan depuis le nouvel endpoint
        const actifCourantChange = bilanKpisData?.variations?.actif_courant || 0;
        const actifNonCourantChange = bilanKpisData?.variations?.actif_non_courant || 0;
        const capitauxPropresChange = bilanKpisData?.variations?.capitaux_propres || 0;
        const passifCourantChange = bilanKpisData?.variations?.passif_courant || 0;
        const passifNonCourantChange = bilanKpisData?.variations?.passif_non_courant || 0;
        const endettementChange = bilanKpisData?.variations?.ratio_endettement || 0;

        return {
            actifCourant, actifNonCourant, passifCourant, passifNonCourant,
            capitauxPropres: capitauxPropresTotal, capitauxPropresBilan,
            totalActif, totalPassif, produits, charges, resultatNet,
            endettementRatio, totalDettes,
            bilanEquilibre: Math.abs(totalActif - totalPassif) < 0.01,
            resultatNetChange, endettementChange,
            actifCourantChange, actifNonCourantChange, capitauxPropresChange,
            passifCourantChange, passifNonCourantChange
        };
    }, [bilanData, compteResultatData, recherche, selectedYear, kpiData, bilanKpisData, dateDebut, dateFin]);

    const cards = [
        ['Actif Courant', calculations.actifCourant, calculations.actifCourantChange, false, DollarSign, 'Créances,Stocks,Trésorerie'],
        ['Actif Non Courant', calculations.actifNonCourant, calculations.actifNonCourantChange, false, Scale, 'Immobilisations'],
        ['Capitaux Propres', calculations.capitauxPropres, calculations.capitauxPropresChange, false, Users, 'Fonds propres '],
        ['Passif Courant', calculations.passifCourant, calculations.passifCourantChange, false, Briefcase, 'Dettes à court terme'],
        ['Passif Non Courant', calculations.passifNonCourant, calculations.passifNonCourantChange, false, Briefcase, 'Dettes à long terme'],
        ['Résultat Net', calculations.resultatNet, calculations.resultatNetChange, false, TrendingUp, 'benefice,perte'],
        ['Ratio Endettement', calculations.endettementRatio, calculations.endettementChange, true, FileText, 'Dettes/CP']
    ];

    const allDetails = useMemo(() => selectedSection === 'bilan' ? filterData(bilanData, true) : filterData(compteResultatData, false), [selectedSection, bilanData, compteResultatData, recherche, selectedYear, dateDebut, dateFin]);
    const totalPages = Math.ceil(allDetails.length / ITEMS_PER_PAGE);
    const totalItems = allDetails.length;
    const paginatedDetails = useMemo(() => allDetails.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [currentPage, allDetails]);

    return (
        <div className="mim-h-screen flex flex-col overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Période d'exercice */}
                {/* Période d'exercice */}
                {/* 1. PÉRIODE D'EXERCICE - Style Dashboard */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-2 transition-all hover:shadow-md">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                        {/* HEADER MOBILE/TABLET */}
                        <div className="flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                                    <Calendar size={18} />
                                </span>
                                Période d'exercice


                            </h2>
                            <p className="text-xs text-gray-500 font-medium ml-9">Sélectionnez la période à analyser</p>
                        </div>

                        {/* CONTROLS CONTAINER */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start sm:items-center flex-wrap">

                            {/* 1. ANNEE */}
                            <div className="relative group w-full sm:w-auto">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full sm:w-auto appearance-none bg-indigo-50 hover:bg-indigo-100 transition-colors border-0 text-indigo-700 text-sm font-bold rounded-lg py-2.5 pl-4 pr-10 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500 rotate-90" />
                            </div>

                            {/* 2. MODE SELECTOR */}
                            <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar w-full sm:w-auto">
                                {[
                                    { id: 'ANNUAL', label: 'Annuel' },
                                    { id: 'QUARTERLY', label: 'Trimestriel' },
                                    { id: 'MONTHLY', label: 'Mensuel' },
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => {
                                            setPeriodMode(mode.id);
                                            setSelectedSubPeriod(null);
                                        }}
                                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${periodMode === mode.id
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>

                            {/* 3. SUB-PERIOD SELECTOR (Animated) */}
                            {periodMode !== 'ANNUAL' && (
                                <div className="animate-fadeIn w-full sm:w-auto contents sm:block">
                                    <select
                                        value={selectedSubPeriod || ''}
                                        onChange={(e) => setSelectedSubPeriod(e.target.value)}
                                        className="w-full sm:w-40 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium shadow-sm transition-all hover:border-indigo-300"
                                    >
                                        <option value="">Choisir...</option>
                                        {periodMode === 'QUARTERLY' ? (
                                            <>
                                                <option value="T1">T1 (Jan-Mar)</option>
                                                <option value="T2">T2 (Avr-Jun)</option>
                                                <option value="T3">T3 (Juil-Sep)</option>
                                                <option value="T4">T4 (Oct-Déc)</option>
                                            </>
                                        ) : (
                                            Array.from({ length: 12 }, (_, i) => {
                                                const m = i + 1;
                                                const date = new Date(2000, i, 1);
                                                const monthName = date.toLocaleString('fr-FR', { month: 'long' });
                                                return <option key={`M${m}`} value={`M${m}`}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</option>;
                                            })
                                        )}
                                    </select>
                                </div>
                            )}

                        </div>

                        {/* DATE RANGE DISPLAY (Desktop: Right aligned) */}
                        <div className="hidden lg:flex items-center text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap ml-auto">
                            <Calendar size={12} className="mr-2 text-gray-400" />
                            {dateDebut} <span className="mx-2 text-gray-300">|</span> {dateFin}
                        </div>
                    </div>
                    {/* DATE RANGE DISPLAY (Mobile/Tablet only: Bottom full width) */}
                    <div className="lg:hidden mt-4 flex items-center justify-center text-xs font-mono text-gray-500 bg-gray-50 py-2 rounded-lg border-t border-gray-100 w-full">
                        <Calendar size={12} className="mr-2" />
                        {dateDebut} <span className="mx-2">→</span> {dateFin}
                    </div>
                </div>

                {/* 2. BARRE DE RECHERCHE */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="pl-2">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par compte, libellé..."
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            className="w-full p-2 border-0 focus:ring-0 text-sm placeholder-gray-400"
                        />
                    </div>
                </div>

                {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md flex items-start">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                    <div className="ml-3 flex-1">
                        <h3 className="text-base font-bold text-red-800 mb-1">Erreur de chargement</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="ml-4 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">Réessayer</button>
                </div>}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-4 px-2">
                    {loading ? [...Array(7)].map((_, i) => <div key={i} className="min-w-[150px] h-[100px] bg-gray-200 rounded-xl animate-pulse"></div>) :
                        cards.map(([title, value, change, isRatio, Icon, description], idx) => (
                            <MetricCard key={idx} title={title} value={isRatio ? value.toFixed(1) + '%' : formatCurrency(value)} icon={Icon} change={change} isRatio={isRatio} description={description} />
                        ))
                    }
                </div>

                {/* Bilan & Compte Résultat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 px-2">
                    <div onClick={() => { setSelectedSection('bilan'); setCurrentPage(1); }}
                        className={`p-3.5 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'bilan' ? 'border-t-4 border-indigo-500 scale-[1.005]' : 'border-t-2 border-gray-300 hover:border-indigo-300'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600">
                                <Scale size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Bilan</h3>
                            {calculations.bilanEquilibre ? <CheckCircle size={14} className="text-emerald-500 ml-auto" /> : <XCircle size={14} className="text-red-500 ml-auto" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2 ml-1 leading-tight">Situation financière à une date donnée (Actifs = Passifs + Capitaux Propres).</p>
                        <div className='text-[10px] sm:text-xs space-y-1 text-gray-700 px-1'>
                            <p className="flex justify-between"><span>Total Actif :</span> <span className="font-bold text-indigo-700">{formatCurrency(calculations.totalActif)}</span></p>
                            <p className="flex justify-between"><span>Total Passif (Dettes + CP) :</span> <span className="font-bold text-indigo-700">{formatCurrency(calculations.totalPassif)}</span></p>
                        </div>
                    </div>
                    <div onClick={() => { setSelectedSection('compteResultat'); setCurrentPage(1); }}
                        className={`p-3 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'compteResultat' ? 'border-t-4 border-emerald-500 scale-[1.005]' : 'border-t-2 border-gray-300 hover:border-emerald-300'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
                                <DollarSign size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Compte de Résultat</h3>
                            <CheckCircle size={14} className="text-emerald-500 ml-auto" />
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2 ml-1 leading-tight">Synthèse des produits et charges pour calculer le résultat net.</p>
                        <div className='text-[10px] sm:text-xs space-y-1 text-gray-700 px-1'>
                            <p className="flex justify-between"><span>Produits :</span> <span className="font-bold text-emerald-700">{formatCurrency(calculations.produits)}</span></p>
                            <p className="flex justify-between"><span>Charges :</span> <span className="font-bold text-emerald-700">{formatCurrency(calculations.charges)}</span></p>
                            <p className="flex justify-between border-t border-gray-100 pt-1"><span>Résultat Net :</span> <span className={`font-bold ${calculations.resultatNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(calculations.resultatNet)}</span></p>
                        </div>
                    </div>
                </div>

                {/* Table des détails */}
                <div className="px-2 flex-1 min-h-0 ">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs sm:text-sm min-w-[800px] table-fixed">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-gray-800 text-white">
                                        <th className="w-[15%] px-2 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-bold uppercase tracking-wide">Date</th>
                                        <th className="w-[10%] px-2 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-bold uppercase tracking-wide">Compte</th>
                                        <th className="w-[40%] px-2 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-bold uppercase tracking-wide">Libellé</th>
                                        {selectedSection === 'bilan' ?
                                            <th className="w-[20%] px-2 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-bold uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                                            : <th className="w-[20%] px-2 sm:px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm font-bold uppercase tracking-wide hidden md:table-cell">Nature</th>
                                        }
                                        <th className="w-[15%] px-2 sm:px-3 py-2 sm:py-2.5 text-right text-xs sm:text-sm font-bold uppercase tracking-wide">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {loading ? [...Array(ITEMS_PER_PAGE)].map((_, i) =>
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(5)].map((_, j) =>
                                                <td key={j} className="border-b border-gray-100 px-3 py-2.5">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                            )}
                                        </tr>
                                    ) : paginatedDetails.map((item, idx) => (
                                        <tr key={idx} className={`hover:bg-emerald-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 font-semibold">{formatDate(item.date)}</td>
                                            <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-xs">
                                                <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">{item.numero_compte}</span>
                                            </td>
                                            <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-gray-800 font-medium truncate max-w-[150px] sm:max-w-none">{item.libelle}</td>
                                            <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 hidden md:table-cell">
                                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] font-bold rounded-full ${selectedSection === 'bilan'
                                                    ? item.categorie?.toLowerCase().includes('actif')
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : item.categorie?.toLowerCase().includes('passif') || item.categorie?.toLowerCase().includes('capitaux')
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    : item.nature?.toLowerCase().includes('produit')
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {(item.categorie || item.nature || '').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-right font-bold text-gray-900">{formatCurrency(item.montant_ar)}</td>
                                        </tr>
                                    ))}
                                    {(!loading && paginatedDetails.length < ITEMS_PER_PAGE) && (
                                        Array.from({ length: ITEMS_PER_PAGE - paginatedDetails.length }).map((_, idx) => (
                                            <tr key={`empty-${idx}`} className="bg-white">
                                                <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                                                <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                                                <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none">-</td>
                                                <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none hidden md:table-cell">-</td>
                                                <td className="border-b border-gray-100 px-2 sm:px-3 py-2 sm:py-2.5 text-transparent select-none text-right">-</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setCurrentPage={setCurrentPage} />
            </main>
        </div>
    );
};

export default TransactionView;