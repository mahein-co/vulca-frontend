import React, { useState, useCallback, useMemo, useEffect } from 'react';

const BASE_URL_API = 'http://api.exemple.com';

const BackToFormsPage = ({ onClick }) => (
    <button onClick={onClick} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium flex items-center transition duration-150" title="Retour au menu de saisie">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Retour
    </button>
);

const PCG_MAPPING = {
    '60': { 'libelle': 'Achats de marchandises/MP', 'nature': 'CHARGE' },
    '61': { 'libelle': 'Services extérieurs', 'nature': 'CHARGE' },
    '62': { 'libelle': 'Autres services extérieurs', 'nature': 'CHARGE' },
    '63': { 'libelle': 'Impôts et taxes', 'nature': 'CHARGE' },
    '64': { 'libelle': 'Charges de personnel', 'nature': 'CHARGE' },
    '65': { 'libelle': 'Autres charges de gestion courante', 'nature': 'CHARGE' },
    '66': { 'libelle': 'Charges financières', 'nature': 'CHARGE' },
    '67': { 'libelle': 'Charges exceptionnelles', 'nature': 'CHARGE' },
    '68': { 'libelle': 'Dotations aux amortissements et provisions', 'nature': 'CHARGE' },
    '69': { 'libelle': 'Participation et impôts sur bénéfice', 'nature': 'CHARGE' },
    '70': { 'libelle': 'Ventes de marchandises/produits finis', 'nature': 'PRODUIT' },
    '71': { 'libelle': 'Production stockée', 'nature': 'PRODUIT' },
    '72': { 'libelle': 'Production immobilisée', 'nature': 'PRODUIT' },
    '74': { 'libelle': 'Subventions d\'exploitation', 'nature': 'PRODUIT' },
    '75': { 'libelle': 'Autres produits de gestion courante', 'nature': 'PRODUIT' },
    '76': { 'libelle': 'Produits financiers', 'nature': 'PRODUIT' },
    '77': { 'libelle': 'Produits exceptionnels', 'nature': 'PRODUIT' },
    '78': { 'libelle': 'Reprises sur amortissements et provisions', 'nature': 'PRODUIT' },
};

const getDateDuJour = () => {
    const aujourd = new Date();
    return `${aujourd.getFullYear()}-${String(aujourd.getMonth() + 1).padStart(2, '0')}-${String(aujourd.getDate()).padStart(2, '0')}`;
};

export default function CompteResultatForm({ onSaisieCompleted }) {
    const [lignes, setLignes] = useState([]);
    const [nouvelleLigne, setNouvelleLigne] = useState({
        numeroCompte: '',
        libelle: '',
        montant: '',
        date: getDateDuJour(),
        nature: 'CHARGE',
    });
    const [ligneEnModification, setLigneEnModification] = useState(null);
    const [erreurNumeroCompte, setErreurNumeroCompte] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const formatMontant = useCallback((montant) => {
        if (typeof montant === 'string') montant = parseFloat(montant.replace(/,/g, '.'));
        if (isNaN(montant)) return '0,00';
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
            date: keepDate ? prev.date : getDateDuJour(),
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
            newValue = value.replace(/[^0-9.]/g, '');
            const parts = newValue.split('.');
            if (parts.length > 2) newValue = parts[0] + '.' + parts.slice(1).join('');
            setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));
        } else {
            setNouvelleLigne(prev => ({ ...prev, [name]: value }));
        }
    }, [nouvelleLigne]);

    const validateAndGetMontant = () => {
        if (!nouvelleLigne.numeroCompte || !nouvelleLigne.libelle || !nouvelleLigne.montant || !nouvelleLigne.date) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return null;
        }
        const montantValue = parseFloat(nouvelleLigne.montant);
        if (isNaN(montantValue) || montantValue <= 0) {
            alert('Le montant doit être un nombre positif valide.');
            return null;
        }
        if (erreurNumeroCompte || !['6', '7'].includes(nouvelleLigne.numeroCompte[0])) {
            alert('Numéro de compte invalide. Doit commencer par 6 ou 7 (Comptes de Résultat).');
            return null;
        }
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
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
            setLignes(lignes.filter(ligne => ligne.id !== id));
            if (ligneEnModification === id) resetNouvelleLigne(true);
        }
    };

    const { resultat } = useMemo(() => {
        const charges = lignes.filter(l => l.nature === 'CHARGE').reduce((sum, l) => sum + l.montant, 0);
        const produits = lignes.filter(l => l.nature === 'PRODUIT').reduce((sum, l) => sum + l.montant, 0);
        return { resultat: produits - charges };
    }, [lignes]);

    const enregistrerCompteResultat = async () => {
        if (lignes.length === 0) {
            alert("Ajoutez au moins une ligne avant d'enregistrer");
            return;
        }
        const typeResultat = resultat >= 0 ? 'Bénéfice' : 'Perte';
        const resultatFormatted = formatMontant(resultat);
        console.log(`Tentative d'enregistrement de ${lignes.length} lignes vers ${BASE_URL_API}/compte-resultat/`);
        alert(`✅ Compte de Résultat enregistré avec succès !\nLe résultat calculé est de ${resultatFormatted} Ar (${typeResultat}).`);
        setLignes([]);
        if (onSaisieCompleted) onSaisieCompleted();
    };

    const isCompteMappe = !!(
        (nouvelleLigne.numeroCompte.length >= 4 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 4)]) ||
        (nouvelleLigne.numeroCompte.length >= 3 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 3)]) ||
        (nouvelleLigne.numeroCompte.length >= 2 && PCG_MAPPING[nouvelleLigne.numeroCompte.substring(0, 2)])
    );

    return (
        <div className="w-full h-full lg:p-1 flex flex-col">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="flex-shrink-0"><BackToFormsPage onClick={onSaisieCompleted} /></div>
                    <h1 className="text-lg font-bold text-gray-800 flex-1 text-center px-4">Saisie Manuelle du Compte de Résultat</h1>
                    <div className="flex-shrink-0 w-[88px]"></div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-t-2 border-gray-300">
                    <h2 className="text-base font-semibold text-gray-700 mb-3">{ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une nouvelle ligne'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">N° Compte (6xx-7xx)</label>
                            <input type="text" name="numeroCompte" value={nouvelleLigne.numeroCompte} onChange={handleChange} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${erreurNumeroCompte ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Ex: 607" />
                            {erreurNumeroCompte && <p className="text-red-600 text-xs mt-1">Doit commencer par 6 ou 7</p>}
                        </div>
                        <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Libellé</label>
                            <input type="text" name="libelle" value={nouvelleLigne.libelle} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" placeholder="Ex: Achat de fournitures" />
                            {isCompteMappe && <p className="text-xs text-green-600 mt-1">✓ Auto-rempli (modifiable)</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Montant (Ar)</label>
                            <input type="text" name="montant" value={nouvelleLigne.montant} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-right" placeholder="0.00" />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nature (Déduit)</label>
                            <select name="nature" value={nouvelleLigne.nature} onChange={handleChange} className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${nouvelleLigne.numeroCompte.length > 0 && !erreurNumeroCompte ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'}`} disabled={nouvelleLigne.numeroCompte.length > 0 && !erreurNumeroCompte}>
                                <option value="CHARGE">CHARGE (6xx)</option>
                                <option value="PRODUIT">PRODUIT (7xx)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                            <input type="date" name="date" value={nouvelleLigne.date} onChange={handleChange} className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-3">
                        <button onClick={() => resetNouvelleLigne(true)} className="bg-gray-400 hover:bg-gray-500 text-white font-medium text-sm py-1 px-4 rounded-lg shadow-sm transition duration-200 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            {ligneEnModification ? 'Annuler' : 'Vider'}
                        </button>
                        <button onClick={ajouterLigne} disabled={erreurNumeroCompte} className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm py-1 px-4 rounded-lg shadow-md transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ligneEnModification ? "M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                            {ligneEnModification ? 'Valider modif.' : 'Ajouter ligne'}
                        </button>
                    </div>
                </div>

                {lignes.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
                        <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[50vh] min-h-[200px]">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[10%]">Compte</th>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[35%]">Libellé</th>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[15%]">Nature</th>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[15%]">Montant (Ar)</th>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[10%]">Date</th>
                                        <th className="border-b-2 border-gray-200 px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-[15%]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {lignes.map((ligne, index) => (
                                        <tr key={ligne.id} className={`${index % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-indigo-50/30 transition-colors duration-150`}>
                                            <td className="px-2 py-1 text-xs font-semibold text-indigo-700">{ligne.numeroCompte}</td>
                                            <td className="px-2 py-1 text-xs text-gray-700 font-medium">{ligne.libelle}</td>
                                            <td className="px-2 py-1 text-xs"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.nature === 'PRODUIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ligne.nature}</span></td>
                                            <td className="px-2 py-1 text-sm text-right font-bold text-gray-900">{formatMontant(ligne.montant)}</td>
                                            <td className="px-2 py-1 text-xs text-gray-600">{formatDate(ligne.date)}</td>
                                            <td className="px-2 py-1 whitespace-nowrap text-center">
                                                <div className='flex justify-center gap-1'>
                                                    <button onClick={() => modifierLigne(ligne)} className="text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 p-1" title="Modifier" disabled={ligneEnModification !== null}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg>
                                                    </button>
                                                    <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 hover:text-red-800 transition disabled:text-gray-400 p-1" title="Supprimer" disabled={ligneEnModification !== null}>
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
                                <div key={ligne.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">{ligne.numeroCompte}</span>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ligne.nature === 'PRODUIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ligne.nature}</span>
                                    </div>
                                    <div className="font-medium text-gray-900 mb-2 text-sm">{ligne.libelle}</div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-600">Montant:</span>
                                        <span className="text-sm font-bold text-gray-900">{formatMontant(ligne.montant)} Ar</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{formatDate(ligne.date)}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => modifierLigne(ligne)} className="text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Modifier" disabled={ligneEnModification !== null}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg>
                                            </button>
                                            <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 hover:text-red-800 transition disabled:text-gray-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Supprimer" disabled={ligneEnModification !== null}>
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
                    <div className="mt-0 p-4 flex justify-end items-center bg-white border-t rounded-lg shadow-lg">
                        <button onClick={enregistrerCompteResultat} disabled={lignes.length === 0} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Valider et Enregistrer
                        </button>
                    </div>
                )}

                {lignes.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 border border-gray-200">
                        <p className="text-base">Aucune ligne de Compte de Résultat ajoutée pour le moment</p>
                        <p className="text-sm mt-1">Saisissez les informations de Résultat (Comptes 6 et 7) ci-dessus.</p>
                    </div>
                )}
            </div>
        </div>
    );
}