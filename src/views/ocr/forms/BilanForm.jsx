import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { formatNumberWithSpaces, removeSpacesFromNumber } from '../../../utils/numberFormat';
import { getTodayISO } from '../../../utils/dateUtils';
import { BASE_URL_API } from '../../../constants/globalConstants';

const BackToFormsPage = ({ onClick }) => (
    <button
        onClick={onClick}
        className="text-indigo-500 hover:text-indigo-700 text-xs font-medium flex items-center transition duration-150"
        title="Retour au menu de saisie"
    >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Retour
    </button>
);

const LoadingOverlay = ({ message }) => (
    <div className="fixed inset-0 backdrop-blur-sm z-[10000] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-800 animate-pulse px-4">{message}</p>
        </div>
    </div>
);

const PCG_MAPPING = {
    // CLASSE 1 : CAPITAUX PROPRES & PASSIFS NON COURANTS
    '10': { 'libelle': 'Capital social', 'type_bilan': 'Passif', 'categorie': 'Capitaux propres' },
    '11': { 'libelle': 'Réserves', 'type_bilan': 'Passif', 'categorie': 'Capitaux propres' },
    '12': { 'libelle': 'Report à nouveau / Résultat', 'type_bilan': 'Passif', 'categorie': 'Capitaux propres' },
    '13': { 'libelle': 'Subventions d\'investissement', 'type_bilan': 'Passif', 'categorie': 'Capitaux propres' },
    '15': { 'libelle': 'Provisions pour charges (LT)', 'type_bilan': 'Passif', 'categorie': 'Passifs non courants' },
    '16': { 'libelle': 'Emprunts et dettes assimilés', 'type_bilan': 'Passif', 'categorie': 'Passifs non courants' },
    '17': { 'libelle': 'Dettes rattachées à des participations', 'type_bilan': 'Passif', 'categorie': 'Passifs non courants' },
    '18': { 'libelle': 'Comptes de liaison des établissements', 'type_bilan': 'Passif', 'categorie': 'Capitaux propres' },

    // CLASSE 2 : ACTIFS NON COURANTS
    '20': { 'libelle': 'Immobilisations incorporelles', 'type_bilan': 'Actif', 'categorie': 'Actif non courants' },
    '21': { 'libelle': 'Immobilisations corporelles', 'type_bilan': 'Actif', 'categorie': 'Actif non courants' },
    '22': { 'libelle': 'Immobilisations mises en concession', 'type_bilan': 'Actif', 'categorie': 'Actif non courants' },
    '26': { 'libelle': 'Immobilisations financières', 'type_bilan': 'Actif', 'categorie': 'Actif non courants' },
    '28': { 'libelle': 'Amortissements (Réduction Actif)', 'type_bilan': 'Actif', 'categorie': 'Actif non courants' },

    // CLASSE 3 : ACTIFS COURANTS (STOCKS)
    '30': { 'libelle': 'Stocks de marchandises', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '31': { 'libelle': 'Stocks de matières premières', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '32': { 'libelle': 'Autres approvisionnements', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '35': { 'libelle': 'Stocks de produits', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },

    // CLASSE 4 : COMPTES DE TIERS (COURANTS)
    '40': { 'libelle': 'Fournisseurs et comptes rattachés', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '41': { 'libelle': 'Clients et comptes rattachés', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '42': { 'libelle': 'Personnel et comptes rattachés', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '43': { 'libelle': 'Organismes sociaux', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '44': { 'libelle': 'Etat, impôts et taxes', 'type_bilan': 'PASSIF', 'categorie': 'PASSIFS_COURANTS' },
    // # État - Impôts et taxes (442, 443, 444...) Etat, impôts et taxes
    '4456': { 'libelle': 'TVA déductible', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '4457': { 'libelle': 'TVA collectée', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '45': { 'libelle': 'Associés et Groupe', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '46': { 'libelle': 'Débiteurs/Créditeurs divers', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '48': { 'libelle': 'Charges/Produits constatés d\'avance', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },

    // CLASSE 5 : TRESORERIE
    '50': { 'libelle': 'Valeurs mobilières de placement', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '51': { 'libelle': 'Banques (Solde débiteur)', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
    '519': { 'libelle': 'Concours bancaires (Découverts)', 'type_bilan': 'Passif', 'categorie': 'Passifs courants' },
    '53': { 'libelle': 'Caisse', 'type_bilan': 'Actif', 'categorie': 'Actif courants' },
};

const categoriesActif = ['Actif non courants', 'Actif courants'];
const categoriesPassif = ['Capitaux propres', 'Passifs non courants', 'Passifs courants'];



export default function BilanForm({ onSaisieCompleted }) {

    const [lignes, setLignes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nouvelleLigne, setNouvelleLigne] = useState(() => ({
        numeroCompte: '',
        libelle: '',
        montant: '',
        date: getTodayISO(),
        type: 'Actif',
        categorie: 'Actif non courants'
    }));
    const [ligneEnModification, setLigneEnModification] = useState(null);
    const [erreurNumeroCompte, setErreurNumeroCompte] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (!nouvelleLigne.date) {
            setNouvelleLigne(prev => ({ ...prev, date: getTodayISO() }));
        }
    }, []);

    const formatMontant = useCallback((montant) => {
        if (typeof montant === 'string') {
            montant = parseFloat(montant.replace(/,/g, '.'));
        }
        if (isNaN(montant)) return '0,00';
        return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    }, []);

    const resetNouvelleLigne = useCallback((keepDate = false) => {
        setNouvelleLigne(prev => ({
            numeroCompte: '',
            libelle: '',
            montant: '',
            date: keepDate ? prev.date : getTodayISO(),
            type: 'Actif',
            categorie: 'Actif non courants'
        }));
        setLigneEnModification(null);
        setErreurNumeroCompte(false);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;
        let newType = nouvelleLigne.type;
        let newCategorie = nouvelleLigne.categorie;
        let newLibelle = nouvelleLigne.libelle;
        let newErreurNumeroCompte = false;

        if (name === 'numeroCompte') {
            newValue = value.replace(/\D/g, '').substring(0, 5);

            if (newValue.length > 0) {
                const firstChar = newValue[0];

                if (!['1', '2', '3', '4', '5'].includes(firstChar)) {
                    newErreurNumeroCompte = true;
                    newType = 'Actif';
                    newCategorie = 'Actif non courants';
                    newLibelle = '';
                } else if (newValue.startsWith('51')) {
                    // Logique PCG 2005 : Gestion des comptes de trésorerie (51x)

                    // On vérifie le type choisi ou le signe du montant (si disponible)
                    // Règle : Solde débiteur (+) = Actif | Solde créditeur (-) = Passif
                    newType = nouvelleLigne.type;

                    if (newType === 'Passif') {
                        // Un compte 51 au passif devient officiellement un "Concours bancaire"
                        newLibelle = "Concours bancaires courants";
                        newCategorie = 'Passifs courants';
                    } else {
                        // Par défaut ou si sélectionné comme Actif
                        newLibelle = "Banque";
                        newCategorie = 'Actif courants';
                    }

                    newErreurNumeroCompte = false;
                } else {
                    let infoCompte = null;
                    // Recherche exacte ou par préfixe
                    if (newValue.length >= 4 && PCG_MAPPING[newValue.substring(0, 4)]) {
                        infoCompte = PCG_MAPPING[newValue.substring(0, 4)];
                    } else if (newValue.length >= 3 && PCG_MAPPING[newValue.substring(0, 3)]) {
                        infoCompte = PCG_MAPPING[newValue.substring(0, 3)];
                    } else if (newValue.length >= 2 && PCG_MAPPING[newValue.substring(0, 2)]) {
                        infoCompte = PCG_MAPPING[newValue.substring(0, 2)];
                    }

                    if (infoCompte) {
                        newLibelle = infoCompte.libelle;
                        newType = infoCompte.type_bilan;
                        newCategorie = infoCompte.categorie;
                        newErreurNumeroCompte = false;
                    } else {
                        newLibelle = '';
                        if (firstChar === '1') {
                            newType = 'Passif';
                            newCategorie = 'Capitaux propres';
                        } else if (firstChar === '2') {
                            newType = 'Actif';
                            newCategorie = 'Actif non courants';
                        } else {
                            newType = ['3', '5'].includes(firstChar) ? 'Actif' : 'Passif';
                            newCategorie = newType === 'Actif' ? 'Actif courants' : 'Passifs courants';
                        }
                    }
                }
            } else {
                newType = 'Actif';
                newCategorie = 'Actif non courants';
                newLibelle = '';
            }

            setErreurNumeroCompte(newErreurNumeroCompte);
            setNouvelleLigne(prev => ({
                ...prev,
                [name]: newValue,
                libelle: newLibelle,
                type: newType,
                categorie: newCategorie
            }));

        } else if (name === 'montant') {
            const cleanValue = removeSpacesFromNumber(value);
            newValue = formatNumberWithSpaces(cleanValue);
            setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));

        } else if (name === 'type') {
            // Logique intelligente pour la catégorie en fonction du type sélectionné
            let nextCategorie = 'Actif non courants';
            let nextLibelle = nouvelleLigne.libelle;

            // Logique spécifique pour les comptes 51
            const isCompte51 = nouvelleLigne.numeroCompte.startsWith('51');

            if (value === 'Actif') {
                if (['3', '4', '5'].includes(nouvelleLigne.numeroCompte[0])) {
                    nextCategorie = 'Actif courants';
                } else {
                    nextCategorie = 'Actif non courants';
                }

                if (isCompte51) {
                    nextLibelle = "Banque";
                }
            } else { // Passif
                if (isCompte51) {
                    nextCategorie = 'Passifs courants'; // Concours bancaires
                    nextLibelle = "Concours bancaires courants";
                } else if (['4', '5'].includes(nouvelleLigne.numeroCompte[0])) {
                    nextCategorie = 'Passifs courants';
                } else {
                    nextCategorie = 'Capitaux propres'; // Default pour 1, etc.
                }
            }

            setNouvelleLigne(prev => ({
                ...prev,
                [name]: value,
                categorie: nextCategorie,
                libelle: nextLibelle
            }));
        } else {
            setNouvelleLigne(prev => ({ ...prev, [name]: value }));
        }

        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: false }));
        }
    }, [nouvelleLigne, validationErrors]);

    const validateAndGetMontant = () => {
        const errors = {};
        if (!nouvelleLigne.numeroCompte) errors.numeroCompte = true;
        if (!nouvelleLigne.libelle) errors.libelle = true;
        if (!nouvelleLigne.montant) errors.montant = true;
        if (!nouvelleLigne.date) errors.date = true;

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Veuillez remplir tous les champs obligatoires.');
            return null;
        }

        const montantValue = parseFloat(removeSpacesFromNumber(nouvelleLigne.montant));
        if (isNaN(montantValue) || montantValue <= 0) {
            setValidationErrors({ ...errors, montant: true });
            toast.error('Le montant doit être un nombre positif valide.');
            return null;
        }
        if (erreurNumeroCompte || !['1', '2', '3', '4', '5'].includes(nouvelleLigne.numeroCompte[0])) {
            setValidationErrors({ ...errors, numeroCompte: true });
            toast.error('Numéro de compte invalide. Doit commencer par 1, 2, 3, 4 ou 5.');
            return null;
        }

        setValidationErrors({});
        return montantValue;
    }

    const ajouterLigne = () => {
        if (ligneEnModification) {
            sauvegarderModification();
            return;
        }
        const montantValue = validateAndGetMontant();
        if (montantValue === null) return;

        const ligne = {
            ...nouvelleLigne,
            id: Date.now(),
            montant: montantValue
        };
        setLignes([...lignes, ligne]);
        resetNouvelleLigne(true);
    };

    const modifierLigne = (ligne) => {
        setLigneEnModification(ligne.id);
        setNouvelleLigne({
            numeroCompte: ligne.numeroCompte,
            libelle: ligne.libelle,
            montant: ligne.montant.toString(),
            type: ligne.type,
            categorie: ligne.categorie,
            date: ligne.date
        });
        setErreurNumeroCompte(false);
    };

    const sauvegarderModification = () => {
        const montantValue = validateAndGetMontant();
        if (montantValue === null) return;

        setLignes(lignes.map(ligne =>
            ligne.id === ligneEnModification
                ? { ...ligne, ...nouvelleLigne, montant: montantValue }
                : ligne
        ));
        resetNouvelleLigne(true);
    };

    const supprimerLigne = (id) => {
        setLignes(lignes.filter(ligne => ligne.id !== id));
        if (ligneEnModification === id) resetNouvelleLigne(true);
    };

    const { ecart } = useMemo(() => {
        const actif = lignes.filter(l => l.type === 'Actif').reduce((sum, l) => sum + l.montant, 0);
        const passif = lignes.filter(l => l.type === 'Passif').reduce((sum, l) => sum + l.montant, 0);
        return {
            totalActif: actif,
            totalPassif: passif,
            ecart: actif - passif
        };
    }, [lignes]);

    const enregistrerBilan = async () => {
        if (lignes.length === 0) {
            alert("Ajoutez au moins une ligne avant d'enregistrer");
            return;
        }

        const statut = ecart === 0
            ? 'équilibré'
            : `non équilibré (Écart: ${formatMontant(ecart)} Ar)`;

        setIsLoading(true);
        try {
            const promises = lignes.map(ligne => {
                const payload = {
                    numero_compte: ligne.numeroCompte,
                    libelle: ligne.libelle,
                    montant_ar: ligne.montant,
                    date: ligne.date,
                    type_bilan: ligne.type?.toUpperCase(), // ACTIF / PASSIF
                    categorie: ligne.categorie?.toUpperCase().replace(/ /g, '_') // ACTIF_COURANTS, etc.
                };

                return fetch(`${BASE_URL_API}/bilans/manual/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
            });

            await Promise.all(promises);
            toast.success("Enregistrement succès");
            setLignes([]);
            if (onSaisieCompleted) {
                onSaisieCompleted();
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error('❌ Erreur lors de l\'enregistrement du bilan');
        } finally {
            setIsLoading(false);
        }
    };

    const isCompteMappe = !!(
        (nouvelleLigne.numeroCompte.length >= 4 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 4)]) ||
        (nouvelleLigne.numeroCompte.length >= 3 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 3)]) ||
        (nouvelleLigne.numeroCompte.length >= 2 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 2)])
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {isLoading && <LoadingOverlay message="Validation et enregistrement en cours..." />}
            {/* Header fixe */}
            <div className="flex-shrink-0 bg-white border-b shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex-shrink-0">
                            <BackToFormsPage onClick={onSaisieCompleted} />
                        </div>
                        <h1 className="text-base font-bold text-gray-800 flex-1 text-center px-4">
                            Saisie Manuelle du Bilan
                        </h1>
                        <div className="flex-shrink-0 w-[88px]"></div>
                    </div>
                </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto w-full p-3">

                    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-t-2 border-gray-300">
                        <h2 className="text-base font-semibold text-gray-700 mb-3">
                            {ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une nouvelle ligne'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">N° Compte (1xx-5xx)</label>
                                <input
                                    type="text"
                                    name="numeroCompte"
                                    value={nouvelleLigne.numeroCompte}
                                    onChange={handleChange}
                                    className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${erreurNumeroCompte || validationErrors.numeroCompte ? 'border-2 border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                                    placeholder="Ex: 4457"
                                />
                                {erreurNumeroCompte && (
                                    <p className="text-red-600 text-xs mt-1">Doit commencer par 1, 2, 3, 4 ou 5</p>
                                )}
                            </div>

                            <div className="md:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Libellé</label>
                                <input
                                    type="text"
                                    name="libelle"
                                    value={nouvelleLigne.libelle}
                                    onChange={handleChange}
                                    className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 ${validationErrors.libelle ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 focus:border-indigo-500'}`}
                                    placeholder="Ex: TVA collectée"
                                />
                                {isCompteMappe && (
                                    <p className="text-xs text-green-600 mt-1">✓ Auto-rempli (modifiable)</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Montant (Ar)</label>
                                <input
                                    type="text"
                                    name="montant"
                                    value={nouvelleLigne.montant}
                                    onChange={handleChange}
                                    className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 text-right ${validationErrors.montant ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 focus:border-indigo-500'}`}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={nouvelleLigne.type}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white"
                                >
                                    <option value="Actif">Actif</option>
                                    <option value="Passif">Passif</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                                <select
                                    name="categorie"
                                    value={nouvelleLigne.categorie}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white"
                                >
                                    {(nouvelleLigne.type === 'Actif' ? categoriesActif : categoriesPassif).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={nouvelleLigne.date}
                                    onChange={handleChange}
                                    className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 ${validationErrors.date ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 focus:border-indigo-500'}`}
                                />
                            </div>

                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={ajouterLigne}
                                disabled={erreurNumeroCompte}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm py-1 px-4 rounded-lg shadow-md transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ligneEnModification ? "M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                </svg>
                                {ligneEnModification ? 'Valider modif.' : 'Ajouter ligne'}
                            </button>
                        </div>
                    </div>

                    {lignes.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">

                            <div className="hidden md:block">
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[10%]">Compte</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[20%]">Libellé</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[10%]">Type</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[20%]">Catégorie</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[15%]">Montant (Ar)</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[10%]">Date</th>
                                                <th className="border-b-2 border-gray-200 px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-[10%]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {lignes.map((ligne, index) => (
                                                <tr key={ligne.id} className={`${index % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-indigo-50/30 transition-colors duration-150`}>
                                                    <td className="px-2 py-1 text-xs font-semibold text-indigo-700">{ligne.numeroCompte}</td>
                                                    <td className="px-2 py-1 text-xs text-gray-700 font-medium">{ligne.libelle}</td>
                                                    <td className="px-2 py-1 text-xs">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.type === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {ligne.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-700">{ligne.categorie}</td>
                                                    <td className="px-2 py-1 text-sm text-right font-bold text-gray-900">{formatMontant(ligne.montant)}</td>
                                                    <td className="px-2 py-1 text-xs text-gray-600">{formatDate(ligne.date)}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-center">
                                                        <div className='flex justify-center gap-1'>
                                                            <button
                                                                onClick={() => modifierLigne(ligne)}
                                                                className="text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 p-1"
                                                                title="Modifier"
                                                                disabled={ligneEnModification !== null}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => supprimerLigne(ligne.id)}
                                                                className="text-red-600 hover:text-red-800 transition disabled:text-gray-400 p-1"
                                                                title="Supprimer"
                                                                disabled={ligneEnModification !== null}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="md:hidden">
                                <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
                                    {lignes.map((ligne) => (
                                        <div key={ligne.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">
                                                    {ligne.numeroCompte}
                                                </span>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.type === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {ligne.type}
                                                </span>
                                            </div>
                                            <div className="font-medium text-gray-900 mb-2 text-sm">{ligne.libelle}</div>
                                            <div className="text-xs text-gray-600 mb-2">{ligne.categorie}</div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-600">Montant:</span>
                                                <span className="text-sm font-bold text-gray-900">{formatMontant(ligne.montant)} Ar</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">{formatDate(ligne.date)}</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => modifierLigne(ligne)}
                                                        className="text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Modifier"
                                                        disabled={ligneEnModification !== null}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => supprimerLigne(ligne.id)}
                                                        className="text-red-600 hover:text-red-800 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                                        title="Supprimer"
                                                        disabled={ligneEnModification !== null}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {lignes.length > 0 && (
                        <div className="mt-0 p-4 flex justify-end items-center bg-white border-t rounded-lg shadow-lg">
                            <button
                                onClick={enregistrerBilan}
                                disabled={lignes.length === 0}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Valider
                            </button>
                        </div>
                    )}

                    {lignes.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 border border-gray-200">
                            <p className="text-base">Aucune ligne ajoutée pour le moment</p>
                            <p className="text-sm mt-1">Saisissez les informations de Bilan (Comptes 1 à 5) ci-dessus.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}