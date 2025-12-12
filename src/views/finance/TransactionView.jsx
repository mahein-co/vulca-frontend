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
    Columns2
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

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
    let cardBg = 'bg-indigo-50 border-indigo-300', iconBg = 'bg-indigo-500/10', iconColor = 'text-indigo-600', changeColor = 'text-gray-500';

    if (title === 'Résultat Net') {
        cardBg = 'bg-emerald-50 border-emerald-300';
        iconBg = 'bg-emerald-500/10';
        iconColor = 'text-emerald-600';
        changeColor = numericChange >= 0 ? 'text-emerald-600' : 'text-red-600';
    } else if (title.includes('Ratio')) {
        const isFavorable = numericChange < 0;
        cardBg = 'bg-red-50 border-red-300';
        iconBg = 'bg-red-500/10';
        iconColor = 'text-red-600';
        changeColor = isFavorable ? 'text-emerald-600' : 'text-red-600';
    }

    const changeIcon = numericChange > 0 ? '↑' : numericChange < 0 ? '↓' : '•';
    const variationMessage = title === 'Résultat Net' && !isNaN(numericChange)
        ? `${numericChange >= 0 ? '+' : '-'} ${Math.abs(numericChange).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar`
        : '';

    return (
        <div className={`border ${cardBg} rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] min-w-[170px] w-full h-[120px]`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-full ${iconBg} ${iconColor} flex-shrink-0 shadow-sm`}>
                    <Icon size={18} />
                </div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider truncate text-right flex-1 ml-2">{title}</p>
            </div>
            <p className={`text-lg sm:text-xl font-extrabold ${iconColor} mb-1 truncate text-right w-full`}>{value}</p>
            <div className="flex justify-between items-center w-full mt-auto">
                <p className="text-[10px] sm:text-xs text-gray-500 italic break-words">{description}</p>
                {change !== undefined && change !== null && (
                    <div className={`text-[10px] font-bold w-full text-right ${changeColor}`}>
                        {title === 'Résultat Net'
                            ? <span className="inline-block px-1.5 py-0.5 rounded-full bg-white shadow-sm border border-gray-100">{variationMessage}</span>
                            : !isNaN(numericChange) && <span className="inline-block px-1.5 py-0.5 rounded-full bg-white shadow-sm border border-gray-100">{changeIcon} {Math.abs(numericChange).toFixed(1)}{isRatio ? ' pts' : '%'}</span>
                        }
                    </div>
                )}
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
        <div className="flex flex-col sm:flex-row justify-between items-center mt-0 p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Affichage des lignes <span className="font-semibold">{startItem}</span> à <span className="font-semibold">{endItem}</span> sur <span className="font-semibold">{totalItems}</span> (Page <span className="font-semibold">{currentPage}</span> sur <span className="font-semibold">{totalPages || 1}</span>)
            </p>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={isPrevDisabled}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    Précédent
                </button>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={isNextDisabled}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                >
                    Suivant
                    <ChevronRight size={16} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

const TransactionView = () => {
    const today = formatDate(new Date());
    const currentYear = new Date().getFullYear();
    const [selectedSection, setSelectedSection] = useState('bilan');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateDebut, setDateDebut] = useState(`${currentYear}-01-01`);
    const [dateFin, setDateFin] = useState(today);
    const [recherche, setRecherche] = useState('');
    const [bilanData, setBilanData] = useState([]);
    const [compteResultatData, setCompteResultatData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historicalData] = useState({ resultatNetPrevious: 150000000, endettementPrevious: 35 });

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

    const fetchData = async (url, normalizer, setter, dateFin) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const year = new Date(dateFin).getFullYear();
        const mockData = url.includes('bilan')
            ? [
                { numeroCompte: '101', libelle: 'Capital Social', categorie: 'Capitaux Propres', montant: 500000000, date: `${year}-12-31` },
                { numeroCompte: '211', libelle: 'Terrains et Constructions', categorie: 'Actif Non Courant', montant: 300000000, date: `${year}-12-31` },
                { numeroCompte: '401', libelle: 'Fournisseurs', categorie: 'Passif Courant', montant: 80000000, date: `${year}-12-31` }
            ]
            : [
                { numeroCompte: '701', libelle: 'Ventes de marchandises', nature: 'Produit', montant: 800000000, date: `${year}-12-31` },
                { numeroCompte: '601', libelle: 'Achats de marchandises', nature: 'Charge', montant: 450000000, date: `${year}-12-31` }
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
                    fetchData(API_CONFIG.bilanUrl, normalizeBilanData, setBilanData, dateFin),
                    fetchData(API_CONFIG.compteResultatUrl, normalizeCompteResultatData, setCompteResultatData, dateFin)
                ]);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        loadData();
    }, [dateDebut, dateFin]);

    const filterData = (details) => {
        const searchLower = recherche.toLowerCase().trim();
        return details.filter(item => !searchLower || item.numeroCompte.toLowerCase().includes(searchLower) || item.libelle.toLowerCase().includes(searchLower) || (item.categorie || item.nature || '').toLowerCase().includes(searchLower));
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
    }, [bilanData, compteResultatData, recherche]);

    const cards = [
        ['Actif Courant', calculations.actifCourant, null, false, DollarSign, 'Créances,Stocks,Trésorerie'],
        ['Actif Non Courant', calculations.actifNonCourant, null, false, Scale, 'Immobilisations'],
        ['Capitaux Propres', calculations.capitauxPropres, null, false, Users, 'Fonds propres '],
        ['Passif Courant', calculations.passifCourant, null, false, Briefcase, 'Dettes à court terme'],
        ['Passif Non Courant', calculations.passifNonCourant, null, false, Briefcase, 'Dettes à long terme'],
        ['Résultat Net', calculations.resultatNet, calculations.resultatNetChange, false, TrendingUp, ''],
        ['Ratio Endettement', calculations.endettementRatio, calculations.endettementChange, true, FileText, 'Dettes/CP']
    ];

    const allDetails = useMemo(() => selectedSection === 'bilan' ? filterData(bilanData) : filterData(compteResultatData), [selectedSection, bilanData, compteResultatData, recherche]);
    const totalPages = Math.ceil(allDetails.length / ITEMS_PER_PAGE);
    const totalItems = allDetails.length;
    const paginatedDetails = useMemo(() => allDetails.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [currentPage, allDetails]);

    return (
        <div className="w-full">
            <main className="overflow-y-auto p-4 w-full">
                {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md flex items-start">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                    <div className="ml-3 flex-1">
                        <h3 className="text-base font-bold text-red-800 mb-1">Erreur de chargement</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="ml-4 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">Réessayer</button>
                </div>}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-4 overflow-x-auto px-2">
                    {loading ? [...Array(7)].map((_, i) => <div key={i} className="min-w-[170px] h-[120px] bg-gray-200 rounded-xl animate-pulse"></div>) :
                        cards.map(([title, value, change, isRatio, Icon, description], idx) => (
                            <MetricCard key={idx} title={title} value={isRatio ? value.toFixed(1) + '%' : formatCurrency(value)} icon={Icon} change={change} isRatio={isRatio} description={description} />
                        ))
                    }
                </div>

                {/* Bilan & Compte Résultat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 px-2">
                    <div onClick={() => { setSelectedSection('bilan'); setCurrentPage(1); }}
                        className={`p-5 bg-white border rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'bilan' ? 'ring-4 ring-indigo-500 border-indigo-600 scale-[1.007]' : 'border-gray-200 hover:border-indigo-400'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                            <Scale size={24} className="text-indigo-500" />
                            <h3 className="text-lg font-bold text-gray-800">Bilan</h3>
                            {calculations.bilanEquilibre ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 px-4">Situation financière à une date donnée (Actifs = Passifs + Capitaux Propres).</p>
                        <div className='text-xs space-y-1 text-gray-700 px-4'>
                            <p>Total Actif : <span className="font-semibold text-indigo-600">{formatCurrency(calculations.totalActif)}</span></p>
                            <p>Total Passif (Dettes + CP) : <span className="font-semibold text-indigo-600">{formatCurrency(calculations.totalPassif)}</span></p>
                        </div>
                    </div>
                    <div onClick={() => { setSelectedSection('compteResultat'); setCurrentPage(1); }}
                        className={`p-5 bg-white border rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedSection === 'compteResultat' ? 'ring-4 ring-emerald-500 border-emerald-600 scale-[1.007]' : 'border-gray-200 hover:border-emerald-400'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                            <DollarSign size={24} className="text-emerald-500" />
                            <h3 className="text-lg font-bold text-gray-800">Compte de Résultat</h3>
                            <CheckCircle size={18} className="text-emerald-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 px-4">Synthèse des produits et charges pour calculer le résultat net.</p>
                        <div className='text-xs space-y-1 text-gray-700 px-4'>
                            <p>Produits : <span className="font-semibold text-emerald-600">{formatCurrency(calculations.produits)}</span></p>
                            <p>Charges : <span className="font-semibold text-emerald-600">{formatCurrency(calculations.charges)}</span></p>
                            <p>Résultat Net : <span className="font-semibold text-emerald-600">{formatCurrency(calculations.resultatNet)}</span></p>
                        </div>
                    </div>
                </div>

                {/* Table des détails */}
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse border border-gray-200 rounded-xl">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Compte</th>
                                <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Libellé</th>
                                {selectedSection === 'bilan' ? <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Catégorie</th>
                                    : <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nature</th>}
                                <th className="border px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Montant</th>
                                <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(ITEMS_PER_PAGE)].map((_, i) =>
                                <tr key={i} className="animate-pulse bg-gray-100">
                                    {[...Array(5)].map((_, j) => <td key={j} className="p-3">&nbsp;</td>)}
                                </tr>
                            ) : paginatedDetails.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition">
                                    <td className="border px-3 py-2 text-left text-sm text-gray-700 truncate">{item.numeroCompte}</td>
                                    <td className="border px-3 py-2 text-left text-sm text-gray-700 truncate">{item.libelle}</td>
                                    <td className="border px-3 py-2 text-left text-sm text-gray-700 truncate">{item.categorie || item.nature}</td>
                                    <td className="border px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(item.montant)}</td>
                                    <td className="border px-3 py-2 text-left text-sm text-gray-700">{formatDate(item.date)}</td>
                                </tr>
                            ))}
                            {(!loading && paginatedDetails.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-gray-500 text-sm">Aucune donnée trouvée</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} setCurrentPage={setCurrentPage} />
            </main>
        </div>
    );
};

export default TransactionView;
