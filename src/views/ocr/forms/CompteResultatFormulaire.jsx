import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithReauth } from '../../../utils/apiUtils';
import { formatNumberWithSpaces, removeSpacesFromNumber } from '../../../utils/numberFormat';
import { getTodayISO } from '../../../utils/dateUtils';
import { useSaveCompteResultatManualMutation } from "../../../states/compta/comptaApiSlice";
import { useProjectId } from '../../../hooks/useProjectId';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import LoadingOverlay from '../../../components/layout/LoadingOverlay';
import ButtonSpinner from '../../../components/ui/ButtonSpinner';

const BackToFormsPage = ({ onClick }) => (
    <button onClick={onClick} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium flex items-center transition duration-150" title="Retour au menu de saisie">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Retour
    </button>
);



const PCG_MAPPING = {
    '60': { 'libelle': 'Achats de marchandises', 'nature': 'CHARGE' },
    '61': { 'libelle': 'Services extérieurs', 'nature': 'CHARGE' },
    '62': { 'libelle': 'Autres services extérieurs', 'nature': 'CHARGE' },
    '63': { 'libelle': 'Impôts et taxes', 'nature': 'CHARGE' },
    '64': { 'libelle': 'Charges de personnel', 'nature': 'CHARGE' },
    '65': { 'libelle': 'Autres charges de gestion courante', 'nature': 'CHARGE' },
    '66': { 'libelle': 'Charges financières', 'nature': 'CHARGE' },
    '67': { 'libelle': 'Charges exceptionnelles', 'nature': 'CHARGE' },
    '68': { 'libelle': 'Dotations aux amortissements et provisions', 'nature': 'CHARGE' },
    '695': { 'libelle': 'Impôts sur les bénéfices (IBS/IR)', 'nature': 'CHARGE' },
    '69': { 'libelle': 'Participation et impôts sur bénéfice', 'nature': 'CHARGE' },
    '70': { 'libelle': 'Ventes de marchandises/produits finis', 'nature': 'PRODUIT' },
    '71': { 'libelle': 'Production stockée', 'nature': 'PRODUIT' },
    '72': { 'libelle': 'Production immobilisée', 'nature': 'PRODUIT' },
    '74': { 'libelle': 'Subventions d\'exploitation', 'nature': 'PRODUIT' },
    '758': { 'libelle': 'Produits divers de gestion courante', 'nature': 'PRODUIT' },
    '75': { 'libelle': 'Autres produits de gestion courante', 'nature': 'PRODUIT' },
    '76': { 'libelle': 'Produits financiers', 'nature': 'PRODUIT' },
    '77': { 'libelle': 'Produits exceptionnels', 'nature': 'PRODUIT' },
    '78': { 'libelle': 'Reprises sur amortissements et provisions', 'nature': 'PRODUIT' },
};



export default function CompteResultatForm({ onSaisieCompleted }) {
    const [lignes, setLignes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const projectId = useProjectId();
    const [saveCompteResultatManual] = useSaveCompteResultatManualMutation();
    const [nouvelleLigne, setNouvelleLigne] = useState(() => ({
        numeroCompte: '',
        libelle: '',
        montant: '',
        date: getTodayISO(),
        nature: 'CHARGE',
    }));
    const [ligneEnModification, setLigneEnModification] = useState(null);
    const [erreurNumeroCompte, setErreurNumeroCompte] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteAll, setIsDeleteAll] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const formatMontant = useCallback((montant) => {
        if (typeof montant === 'string') {
            // Clean spaces and replace comma with dot before parsing
            montant = parseFloat(removeSpacesFromNumber(montant).replace(/,/g, '.'));
        }
        if (isNaN(montant)) return '0,00';
        // Return formatted with spaces for display if needed here, but usually this is used for final table display
        // Standard toLocaleString handles spaces for fr-FR
        return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        } catch (e) { return dateString; }
    }, []);

    const resetNouvelleLigne = useCallback((keepDate = false) => {
        setNouvelleLigne(prev => ({
            numeroCompte: '',
            libelle: '',
            montant: '',
            date: keepDate ? prev.date : getTodayISO(),
            nature: 'CHARGE',
        }));
        setLigneEnModification(null);
        setErreurNumeroCompte(false);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value, newNature = nouvelleLigne.nature, newLibelle = nouvelleLigne.libelle, newErreurNumeroCompte = false;

        if (name === 'numeroCompte') {
            newValue = value.replace(/\D/g, '').substring(0, 5);
            if (newValue.length > 0) {
                const firstChar = newValue[0];
                if (!['6', '7'].includes(firstChar)) {
                    newErreurNumeroCompte = true;
                    newNature = 'CHARGE';
                    newLibelle = '';
                } else {
                    let infoCompte = PCG_MAPPING[newValue.substring(0, 4)] || PCG_MAPPING[newValue.substring(0, 3)] || PCG_MAPPING[newValue.substring(0, 2)];
                    if (infoCompte) {
                        newLibelle = infoCompte.libelle;
                        newNature = infoCompte.nature;
                        newErreurNumeroCompte = false;
                    } else {
                        newLibelle = '';
                        newNature = firstChar === '6' ? 'CHARGE' : 'PRODUIT';
                    }
                }
            } else {
                newNature = 'CHARGE';
                newLibelle = '';
            }
            setErreurNumeroCompte(newErreurNumeroCompte);
            setNouvelleLigne(prev => ({ ...prev, [name]: newValue, libelle: newLibelle, nature: newNature }));
        } else if (name === 'montant') {
            const cleanValue = removeSpacesFromNumber(value);
            // Replace comma with dot for consistency if user types comma
            const normalizedValue = cleanValue.replace(/,/g, '.');
            const formattedValue = formatNumberWithSpaces(normalizedValue);
            setNouvelleLigne(prev => ({ ...prev, [name]: formattedValue }));
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
        if (erreurNumeroCompte || !['6', '7'].includes(nouvelleLigne.numeroCompte[0])) {
            setValidationErrors({ ...errors, numeroCompte: true });
            toast.error('Numéro de compte invalide. Doit commencer par 6 ou 7 (Comptes de Résultat).');
            return null;
        }

        setValidationErrors({});
        return montantValue;
    };

    const ajouterLigne = () => {
        if (ligneEnModification) {
            sauvegarderModification();
            return;
        }
        const montantValue = validateAndGetMontant();
        if (montantValue === null) return;
        setLignes([...lignes, { ...nouvelleLigne, id: Date.now(), montant: montantValue }]);
        resetNouvelleLigne(true);
    };

    const modifierLigne = (ligne) => {
        setLigneEnModification(ligne.id);
        setNouvelleLigne({
            numeroCompte: ligne.numeroCompte,
            libelle: ligne.libelle,
            montant: ligne.montant.toString(),
            nature: ligne.nature,
            date: ligne.date
        });
        setErreurNumeroCompte(false);
    };

    const sauvegarderModification = () => {
        const montantValue = validateAndGetMontant();
        if (montantValue === null) return;
        setLignes(lignes.map(ligne =>
            ligne.id === ligneEnModification ? { ...ligne, ...nouvelleLigne, montant: montantValue } : ligne
        ));
        resetNouvelleLigne(true);
    };

    const supprimerLigne = (id) => {
        setItemToDelete(id);
        setIsDeleteAll(false);
        setDeleteModalOpen(true);
    };

    const handleDeleteAll = () => {
        setIsDeleteAll(true);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (isDeleteAll) {
            setLignes([]);
            resetNouvelleLigne(true);
            toast.success("Toutes les lignes ont été supprimées.");
        } else {
            if (itemToDelete) {
                setLignes(lignes.filter(ligne => ligne.id !== itemToDelete));
                if (ligneEnModification === itemToDelete) resetNouvelleLigne(true);
                toast.success("Ligne supprimée.");
            }
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setIsDeleteAll(false);
    };

    const { resultat } = useMemo(() => {
        const charges = lignes.filter(l => l.nature === 'CHARGE').reduce((sum, l) => sum + l.montant, 0);
        const produits = lignes.filter(l => l.nature === 'PRODUIT').reduce((sum, l) => sum + l.montant, 0);
        return { resultat: produits - charges };
    }, [lignes]);

    const enregistrerCompteResultat = async () => {
        if (lignes.length === 0) {
            toast.error("Ajoutez au moins une ligne avant d'enregistrer");
            return;
        }

        setIsLoading(true);
        try {
            const promises = lignes.map(ligne => {
                const payload = {
                    numero_compte: ligne.numeroCompte,
                    libelle: ligne.libelle,
                    montant_ar: ligne.montant,
                    date: ligne.date,
                    nature: ligne.nature // CHARGE / PRODUIT
                };

                return fetchWithReauth('/CompteResultats/manual/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                return saveCompteResultatManual({ data: payload, project_id: projectId }).unwrap();
            });

            await Promise.all(promises);
            toast.success("Enregistrement succès");
            setLignes([]);
            if (onSaisieCompleted) onSaisieCompleted();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error('❌ Erreur lors de l\'enregistrement du compte de résultat');
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
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex-shrink-0"><BackToFormsPage onClick={onSaisieCompleted} /></div>
                        <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 flex-1 text-center px-4">Saisie manuelle du compte de résultat</h1>
                        <div className="flex-shrink-0 w-[88px]"></div>
                    </div>
                </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto w-full p-3">

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border-t-2 border-gray-300 dark:border-gray-700">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">{ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une nouvelle ligne'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">N° Compte (6xx-7xx)</label>
                                <input type="text" name="numeroCompte" value={nouvelleLigne.numeroCompte} onChange={handleChange} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${erreurNumeroCompte || validationErrors.numeroCompte ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`} placeholder="Ex: 607" />
                                {erreurNumeroCompte && <p className="text-red-600 dark:text-red-400 text-xs mt-1">Doit commencer par 6 ou 7</p>}
                            </div>
                            <div className="md:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Libellé</label>
                                <input type="text" name="libelle" value={nouvelleLigne.libelle} onChange={handleChange} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.libelle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="Ex: Achat de fournitures" />
                                {isCompteMappe && <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Auto-rempli (modifiable)</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Montant (Ar)</label>
                                <input type="text" name="montant" value={nouvelleLigne.montant} onChange={handleChange} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-right ${validationErrors.montant ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="0.00" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nature</label>
                                <select name="nature" value={nouvelleLigne.nature} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700">
                                    <option value="CHARGE">CHARGE (6xx)</option>
                                    <option value="PRODUIT">PRODUIT (7xx)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                                <input type="date" name="date" value={nouvelleLigne.date} onChange={handleChange} max={getTodayISO()} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button onClick={ajouterLigne} disabled={erreurNumeroCompte} className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-semibold text-sm py-1 px-4 rounded-lg shadow-md transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ligneEnModification ? "M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                                {ligneEnModification ? 'Valider modif.' : 'Ajouter ligne'}
                            </button>
                        </div>
                    </div>

                    {lignes.length > 0 && (
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleDeleteAll}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-semibold flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Supprimer tout
                            </button>
                        </div>
                    )}

                    {lignes.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
                            <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[50vh] min-h-[200px]">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">Compte</th>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[35%]">Libellé</th>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Nature</th>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Montant (Ar)</th>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">Date</th>
                                            <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                        {lignes.map((ligne, index) => (
                                            <tr key={ligne.id} className={`${index % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''} hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors duration-150`}>
                                                <td className="px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">{ligne.numeroCompte}</td>
                                                <td className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 font-medium">{ligne.libelle}</td>
                                                <td className="px-2 py-1 text-xs"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.nature === 'PRODUIT' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>{ligne.nature}</span></td>
                                                <td className="px-2 py-1 text-sm text-right font-bold text-gray-900 dark:text-gray-100">{formatMontant(ligne.montant)}</td>
                                                <td className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">{formatDate(ligne.date)}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">
                                                    <div className='flex justify-center gap-1'>
                                                        <button onClick={() => modifierLigne(ligne)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition disabled:text-gray-400 p-1" title="Modifier" disabled={ligneEnModification !== null}>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition disabled:text-gray-400 p-1" title="Supprimer" disabled={ligneEnModification !== null}>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden space-y-3 p-3 max-h-[50vh] overflow-y-auto">
                                {lignes.map((ligne) => (
                                    <div key={ligne.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-semibold">{ligne.numeroCompte}</span>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.nature === 'PRODUIT' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>{ligne.nature}</span>
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">{ligne.libelle}</div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Montant:</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatMontant(ligne.montant)} Ar</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ligne.date)}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => modifierLigne(ligne)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Modifier" disabled={ligneEnModification !== null}>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Supprimer" disabled={ligneEnModification !== null}>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {lignes.length > 0 && (
                        <div className="mt-0 p-4 flex justify-end items-center bg-white dark:bg-gray-800 border-t dark:border-gray-700 rounded-lg shadow-lg">
                            <button onClick={enregistrerCompteResultat} disabled={isLoading || lignes.length === 0} className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center">
                                {isLoading ? (
                                    <>
                                        <ButtonSpinner className="mr-2" />
                                        <span>Traitement...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Valider
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {lignes.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            <p className="text-base text-gray-800 dark:text-gray-200">Aucune ligne de compte de résultat ajoutée pour le moment</p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Saisissez les informations de compte de résultat (Comptes 6 et 7) ci-dessus.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={isDeleteAll ? "Vider le compte de résultat ?" : "Supprimer la ligne ?"}
                message={isDeleteAll
                    ? "Cette action supprimera toutes les lignes en cours de saisie. Cette action est irréversible."
                    : "Êtes-vous sûr de vouloir supprimer cette ligne ?"}
                confirmText={isDeleteAll ? "Tout supprimer" : "Supprimer"}
                isDanger={true}
            />
        </div>
    );
}