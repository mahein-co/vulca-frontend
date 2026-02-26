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
    Search,
    Sparkles,
    Trash2,
    Edit2,
    Plus,
    CheckSquare,
    Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingOverlay from '../../components/layout/LoadingOverlay';
import { fetchWithReauth } from '../../utils/apiUtils';
import { BASE_URL_API } from '../../constants/globalConstants';
import { useProjectId } from '../../hooks/useProjectId';

const ITEMS_PER_PAGE = 30;

const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const projectId = localStorage.getItem("selectedProjectId");
    if (projectId) {
        headers['X-Project-ID'] = projectId;
    }
    return headers;
};

const API_CONFIG = {
    bilanUrl: `${BASE_URL_API}/bilans/`,
    compteResultatUrl: `${BASE_URL_API}/CompteResultats/`,
    getHeaders: getAuthHeaders
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

const MetricCard = ({ title, value, icon: Icon, change, changeLabel, isRatio, description }) => {
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-600 p-1 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-w-[120px] w-full h-[80px]">
            <div className="flex items-start justify-between mb-0.5">
                <div className={`p-1 rounded-lg ${iconBg} ${iconColor} shadow-sm dark:brightness-90`}>
                    <Icon size={10} />
                </div>
                {change !== undefined && change !== null && (
                    <div className={`text-[8px] font-bold ${changeColor} flex items-center bg-gray-50 px-1 py-0.5 rounded-full`}>
                        {changeLabel}
                    </div>
                )}
            </div>

            <div className="mt-0.5 min-w-0">
                <p className="text-[7px] sm:text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight leading-tight whitespace-normal">{title}</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-tight whitespace-normal break-words">{value}</p>
                <p className="text-[6px] sm:text-[7px] text-gray-400 dark:text-gray-500 leading-none whitespace-normal">{description}</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-center px-3 py-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                Lignes <span className="font-semibold">{startItem}</span> à <span className="font-semibold">{endItem}</span> sur <span className="font-semibold">{totalItems}</span> (Page <span className="font-semibold">{currentPage}</span>/<span className="font-semibold">{totalPages || 1}</span>)
            </p>
            <div className="flex justify-center space-x-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={isPrevDisabled}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-600 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    <ChevronLeft size={14} className="mr-1" />
                    Préc.
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={isNextDisabled}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-600 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    Suiv.
                    <ChevronRight size={14} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

const TransactionView = ({ onNewSaisieClick, viewType }) => {
    const [selectedSection, setSelectedSection] = useState('bilan');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [recherche, setRecherche] = useState('');
    const [bilanData, setBilanData] = useState([]);
    const [compteResultatData, setCompteResultatData] = useState([]);
    const [kpiData, setKpiData] = useState(null);
    const [bilanKpisData, setBilanKpisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, isBulk }

    const projectId = useProjectId();

    const currentItems = useMemo(() => selectedSection === 'bilan' ? bilanData : compteResultatData, [selectedSection, bilanData, compteResultatData]);

    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === paginatedDetails.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(paginatedDetails.map(item => item.id));
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteTarget({ id, isBulk: false });
        setIsDeleteModalOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedItems.length === 0) return;
        setDeleteTarget({ id: null, isBulk: true });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            if (deleteTarget.isBulk) {
                let successCount = 0;
                for (const id of selectedItems) {
                    const url = `${API_CONFIG[selectedSection === 'bilan' ? 'bilanUrl' : 'compteResultatUrl']}${id}/`;
                    const response = await fetchWithReauth(url, {
                        method: 'DELETE',
                        headers: API_CONFIG.getHeaders()
                    });
                    if (response.ok) successCount++;
                }
                toast.success(`${successCount} lignes supprimées`);
                setBilanData(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setCompteResultatData(prev => prev.filter(item => !selectedItems.includes(item.id)));
                setSelectedItems([]);
            } else {
                const id = deleteTarget.id;
                const url = `${API_CONFIG[selectedSection === 'bilan' ? 'bilanUrl' : 'compteResultatUrl']}${id}/`;
                const response = await fetchWithReauth(url, {
                    method: 'DELETE',
                    headers: API_CONFIG.getHeaders()
                });

                if (response.ok) {
                    toast.success("Ligne supprimée avec succès");
                    setBilanData(prev => prev.filter(item => item.id !== id));
                    setCompteResultatData(prev => prev.filter(item => item.id !== id));
                    setSelectedItems(prev => prev.filter(item => item !== id));
                } else {
                    toast.error("Erreur lors de la suppression");
                }
            }
        } catch (err) {
            toast.error("Erreur réseau");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        }
    };

    // ANALYSE IA
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analysisError, setAnalysisError] = useState(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    // NOUVELLE LOGIQUE DE PÉRIODE
    const [availableYears, setAvailableYears] = useState([]);
    const [periodMode, setPeriodMode] = useState('ANNUAL'); // 'ANNUAL', 'QUARTERLY', 'MONTHLY'
    const [selectedSubPeriod, setSelectedSubPeriod] = useState(null); // 'T1', 'M1', etc.

    // Le useEffect qui charge les années
    useEffect(() => {
        const fetchAvailableYears = async () => {
            try {
                const res = await fetch(`${BASE_URL_API}/journals/years/`, {
                    headers: API_CONFIG.getHeaders(),
                    credentials: 'include'
                });
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
    }, [projectId]);

    // EFFET: Calculer automatiquement les dates de début/fin quand les sélecteurs changent
    useEffect(() => {
        const year = parseInt(selectedYear);
        if (isNaN(year)) return;

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
        id: item.id,
        numero_compte: item.numero_compte || '',
        libelle: item.libelle || '',
        categorie: item.categorie || '',
        montant_ar: parseFloat(item.montant_ar || 0),
        date: item.date || new Date().toISOString()
    }));

    const normalizeCompteResultatData = (data) => data.map(item => ({
        id: item.id,
        numero_compte: item.numero_compte || '',
        libelle: item.libelle || '',
        nature: item.nature || '',
        montant_ar: parseFloat(item.montant_ar || 0),
        date: item.date || new Date().toISOString()
    }));

    const fetchWithParams = async (url, params, normalizer, setter) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await fetch(`${url}?${queryParams}`, {
            headers: API_CONFIG.getHeaders(),
            credentials: 'include'
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des données");

        const json = await res.json();

        // Support PAGINATION DRF (StandardPagination)
        if (json.results && Array.isArray(json.results)) {
            setter(normalizer(json.results));
            return { results: json.results, count: json.count };
        } else {
            // Fallback ancien format (array direct)
            const data = Array.isArray(json) ? json : (json.results || []);
            setter(normalizer(data));
            return { results: data, count: data.length };
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const commonParams = {
                date_start: dateDebut,
                date_end: dateFin,
                page: currentPage,
                page_size: ITEMS_PER_PAGE,
            };

            if (recherche) commonParams.search = recherche;

            if (selectedSection === 'bilan') {
                const { count } = await fetchWithParams(`${BASE_URL_API}/bilans/`, commonParams, normalizeBilanData, setBilanData);
                setTotalItems(count);
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            } else {
                const { count } = await fetchWithParams(`${BASE_URL_API}/CompteResultats/`, commonParams, normalizeCompteResultatData, setCompteResultatData);
                setTotalItems(count);
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les données. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    const fetchKPIs = async () => {
        try {
            const queryParams = new URLSearchParams({
                date_start: dateDebut,
                date_end: dateFin
            }).toString();

            const [resNetRes, bilanKpisRes] = await Promise.all([
                fetch(`${BASE_URL_API}/resultat-net/?${queryParams}`, { headers: API_CONFIG.getHeaders(), credentials: 'include' }),
                fetch(`${BASE_URL_API}/bilan-kpis-variations/?${queryParams}`, { headers: API_CONFIG.getHeaders(), credentials: 'include' })
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
            if (!dateDebut || !dateFin) return;
            await fetchData();
            fetchKPIs();
        };
        loadData();
    }, [dateDebut, dateFin, projectId, currentPage, selectedSection, recherche]);

    const filterData = (details, isBilan = false) => {
        const searchLower = recherche.toLowerCase().trim();
        let filtered = details;

        if (dateDebut && dateFin) {
            filtered = filtered.filter(item => {
                const itemDate = (item.date || '').substring(0, 10);
                const start = (dateDebut || '').substring(0, 10);
                const end = (dateFin || '').substring(0, 10);
                return itemDate >= start && itemDate <= end;
            });
        } else if (selectedYear) {
            filtered = filtered.filter(item => {
                const itemYear = new Date(item.date).getFullYear().toString();
                return itemYear === selectedYear;
            });
        }

        if (searchLower) {
            filtered = filtered.filter(item =>
                item.numero_compte.toLowerCase().includes(searchLower) ||
                item.libelle.toLowerCase().includes(searchLower) ||
                (item.categorie || item.nature || '').toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    };

    // --- ANALYSE IA ---
    const handleAIAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);

        // Préparer les données pour l'analyse
        const analysisData = {
            view_type: selectedSection, // 'bilan' ou 'compteResultat'
            kpis: calculations,
            transactions: allDetails.slice(0, 50), // On prend les 50 premières lignes pour l'IA (le backend limitera à 20 mais on en donne un peu plus)
            filters: {
                year: selectedYear,
                period_mode: periodMode,
                sub_period: selectedSubPeriod
            }
        };

        try {
            const response = await fetchWithReauth('/compte-resultat/ai-analysis/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisData)
            });

            const data = await response.json();

            if (data.success) {
                setAiAnalysis(data.analysis);
                setIsAnalysisModalOpen(true);
            } else {
                setAnalysisError(data.error || 'Erreur lors de l\'analyse');
                setIsAnalysisModalOpen(true); // Ouvrir quand même pour montrer l'erreur
            }
        } catch (error) {
            console.error('Erreur analyse IA:', error);
            setAnalysisError('Impossible de contacter le serveur d\'analyse');
            setIsAnalysisModalOpen(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const calculations = useMemo(() => {
        const bilan = filterData(bilanData, true);
        const compteResultat = filterData(compteResultatData, false);

        // Prioritize global KPI data (calculated on full dataset) over paginated local data
        const hasKpis = bilanKpisData && bilanKpisData.current;

        const actifCourant = hasKpis ? bilanKpisData.current.actif_courant : bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const actifNonCourant = hasKpis ? bilanKpisData.current.actif_non_courant : bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('actif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const passifCourant = hasKpis ? bilanKpisData.current.passif_courant : bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);
        const passifNonCourant = hasKpis ? bilanKpisData.current.passif_non_courant : bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('passif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant_ar, 0);

        const produits = hasKpis && bilanKpisData.current.produits !== undefined ? bilanKpisData.current.produits : compteResultat.filter(i => i.nature.toLowerCase().includes('produit')).reduce((a, b) => a + b.montant_ar, 0);
        const charges = hasKpis && bilanKpisData.current.charges !== undefined ? bilanKpisData.current.charges : compteResultat.filter(i => i.nature.toLowerCase().includes('charge')).reduce((a, b) => a + b.montant_ar, 0);

        const resultatNet = kpiData && kpiData.resultat_net !== undefined ? parseFloat(kpiData.resultat_net) : (produits - charges);
        const capitauxPropresTotal = hasKpis ? bilanKpisData.current.capitaux_propres : (bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('capitaux')).reduce((a, b) => a + b.montant_ar, 0) + resultatNet);
        const capitauxPropresBilan = hasKpis ? (bilanKpisData.current.capitaux_propres - resultatNet) : bilan.filter(i => i.categorie && i.categorie.toLowerCase().includes('capitaux')).reduce((a, b) => a + b.montant_ar, 0);

        const totalActif = actifCourant + actifNonCourant;
        const totalPassif = passifCourant + passifNonCourant + capitauxPropresTotal;

        const totalDettes = passifCourant + passifNonCourant;
        const endettementRatio = capitauxPropresTotal ? (totalDettes / capitauxPropresTotal * 100) : 0;

        const resultatNetChange = kpiData && kpiData.variation !== undefined ? parseFloat(kpiData.variation) : 0;

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

    const allDetails = useMemo(() => selectedSection === 'bilan' ? bilanData : compteResultatData, [selectedSection, bilanData, compteResultatData]);
    const paginatedDetails = allDetails;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 min-h-screen no-scrollbar">
            <main className="flex flex-col p-1 sm:p-2 gap-2">
                {/* 1. PÉRIODE D'EXERCICE - Style GestionPiecesBoard */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700">
                    <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                            Période d'exercice
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sélectionnez la période à analyser</p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm">

                        {/* 1. ANNEE */}
                        <div className="relative group w-full sm:w-auto">
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-auto appearance-none bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border-0 text-indigo-700 dark:text-indigo-300 text-sm font-bold rounded-lg py-1.5 pl-3 pr-8 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-indigo-500 rotate-90" />
                        </div>

                        {/* 2. MODE SELECTOR */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar w-full sm:w-auto mt-1 sm:mt-0">
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
                                        setCurrentPage(1);
                                    }}
                                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${periodMode === mode.id
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* 3. SUB-PERIOD SELECTOR (Animated) */}
                        {periodMode !== 'ANNUAL' && (
                            <div className="animate-fadeIn w-full sm:w-auto">
                                <select
                                    value={selectedSubPeriod || ''}
                                    onChange={(e) => {
                                        setSelectedSubPeriod(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full sm:w-40 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 font-medium shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
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

                        {/* 4. AI ANALYZER BUTTON */}
                        <div className="w-full sm:w-auto ml-auto">
                            <button
                                onClick={handleAIAnalysis}
                                disabled={isAnalyzing}
                                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-md ${isAnalyzing
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 dark:hover:shadow-none transform hover:-translate-y-0.5 mt-2 sm:mt-0'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader className="animate-spin h-4 w-4" />
                                        <span>Analyse en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>Analyse IA</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Content Area with Loading Overlay */}
                <div className="relative flex-1 flex flex-col min-h-0 min-w-0">
                    {loading && <LoadingOverlay message="Chargement des données..." fullScreen={false} className="!justify-start pt-40" />}

                    {/* 2. BARRE DE RECHERCHE */}
                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-1">
                        <div className="flex items-center space-x-2">
                            <div className="pl-2">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher par compte, libellé..."
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                                className="w-full p-1.5 border-0 focus:ring-0 text-xs placeholder-gray-400 dark:placeholder-gray-500 bg-transparent dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md flex items-start">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                        <div className="ml-3 flex-1">
                            <h3 className="text-base font-bold text-red-800 dark:text-red-300 mb-1">Erreur de chargement</h3>
                            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                        </div>
                        <button onClick={() => window.location.reload()} className="ml-4 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">Réessayer</button>
                    </div>}

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <div className="mb-2 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-fadeIn">
                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                {selectedItems.length} ligne{selectedItems.length > 1 ? 's' : ''} sélectionnée{selectedItems.length > 1 ? 's' : ''}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBulkDeleteClick}
                                    disabled={isDeleting}
                                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    <span>Supprimer la sélection</span>
                                </button>
                                <button
                                    onClick={() => setSelectedItems([])}
                                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded shadow transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1.5 mb-1 px-1">
                        {loading ? [...Array(7)].map((_, i) => <div key={i} className="min-w-full h-[80px] bg-gray-200 rounded-xl animate-pulse"></div>) :
                            cards.map(([title, value, change, isRatio, Icon, description], idx) => {
                                // Calcul du pourcentage d'évolution pour les montants (si non ratio)
                                let changeLabel = null;
                                let numericChange = parseFloat(change);
                                const changeIcon = numericChange > 0 ? '↑' : numericChange < 0 ? '↓' : '•';

                                if (isRatio) {
                                    // Pour les ratios, "change" est déjà une différence en points
                                    // On affiche ex: + 1.2 %
                                    changeLabel = !isNaN(numericChange) ? `${changeIcon} ${Math.abs(numericChange).toFixed(1)} %` : '-';
                                } else {
                                    // Pour les montants, on calcule le % d'évolution
                                    // Valeur précédente = Valeur actuelle - Variation
                                    const previousValue = value - numericChange;

                                    if (previousValue === 0) {
                                        // Si précédent était 0
                                        if (numericChange === 0) changeLabel = `${changeIcon} 0 %`;
                                        else changeLabel = `${changeIcon} 100 %`; // Ou N/A
                                    } else {
                                        const percent = (numericChange / previousValue) * 100;
                                        changeLabel = `${changeIcon} ${Math.abs(percent).toFixed(1)} %`;
                                    }
                                }

                                return (
                                    <MetricCard
                                        key={idx}
                                        title={title}
                                        value={isRatio ? value.toFixed(1) + '%' : formatCurrency(value)}
                                        icon={Icon}
                                        change={numericChange} // On garde change numérique pour la couleur
                                        changeLabel={changeLabel} // On passe le label formaté
                                        isRatio={isRatio}
                                        description={description}
                                    />
                                );
                            })
                        }
                    </div>

                    {/* Bilan & Compte Résultat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 px-2">
                        <div onClick={() => { setSelectedSection('bilan'); setCurrentPage(1); }}
                            className={`p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'bilan' ? 'border-t-4 border-indigo-500 scale-[1.005]' : 'border-t-2 border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}>
                            <div className="flex items-center space-x-2 mb-1.5">
                                <div className="p-1 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600">
                                    <Scale size={10} />
                                </div>
                                <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">Bilan</h3>
                                <div className="ml-auto">
                                    {calculations.bilanEquilibre ? <CheckCircle size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                                </div>
                            </div>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1.5 ml-1 leading-tight">Situation financière (Actifs = Passifs + CP).</p>
                            <div className='text-[9px] sm:text-[10px] space-y-0.5 text-gray-700 dark:text-gray-300 px-1'>
                                <p className="flex justify-between flex-wrap"><span>Actif :</span> <span className="font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(calculations.totalActif)}</span></p>
                                <p className="flex justify-between flex-wrap"><span>Passif+CP :</span> <span className="font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(calculations.totalPassif)}</span></p>
                            </div>
                        </div>
                        <div onClick={() => { setSelectedSection('compteResultat'); setCurrentPage(1); }}
                            className={`p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'compteResultat' ? 'border-t-4 border-emerald-500 scale-[1.005]' : 'border-t-2 border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
                                    <DollarSign size={10} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Compte de Résultat</h3>
                                <div className="ml-auto">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 ml-1 leading-tight">Produits et charges.</p>
                            <div className='text-[10px] sm:text-xs space-y-1 text-gray-700 dark:text-gray-300 px-1'>
                                <p className="flex justify-between flex-wrap"><span>Produits :</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(calculations.produits)}</span></p>
                                <p className="flex justify-between flex-wrap"><span>Charges :</span> <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(calculations.charges)}</span></p>
                                <p className="flex justify-between flex-wrap border-t border-gray-100 dark:border-gray-700 pt-1"><span>Résultat net :</span> <span className={`font-bold ${calculations.resultatNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{formatCurrency(calculations.resultatNet)}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Table des détails */}
                    <div className="px-2 flex-1 flex flex-col min-h-0">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="overflow-auto min-h-0 no-scrollbar">
                                <table className="w-full border-collapse text-xs sm:text-sm min-w-[800px] table-fixed">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-gray-800 dark:bg-gray-950 text-white">
                                            <th className="w-[8%] sm:w-[5%] px-2 py-2 text-center">
                                                <button onClick={toggleSelectAll} className="hover:text-indigo-400 transition-colors">
                                                    {selectedItems.length === paginatedDetails.length && paginatedDetails.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </button>
                                            </th>
                                            <th className="w-[15%] sm:w-[10%] px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Date</th>
                                            <th className="w-[15%] sm:w-[10%] px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Compte</th>
                                            <th className="w-[35%] px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide">Libellé</th>
                                            {selectedSection === 'bilan' ?
                                                <th className="w-[15%] px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide hidden lg:table-cell">Catégorie</th>
                                                : <th className="w-[15%] px-2 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide hidden lg:table-cell">Nature</th>
                                            }
                                            <th className="w-[20%] sm:w-[15%] px-2 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide">Montant</th>
                                            <th className="w-[10%] px-2 py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        {loading ? [...Array(ITEMS_PER_PAGE)].map((_, i) =>
                                            <tr key={i} className="animate-pulse">
                                                {[...Array(5)].map((_, j) =>
                                                    <td key={j} className="border-b border-gray-100 dark:border-gray-700 px-3 py-2.5">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    </td>
                                                )}
                                            </tr>
                                        ) : paginatedDetails.map((item, idx) => (
                                            <tr key={item.id || idx} className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} ${selectedItems.includes(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                                                <td className="w-[5%] border-b border-gray-100 dark:border-gray-700 px-2 text-center">
                                                    <button onClick={() => toggleSelectItem(item.id)} className={`${selectedItems.includes(item.id) ? 'text-indigo-600' : 'text-gray-400'} hover:text-indigo-500 transition-colors`}>
                                                        {selectedItems.includes(item.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                                                    </button>
                                                </td>
                                                <td className="w-[10%] border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-gray-700 dark:text-gray-300 font-semibold">{formatDate(item.date)}</td>
                                                <td className="w-[10%] border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-xs">
                                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{item.numero_compte}</span>
                                                </td>
                                                <td className="w-[35%] border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-gray-800 dark:text-gray-200 font-medium truncate max-w-[150px] sm:max-w-none">{item.libelle}</td>
                                                <td className="w-[15%] border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 hidden lg:table-cell">
                                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-[10px] font-bold rounded-full ${selectedSection === 'bilan'
                                                        ? item.categorie?.toLowerCase().includes('actif')
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                            : item.categorie?.toLowerCase().includes('passif') || item.categorie?.toLowerCase().includes('capitaux')
                                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        : item.nature?.toLowerCase().includes('produit')
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                        }`}>
                                                        {(item.categorie || item.nature || '').replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="w-[20%] sm:w-[15%] border-b border-gray-100 dark:border-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-right font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.montant_ar)}</td>
                                                <td className="w-[10%] border-b border-gray-100 dark:border-gray-700 px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => { setEditingItem(item); setIsEditing(true); }}
                                                            disabled={selectedItems.length > 1 || (selectedItems.length === 1 && !selectedItems.includes(item.id))}
                                                            className={`p-1 rounded transition-colors ${(selectedItems.length > 1 || (selectedItems.length === 1 && !selectedItems.includes(item.id))) ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                                            title={selectedItems.length > 1 ? "Désélectionnez pour modifier" : (selectedItems.length === 1 && !selectedItems.includes(item.id)) ? "Ligne non sélectionnée" : "Modifier"}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            disabled={selectedItems.length > 0}
                                                            className={`p-1 rounded transition-colors ${selectedItems.length > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                                            title={selectedItems.length > 0 ? "Utilisez la suppression groupée" : "Supprimer"}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setCurrentPage={setCurrentPage} />
                        </div>
                    </div>
                </div>
            </main>
            {/* AI ANALYSIS MODAL */}
            {
                isAnalysisModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-purple-100 dark:border-purple-900/30">
                            {/* Header Modale */}
                            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                                <div>
                                    <h3 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 flex items-center">
                                        <Sparkles className="mr-2 sm:mr-3 text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
                                        <span className="truncate">Analyse Expert-Comptable</span>
                                    </h3>
                                    <p className="text-[10px] sm:text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">Interprétation pour {selectedSection === 'bilan' ? 'votre Bilan' : 'votre Compte de Résultat'}</p>
                                </div>
                                <button
                                    onClick={() => setIsAnalysisModalOpen(false)}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors group"
                                >
                                    <XCircle className="text-gray-400 group-hover:text-red-500 transition-colors" size={24} />
                                </button>
                            </div>

                            {/* Corps Modale */}
                            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
                                {analysisError ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl flex flex-col items-center text-center">
                                        <AlertCircle className="text-red-500 mb-3" size={48} />
                                        <h4 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Une erreur est survenue</h4>
                                        <p className="text-red-600 dark:text-red-400 mb-4">{analysisError}</p>
                                        <button
                                            onClick={handleAIAnalysis}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-lg shadow-red-200 dark:shadow-none"
                                        >
                                            Réessayer l'analyse
                                        </button>
                                    </div>
                                ) : aiAnalysis ? (
                                    <>
                                        {/* Période Analysée */}
                                        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 inline-flex items-center space-x-2">
                                            <Calendar size={14} className="text-purple-600 dark:text-purple-400" />
                                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                                Période: {selectedYear} {selectedSubPeriod ? `(${selectedSubPeriod})` : '(Annuel)'}
                                            </span>
                                        </div>

                                        {/* Vue d'Ensemble */}
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-5 rounded-xl border-l-4 border-purple-500 shadow-sm transition-all hover:shadow-md">
                                            <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center">
                                                <span className="text-xl mr-2">📊</span> Vue d'Ensemble
                                            </h4>
                                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed font-medium">
                                                "{aiAnalysis.vue_ensemble}"
                                            </p>
                                        </div>

                                        {/* Analyse Détaillée */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                                <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center uppercase text-xs tracking-widest">
                                                    {selectedSection === 'bilan' ? '📦 Analyse des Actifs' : '↗️ Analyse des Produits'}
                                                </h5>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {aiAnalysis.analyse_detaillee?.produits_ou_actifs}
                                                </p>
                                            </div>
                                            <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                                                <h5 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center uppercase text-xs tracking-widest">
                                                    {selectedSection === 'bilan' ? '🛡️ Analyse des Passifs' : '↘️ Analyse des Charges'}
                                                </h5>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {aiAnalysis.analyse_detaillee?.charges_ou_passifs}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rentabilité / Équilibre */}
                                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-xl border-t-2 border-emerald-500 shadow-sm transition-all hover:shadow-md">
                                            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center">
                                                <Sparkles size={18} className="mr-2 text-emerald-600" />
                                                {selectedSection === 'bilan' ? 'Équilibre et Solvabilité' : 'Performance et Rentabilité'}
                                            </h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {aiAnalysis.analyse_detaillee?.performance_ou_equilibre}
                                            </p>
                                        </div>

                                        {/* Transactions Remarquables */}
                                        <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center uppercase text-xs tracking-widest">
                                                ✍️ Analyse des Transactions
                                            </h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {aiAnalysis.transactions_remarquables}
                                            </p>
                                        </div>

                                        {/* Points Forts & Faibles */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {aiAnalysis.points_forts && (
                                                <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                                                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center text-xs sm:text-sm">
                                                        ✅ Points Forts
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.points_forts.map((pt, i) => (
                                                            <li key={i} className="flex items-start text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="text-emerald-500 mr-2 shrink-0">•</span> <span>{pt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {aiAnalysis.points_faibles && (
                                                <div className="bg-red-50/30 dark:bg-red-900/5 p-4 rounded-xl border border-red-200/50 dark:border-red-800/30">
                                                    <h5 className="font-bold text-red-800 dark:text-red-400 mb-3 flex items-center text-xs sm:text-sm">
                                                        ⚠️ Points Faibles / Risques
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.points_faibles.map((pt, i) => (
                                                            <li key={i} className="flex items-start text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="text-red-500 mr-2 shrink-0">•</span> <span>{pt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* RECOMMANDATIONS */}
                                        {aiAnalysis.recommandations && (
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center px-1">
                                                    🚀 Plan d'Action Recommandé
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {aiAnalysis.recommandations.map((rec, i) => (
                                                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-lg transition-all border-t-4 border-t-purple-500 group">
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
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            {/* Footer Modale */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50/50 dark:bg-gray-900/20">
                                <button
                                    onClick={() => setIsAnalysisModalOpen(false)}
                                    className="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Edit Modal */}
            {
                isEditing && editingItem && (
                    <EditEntryModal
                        item={editingItem}
                        type={selectedSection}
                        onClose={() => { setIsEditing(false); setEditingItem(null); }}
                        onSave={(updatedItem) => {
                            if (selectedSection === 'bilan') {
                                const normalized = normalizeBilanData([updatedItem])[0];
                                setBilanData(prev => prev.map(it => it.id === normalized.id ? normalized : it));
                            } else {
                                const normalized = normalizeCompteResultatData([updatedItem])[0];
                                setCompteResultatData(prev => prev.map(it => it.id === normalized.id ? normalized : it));
                            }
                            fetchKPIs(); // Re-calculer les totaux au sommet
                            setIsEditing(false);
                            setEditingItem(null);
                            toast.success("Modification enregistrée");
                        }}
                    />
                )
            }
            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <DeleteConfirmationModal
                        count={deleteTarget?.isBulk ? selectedItems.length : 1}
                        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
                        onConfirm={confirmDelete}
                        isLoading={isDeleting}
                    />
                )
            }
        </div >
    );
};

const EditEntryModal = ({ item, type, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...item });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.libelle?.trim()) {
            toast.error("Le libellé est obligatoire");
            return;
        }
        if (!formData.numero_compte?.trim()) {
            toast.error("Le numéro de compte est obligatoire");
            return;
        }
        if (formData.montant_ar === undefined || formData.montant_ar === null || formData.montant_ar === "") {
            toast.error("Le montant est obligatoire");
            return;
        }

        const montantStr = formData.montant_ar.toString();
        if (montantStr.length > 1 && montantStr.startsWith('0') && !montantStr.startsWith('0.')) {
            toast.error("Le montant ne doit pas commencer par 0 (ex: 0215)");
            return;
        }

        if (parseFloat(formData.montant_ar) <= 0) {
            toast.error("Le montant doit être supérieur à 0");
            return;
        }

        if (!formData.date) {
            toast.error("La date est obligatoire");
            return;
        }

        if (type === 'bilan' && !formData.categorie) {
            toast.error("La catégorie est obligatoire");
            return;
        }

        if (type !== 'bilan' && !formData.nature) {
            toast.error("La nature est obligatoire");
            return;
        }

        setIsSaving(true);
        try {
            const url = `${API_CONFIG[type === 'bilan' ? 'bilanUrl' : 'compteResultatUrl']}${item.id}/`;
            const response = await fetchWithReauth(url, {
                method: 'PATCH',
                headers: API_CONFIG.getHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                onSave(data);
            } else {
                toast.error("Erreur lors de l'enregistrement");
            }
        } catch (err) {
            toast.error("Erreur réseau");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Edit2 size={18} className="mr-2 text-indigo-500" />
                        Modifier l'entrée
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircle size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Libellé</label>
                        <input
                            type="text"
                            value={formData.libelle}
                            onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Montant (Ar)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.montant_ar}
                            onChange={(e) => setFormData(prev => ({ ...prev, montant_ar: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Compte</label>
                            <input
                                type="text"
                                value={formData.numero_compte}
                                onChange={(e) => setFormData(prev => ({ ...prev, numero_compte: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                {type === 'bilan' ? 'Catégorie' : 'Nature'}
                            </label>
                            <select
                                value={type === 'bilan' ? formData.categorie : formData.nature}
                                onChange={(e) => setFormData(prev => ({ ...prev, [type === 'bilan' ? 'categorie' : 'nature']: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                required
                            >
                                {type === 'bilan' ? (
                                    <>
                                        <option value="ACTIF_COURANTS">Actif courants</option>
                                        <option value="ACTIF_NON_COURANTS">Actif non courants</option>
                                        <option value="CAPITAUX_PROPRES">Capitaux propres</option>
                                        <option value="PASSIFS_COURANTS">Passifs courants</option>
                                        <option value="PASSIFS_NON_COURANTS">Passifs non courants</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="CHARGE">Charge</option>
                                        <option value="PRODUIT">Produit</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader size={16} className="animate-spin" /> : <span>Enregistrer</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ count, onClose, onConfirm, isLoading }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100 dark:border-red-900/30 p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Confirmer la suppression
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                    Êtes-vous sûr de vouloir supprimer {count > 1 ? `ces ${count} lignes` : "cette ligne"} ? Cette action est irréversible.
                </p>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader size={16} className="animate-spin" /> : <span>Supprimer définitivement</span>}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionView;

