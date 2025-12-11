import React, { useState } from 'react';
// import BackToFormsPage from "../../../components/button/BackToFormsPage"; 
// import { BASE_URL_API } from '../../../constants/globalConstants'; 

// Constantes pour simuler les imports
const BASE_URL_API = 'http://api.exemple.com';
const BackToFormsPage = () => <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    Retour
</button>;


export default function CompteResultatForm({ onSaisieCompleted }) {
    const [lignes, setLignes] = useState([]);
    const [nouvelleLigne, setNouvelleLigne] = useState({
        numeroCompte: '',
        libelle: '',
        montant: '',
        nature: 'Charge',
        date: ''
    });
    const [ligneEnModification, setLigneEnModification] = useState(null);
    const [errorNumeroCompte, setErrorNumeroCompte] = useState(false);
    
    // --- Fonctions de Gestion des États ---

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'numeroCompte') {
            
            // LOGIQUE DE BLOCAGE AMÉLIORÉE :
            if (value !== '') {
                const firstChar = value[0];
                
                // 1. Si le premier caractère n'est ni '6' ni '7', ignorer la saisie
                if (!['6', '7'].includes(firstChar)) {
                    // Si on essaie de taper un caractère invalide, on ne met pas à jour le state.
                    // On peut aussi conserver l'ancien numéro s'il y en avait un.
                    setErrorNumeroCompte(true);
                    return; // Stoppe la mise à jour
                }
            }
            
            // Si le premier caractère est '6' ou '7' (ou si le champ est vide) :
            setNouvelleLigne(prev => ({ ...prev, [name]: value }));
            setErrorNumeroCompte(false); // Réinitialiser l'erreur si la saisie est valide

            // Déduire la nature
            if (value.startsWith('6')) {
                setNouvelleLigne(prev => ({ ...prev, nature: 'Charge' }));
            } else if (value.startsWith('7')) {
                setNouvelleLigne(prev => ({ ...prev, nature: 'Produit' }));
            } else if (value === '') {
                 // Si le champ est vidé, réinitialiser la nature à Charge par défaut
                 setNouvelleLigne(prev => ({ ...prev, nature: 'Charge' }));
            }
            
        } else {
            setNouvelleLigne(prev => ({ ...prev, [name]: value }));
        }
    };
    // ... Reste des fonctions inchangé (resetNouvelleLigne, ajouterLigne, modifierLigne, etc.)
    
    const resetNouvelleLigne = (keepDate = false) => {
        setNouvelleLigne({
            numeroCompte: '',
            libelle: '',
            montant: '',
            nature: 'Charge',
            date: keepDate ? nouvelleLigne.date : ''
        });
    }

    const ajouterLigne = () => {
        if (!nouvelleLigne.numeroCompte || !nouvelleLigne.libelle || !nouvelleLigne.montant || !nouvelleLigne.date) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Le contrôle ici est redondant car handleChange bloque, mais on le laisse pour la sûreté
        if (errorNumeroCompte || !['6', '7'].includes(nouvelleLigne.numeroCompte[0])) {
            alert('Numéro de compte invalide. Doit commencer par 6 ou 7.');
            return;
        }

        if (ligneEnModification) {
            sauvegarderModification();
            return;
        }

        const ligne = {
            ...nouvelleLigne,
            id: Date.now(),
            montant: parseFloat(nouvelleLigne.montant)
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
            nature: ligne.nature,
            date: ligne.date
        });
        setErrorNumeroCompte(false);
    };

    const annulerModification = () => {
        setLigneEnModification(null);
        resetNouvelleLigne();
        setErrorNumeroCompte(false);
    };

    const sauvegarderModification = () => {
        if (!nouvelleLigne.numeroCompte || !nouvelleLigne.libelle || !nouvelleLigne.montant || !nouvelleLigne.date || errorNumeroCompte) {
            alert('Veuillez corriger les erreurs avant de sauvegarder.');
            return;
        }

        setLignes(lignes.map(ligne =>
            ligne.id === ligneEnModification
                ? { ...ligne, ...nouvelleLigne, montant: parseFloat(nouvelleLigne.montant) }
                : ligne
        ));

        annulerModification();
    };

    const supprimerLigne = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
            setLignes(lignes.filter(ligne => ligne.id !== id));
        }
    };
    
    const formatMontant = (montant) => montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const enregistrerCompteResultat = async () => {
        if (lignes.length === 0) {
            alert('Ajoutez au moins une ligne avant d\'enregistrer');
            return;
        }

        try {
            console.log(`Tentative d'enregistrement de ${lignes.length} lignes vers ${BASE_URL_API}/CompteResultats/`);
            
            // Simulation de succès
            // await new Promise(resolve => setTimeout(resolve, 1000)); 

            alert(`✅ Compte de résultat enregistré avec succès !\n${lignes.length} ligne(s) insérée(s).`);
            setLignes([]);
            
            if (onSaisieCompleted) {
                onSaisieCompleted();
            }

        } catch (error) {
            console.error('Erreur réseau ou serveur simulée:', error);
            alert('❌ Erreur lors de l\'enregistrement du compte de résultat');
        }
    };

    
    // --- Rendu du Composant (inchangé dans la structure IHM) ---
    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* En-tête de la page */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Saisie Manuelle : Compte de Résultat
                    </h1>
                    <BackToFormsPage />
                </div>

                {/* Bloc de Saisie de Nouvelle Ligne */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-indigo-600">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        {ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une nouvelle ligne'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        
                        {/* N° Compte */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">N° Compte (6xx/7xx) *</label>
                            <input
                                type="text"
                                name="numeroCompte"
                                value={nouvelleLigne.numeroCompte}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${
                                    errorNumeroCompte ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Ex: 601"
                            />
                            {/* L'affichage de l'erreur est conservé pour informer l'utilisateur *pourquoi* sa saisie est bloquée */}
                            {errorNumeroCompte && (
                                <p className="text-red-600 text-xs mt-1">Doit commencer par 6 (Charges) ou 7 (Produits)</p>
                            )}
                        </div>

                        {/* Libellé */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                            <input
                                type="text"
                                name="libelle"
                                value={nouvelleLigne.libelle}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                                placeholder="Ex: Achats de marchandises"
                            />
                        </div>

                        {/* Montant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (Ar) *</label>
                            <input
                                type="number"
                                name="montant"
                                value={nouvelleLigne.montant}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Nature */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nature *</label>
                            <select
                                name="nature"
                                value={nouvelleLigne.nature}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white"
                                disabled={['6', '7'].includes(nouvelleLigne.numeroCompte[0])} 
                            >
                                <option value="Charge">Charge</option>
                                <option value="Produit">Produit</option>
                            </select>
                            {['6', '7'].includes(nouvelleLigne.numeroCompte[0]) && (
                                <p className="text-xs text-indigo-500 mt-1">Déduit du N° de compte</p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={nouvelleLigne.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Boutons d'Action Saisie */}
                    <div className="mt-6 flex justify-end gap-3">
                        {ligneEnModification && (
                            <button
                                onClick={annulerModification}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Annuler
                            </button>
                        )}
                        <button
                            onClick={ajouterLigne}
                            className={`${ligneEnModification ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center`}
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {ligneEnModification ? 'Sauvegarder la modification' : 'Ajouter cette ligne'}
                        </button>
                    </div>
                </div>

                {/* Tableau des Lignes Saisies */}
                {lignes.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                        <div className="p-4 bg-gray-50 border-b">
                             <h2 className="text-xl font-semibold text-gray-700">Aperçu des Lignes ({lignes.length})</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Compte</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nature</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant (Ar)</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lignes.map((ligne) => (
                                        <tr key={ligne.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{ligne.numeroCompte}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{ligne.date}</td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ligne.nature === 'Produit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {ligne.nature}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-900">{formatMontant(ligne.montant)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className='flex justify-center gap-2'>
                                                    <button onClick={() => modifierLigne(ligne)} className="text-blue-500 hover:text-blue-700 transition" title="Modifier">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg>
                                                    </button>
                                                    <button onClick={() => supprimerLigne(ligne.id)} className="text-red-500 hover:text-red-700 transition" title="Supprimer">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Bouton d'Enregistrement Final */}
                        <div className="mt-6 p-6 flex justify-end bg-gray-50 border-t">
                            <button
                                onClick={enregistrerCompteResultat}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02] flex items-center"
                                disabled={lignes.length === 0}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Valider
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}