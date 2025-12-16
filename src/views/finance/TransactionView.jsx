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
    Calendar
} from 'lucide-react';

const ITEMS_PER_PAGE = 4;

const API_CONFIG = {
    bilanUrl: 'https://votre-api.com/api/bilan',
    compteResultatUrl: 'https://votre-api.com/api/compte-resultat',
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
    let changeColor = 'text-gray-500';

    if (title === 'Résultat Net') {
        iconBg = 'bg-gradient-to-br from-emerald-100 to-teal-100';
        changeColor = numericChange >= 0 ? 'text-emerald-600' : 'text-red-600';
    } else if (title.includes('Ratio')) {
        const isFavorable = numericChange < 0;
        iconBg = 'bg-gradient-to-br from-rose-50 to-red-50';
        iconColor = 'text-red-500';
        changeColor = isFavorable ? 'text-emerald-600' : 'text-red-600';
    } else if (title.includes('Passif')) {
        iconBg = 'bg-gradient-to-br from-orange-50 to-amber-50';
        iconColor = 'text-orange-600';
    } else if (title.includes('Actif') || title.includes('Capitaux')) {
        iconBg = 'bg-gradient-to-br from-blue-50 to-indigo-50';
        iconColor = 'text-blue-600';
    }

    const changeIcon = numericChange > 0 ? '↑' : numericChange < 0 ? '↓' : '•';
    const variationMessage = title === 'Résultat Net' && !isNaN(numericChange)
        ? `${numericChange >= 0 ? '+' : '-'} ${Math.abs(numericChange).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`
        : '';

    return (
        <div className="bg-white rounded-lg shadow-md border-t-2 border-gray-300 p-2 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-w-[140px] w-full h-[110px]">
            <div className="flex items-start justify-between mb-1">
                <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} shadow-sm`}>
                    <Icon size={18} />
                </div>
                {change !== undefined && change !== null && (
                    <div className={`text-[10px] font-bold ${changeColor} flex items-center bg-gray-50 px-1.5 py-0.5 rounded-full`}>
                        {title === 'Résultat Net'
                            ? variationMessage
                            : (!isNaN(numericChange) && <>{changeIcon} {Math.abs(numericChange).toFixed(1)}{isRatio ? ' pts' : '%'}</>)
                        }
                    </div>
                )}
            </div>

            <div className="mt-1">
                <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
                <p className="text-[9px] text-gray-400 italic truncate">{description}</p>
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
    const currentYear = new Date().getFullYear();
    const [selectedSection, setSelectedSection] = useState('bilan');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [recherche, setRecherche] = useState('');
    const [bilanData, setBilanData] = useState([]);
    const [compteResultatData, setCompteResultatData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historicalData] = useState({ resultatNetPrevious: 150000000, endettementPrevious: 35 });

    // Générer une liste d'années (5 dernières années + année actuelle)
    const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const normalizeBilanData = (data) => data.map(item => ({
        numeroCompte: item.numeroCompte || '',
        libelle: item.libelle || '',
        categorie: item.categorie || '',
        montant: parseFloat(item.montant || 0),
        date: item.date || new Date().toISOString()
    }));

    const normalizeCompteResultatData = (data) => data.map(item => ({
        numeroCompte: item.numeroCompte || '',
        libelle: item.libelle || '',
        nature: item.nature || '',
        montant: parseFloat(item.montant || 0),
        date: item.date || new Date().toISOString()
    }));

    const fetchData = async (url, normalizer, setter, year) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = url.includes('bilan')
            ? [
                { numeroCompte: '101', libelle: 'Capital Social', categorie: 'Capitaux Propres', montant: 500000000, date: `${year}-12-31` },
                { numeroCompte: '211', libelle: 'Terrains et Constructions', categorie: 'Actif Non Courant', montant: 300000000, date: `${year}-12-31` },
                { numeroCompte: '401', libelle: 'Fournisseurs', categorie: 'Passif Courant', montant: 80000000, date: `${year}-12-31` },
                { numeroCompte: '512', libelle: 'Banques', categorie: 'Actif Courant', montant: 120000000, date: `${year}-12-31` },
                { numeroCompte: '164', libelle: 'Emprunts bancaires', categorie: 'Passif Non Courant', montant: 200000000, date: `${year}-12-31` }
            ]
            : [
                { numeroCompte: '701', libelle: 'Ventes de marchandises', nature: 'Produit', montant: 800000000, date: `${year}-12-31` },
                { numeroCompte: '601', libelle: 'Achats de marchandises', nature: 'Charge', montant: 450000000, date: `${year}-12-31` },
                { numeroCompte: '641', libelle: 'Rémunérations du personnel', nature: 'Charge', montant: 150000000, date: `${year}-12-31` },
                { numeroCompte: '706', libelle: 'Prestations de services', nature: 'Produit', montant: 200000000, date: `${year}-12-31` }
            ];
        setter(normalizer(mockData));
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setCurrentPage(1);
            try {
                await Promise.all([
                    fetchData(API_CONFIG.bilanUrl, normalizeBilanData, setBilanData, selectedYear),
                    fetchData(API_CONFIG.compteResultatUrl, normalizeCompteResultatData, setCompteResultatData, selectedYear)
                ]);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        loadData();
    }, [selectedYear]);

    const filterData = (details) => {
        const searchLower = recherche.toLowerCase().trim();
        let filtered = details;

        // Filtrer par année sélectionnée
        if (selectedYear) {
            filtered = filtered.filter(item => {
                const itemYear = new Date(item.date).getFullYear().toString();
                return itemYear === selectedYear;
            });
        }

        // Filtrer par recherche
        if (searchLower) {
            filtered = filtered.filter(item =>
                item.numeroCompte.toLowerCase().includes(searchLower) ||
                item.libelle.toLowerCase().includes(searchLower) ||
                (item.categorie || item.nature || '').toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    };

    const calculations = useMemo(() => {
        const bilan = filterData(bilanData);
        const compteResultat = filterData(compteResultatData);

        const actifCourant = bilan.filter(i => i.categorie.toLowerCase().includes('actif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant, 0);
        const actifNonCourant = bilan.filter(i => i.categorie.toLowerCase().includes('actif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant, 0);
        const passifCourant = bilan.filter(i => i.categorie.toLowerCase().includes('passif') && i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant, 0);
        const passifNonCourant = bilan.filter(i => i.categorie.toLowerCase().includes('passif') && !i.categorie.toLowerCase().includes('courant')).reduce((a, b) => a + b.montant, 0);
        const capitauxPropres = bilan.filter(i => i.categorie.toLowerCase().includes('capitaux')).reduce((a, b) => a + b.montant, 0);

        const totalActif = actifCourant + actifNonCourant;
        const totalPassif = passifCourant + passifNonCourant + capitauxPropres;

        const produits = compteResultat.filter(i => i.nature.toLowerCase().includes('produit')).reduce((a, b) => a + b.montant, 0);
        const charges = compteResultat.filter(i => i.nature.toLowerCase().includes('charge')).reduce((a, b) => a + b.montant, 0);

        const resultatNet = produits - charges;
        const totalDettes = passifCourant + passifNonCourant;
        const endettementRatio = capitauxPropres ? (totalDettes / capitauxPropres * 100) : 0;
        const resultatNetChange = resultatNet - historicalData.resultatNetPrevious;
        const endettementChange = endettementRatio - historicalData.endettementPrevious;

        return { actifCourant, actifNonCourant, passifCourant, passifNonCourant, capitauxPropres, totalActif, totalPassif, produits, charges, resultatNet, endettementRatio, totalDettes, bilanEquilibre: Math.abs(totalActif - totalPassif) < 0.01, resultatNetChange, endettementChange };
    }, [bilanData, compteResultatData, recherche, selectedYear]);

    const cards = [
        ['Actif Courant', calculations.actifCourant, null, false, DollarSign, 'Créances,Stocks,Trésorerie'],
        ['Actif Non Courant', calculations.actifNonCourant, null, false, Scale, 'Immobilisations'],
        ['Capitaux Propres', calculations.capitauxPropres, null, false, Users, 'Fonds propres '],
        ['Passif Courant', calculations.passifCourant, null, false, Briefcase, 'Dettes à court terme'],
        ['Passif Non Courant', calculations.passifNonCourant, null, false, Briefcase, 'Dettes à long terme'],
        ['Résultat Net', calculations.resultatNet, calculations.resultatNetChange, false, TrendingUp, 'benefice,perte'],
        ['Ratio Endettement', calculations.endettementRatio, calculations.endettementChange, true, FileText, 'Dettes/CP']
    ];

    const allDetails = useMemo(() => selectedSection === 'bilan' ? filterData(bilanData) : filterData(compteResultatData), [selectedSection, bilanData, compteResultatData, recherche, selectedYear]);
    const totalPages = Math.ceil(allDetails.length / ITEMS_PER_PAGE);
    const totalItems = allDetails.length;
    const paginatedDetails = useMemo(() => allDetails.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [currentPage, allDetails]);

    return (
        <div className="mim-h-screen flex flex-col overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Période d'exercice */}
                {/* Période d'exercice */}
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
                                value={`${selectedYear}-01-01`}
                                onChange={(e) => {
                                    const year = new Date(e.target.value).getFullYear();
                                    setSelectedYear(year.toString());
                                }}
                                className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-600 text-xs sm:text-sm">Au</label>
                            <input
                                type="date"
                                value={`${selectedYear}-12-31`}
                                onChange={(e) => {
                                    const year = new Date(e.target.value).getFullYear();
                                    setSelectedYear(year.toString());
                                }}
                                className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                            />
                        </div>
                        <button
                            onClick={() => setSelectedYear(currentYear.toString())}
                            className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-900 font-medium shadow-sm transition-all"
                        >
                            01 janv. {selectedYear} - 31 déc. {selectedYear}
                        </button>
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
                        <div className="overflow-hidden flex-1 ">
                            <table className="w-full table-fixed border-collapse">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <tr>
                                        <th className="border-b-2 border-indigo-200 px-3 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider w-[15%]">Compte</th>
                                        <th className="border-b-2 border-indigo-200 px-3 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider w-[35%]">Libellé</th>
                                        {selectedSection === 'bilan' ?
                                            <th className="border-b-2 border-indigo-200 px-3 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider w-[20%]">Catégorie</th>
                                            : <th className="border-b-2 border-emerald-200 px-3 py-2 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider w-[20%]">Nature</th>
                                        }
                                        <th className="border-b-2 border-indigo-200 px-3 py-2 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider w-[20%]">Montant</th>
                                        <th className="border-b-2 border-indigo-200 px-3 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider w-[10%]">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading ? [...Array(ITEMS_PER_PAGE)].map((_, i) =>
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(5)].map((_, j) =>
                                                <td key={j} className="px-2 py-2">
                                                    <div className="h-3 bg-gray-200 rounded"></div>
                                                </td>
                                            )}
                                        </tr>
                                    ) : paginatedDetails.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors duration-150">
                                            <td className="px-1 py-1 text-xs font-semibold text-gray-800 truncate">
                                                <span className="inline-block px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs">{item.numeroCompte}</span>
                                            </td>
                                            <td className="px-1 py-1 text-xs text-gray-700 truncate font-medium">{item.libelle}</td>
                                            <td className="px-1 py-1 bodyext-xs truncate">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${selectedSection === 'bilan'
                                                    ? item.categorie?.toLowerCase().includes('actif')
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : item.categorie?.toLowerCase().includes('passif')
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                    : item.nature?.toLowerCase().includes('produit')
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {item.categorie || item.nature}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1 text-xs text-right font-bold text-gray-900 truncate">{formatCurrency(item.montant)}</td>
                                            <td className="px-2 py-1 text-[10px] text-gray-600 truncate">{formatDate(item.date)}</td>
                                        </tr>
                                    ))}
                                    {(!loading && paginatedDetails.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">
                                                <div className="flex flex-col items-center justify-center">
                                                    <AlertCircle className="text-gray-400 mb-1" size={32} />
                                                    <p className="text-gray-500 text-xs font-medium">Aucune donnée trouvée pour l'année {selectedYear || 'sélectionnée'}</p>
                                                </div>
                                            </td>
                                        </tr>
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