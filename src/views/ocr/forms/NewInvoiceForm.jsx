import React, { useState, useMemo } from 'react';

// Constantes pour simuler les imports
const BASE_URL_API = 'http://api.exemple.com';
const BackToFormsPage = () => <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    Retour
</button>;

const STATUTS = ["Brouillon", "Validée", "Comptabilisée", "Payée / Soldée", "Annulée"];

export default function NewInvoiceForm({ type = 'Vente', onSaisieCompleted }) { // type peut être 'Vente' ou 'Achat'
    const isVente = type === 'Vente';
    const titre = isVente ? 'Facture de Vente' : 'Facture d\'Achat';

    const [lignesProduit, setLignesProduit] = useState([]);
    const [nouvelleLigne, setNouvelleLigne] = useState({
        produit: '',
        compte: isVente ? '700' : '600', // 7xx pour Vente, 6xx pour Achat par défaut
        quantite: 1,
        prixHT: 0,
        tauxTVA: 0.20, // 20% par défaut
    });
    const [infoGenerales, setInfoGenerales] = useState({
        tiers: '', // Client ou Fournisseur
        dateFacture: new Date().toISOString().slice(0, 10),
        statut: 'Brouillon',
        montantPaye: 0, // Pour gérer le Reste à Payer / Recouvrer
    });

    // --- Fonctions de Gestion des États ---

    const handleChangeLigne = (e) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseFloat(value) || 0 : value;

        setNouvelleLigne(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleChangeGeneral = (e) => {
        const { name, value } = e.target;
        setInfoGenerales(prev => ({ ...prev, [name]: value }));
    };

    // --- Logique de Calcul des Totaux ---

    const calculerLigne = (ligne) => {
        const montantHT = ligne.quantite * ligne.prixHT;
        const montantTVA = montantHT * ligne.tauxTVA;
        const montantTTC = montantHT + montantTVA;
        return {
            ...ligne,
            montantHT: montantHT,
            montantTVA: montantTVA,
            montantTTC: montantTTC
        };
    };

    const totaux = useMemo(() => {
        const totauxCalculated = lignesProduit.reduce((acc, ligne) => {
            const ligneCalculee = calculerLigne(ligne);
            acc.totalHT += ligneCalculee.montantHT;
            acc.totalTVA += ligneCalculee.montantTVA;
            acc.totalTTC += ligneCalculee.montantTTC;
            return acc;
        }, { totalHT: 0, totalTVA: 0, totalTTC: 0 });

        // Calcul du Reste à Payer / Recouvrer
        const reste = totauxCalculated.totalTTC - parseFloat(infoGenerales.montantPaye || 0);
        
        return {
            ...totauxCalculated,
            reste: reste
        };
    }, [lignesProduit, infoGenerales.montantPaye]);


    // --- Fonctions d'Action sur les Lignes ---

    const ajouterLigne = () => {
        if (!nouvelleLigne.produit || nouvelleLigne.quantite <= 0 || nouvelleLigne.prixHT <= 0) {
            alert('Veuillez renseigner le produit, la quantité et le prix HT.');
            return;
        }

        const ligneComplete = calculerLigne(nouvelleLigne);
        setLignesProduit([...lignesProduit, { ...ligneComplete, id: Date.now() }]);

        // Réinitialiser la ligne de saisie
        setNouvelleLigne({
            produit: '',
            compte: isVente ? '700' : '600',
            quantite: 1,
            prixHT: 0,
            tauxTVA: 0.20,
        });
    };

    const supprimerLigne = (id) => {
        setLignesProduit(lignesProduit.filter(ligne => ligne.id !== id));
    };

    // --- Fonction d'Enregistrement Final (Intégration du Statut et du Reste) ---

    const validerEnregistrement = async () => {
        if (lignesProduit.length === 0) {
            alert('Ajoutez au moins une ligne de produit/service.');
            return;
        }
        if (!infoGenerales.tiers) {
            alert('Veuillez spécifier le Tiers (Client/Fournisseur).');
            return;
        }

        const factureFinale = {
            ...infoGenerales,
            lignes: lignesProduit.map(l => ({ ...l, id: undefined })), // Nettoyage de l'ID temporaire
            totaux: totaux,
            type: type,
        };

        console.log(`Données finales de la facture ${titre} :`, factureFinale);
        
        // --------------------------------------------------------------------------------
        // REMARQUE COMPTABLE CLÉ :
        // Le statut "Comptabilisée" génère l'écriture suivante (simplifiée) :
        // - Vente (Produit) : DÉBIT 411 (Client) / CRÉDIT 7xx (Produit) / CRÉDIT 4457 (TVA Collectée)
        // - Achat (Charge) : DÉBIT 6xx (Charge) / DÉBIT 4456 (TVA Déductible) / CRÉDIT 401 (Fournisseur)
        // Le montant "Reste" = 411 ou 401.
        // --------------------------------------------------------------------------------

        try {
            // Ici, vous feriez l'appel API pour POST la facture
            // Exemple de simulation :
            // await fetch(`${BASE_URL_API}/Factures`, { method: 'POST', body: JSON.stringify(factureFinale) });
            // await new Promise(resolve => setTimeout(resolve, 1000)); 

            alert(`✅ Facture de ${titre} enregistrée avec succès !\nStatut initial: ${factureFinale.statut}.\nSolde dû: ${totaux.reste.toFixed(2)} Ar.`);
            onSaisieCompleted && onSaisieCompleted();
            // Optionnel : Réinitialiser le formulaire
            // setLignesProduit([]);
            // setInfoGenerales(...)

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la facture:', error);
            alert('❌ Erreur lors de l\'enregistrement.');
        }
    };
    
    const formatMontant = (montant) => montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    // --- Rendu du Composant ---
    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* En-tête de la page */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Saisie Manuelle : {titre}
                    </h1>
                    <BackToFormsPage />
                </div>

                {/* Bloc Info Générales & Statut/Reste (Ajout) */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-indigo-600">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Informations Générales et Suivi
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        
                        {/* Tiers (Client/Fournisseur) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isVente ? 'Client' : 'Fournisseur'} *</label>
                            <input
                                type="text"
                                name="tiers"
                                value={infoGenerales.tiers}
                                onChange={handleChangeGeneral}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                                placeholder={isVente ? 'Nom du client' : 'Nom du fournisseur'}
                            />
                        </div>

                        {/* Date de Facture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de Facture *</label>
                            <input
                                type="date"
                                name="dateFacture"
                                value={infoGenerales.dateFacture}
                                onChange={handleChangeGeneral}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                            />
                        </div>

                        {/* Statut (Suivi Opérationnel) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                            <select
                                name="statut"
                                value={infoGenerales.statut}
                                onChange={handleChangeGeneral}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white"
                            >
                                {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         {/* Montant Payé (Gestion du Reste) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant déjà Payé</label>
                            <input
                                type="number"
                                name="montantPaye"
                                value={infoGenerales.montantPaye}
                                onChange={handleChangeGeneral}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Bloc de Saisie des Lignes de Produit/Service */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-gray-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Détails {isVente ? 'des Produits/Services Vendus' : 'des Achats'}
                    </h2>

                    <div className="grid grid-cols-6 gap-4 items-end">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Désignation</label>
                            <input type="text" name="produit" value={nouvelleLigne.produit} onChange={handleChangeLigne} placeholder="Produit/Service" className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Compte (6xx/7xx)</label>
                            <input type="text" name="compte" value={nouvelleLigne.compte} onChange={handleChangeLigne} placeholder={isVente ? '7xx' : '6xx'} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                            <input type="number" name="quantite" value={nouvelleLigne.quantite} onChange={handleChangeLigne} min="1" className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prix HT</label>
                            <input type="number" name="prixHT" value={nouvelleLigne.prixHT} onChange={handleChangeLigne} step="0.01" className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                            <input type="number" name="tauxTVA" value={nouvelleLigne.tauxTVA} onChange={handleChangeLigne} step="0.01" className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <button 
                            onClick={ajouterLigne} 
                            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition duration-200"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Tableau des Lignes Saisies et Totaux */}
                {lignesProduit.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                        <div className="p-4 bg-gray-50 border-b">
                             <h2 className="text-xl font-semibold text-gray-700">Détails de la Facture</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Compte</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix HT</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">TVA (%)</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lignesProduit.map((ligne) => {
                                        const ligneCalculee = calculerLigne(ligne);
                                        return (
                                            <tr key={ligne.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{ligne.produit}</td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-600">{ligne.compte}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">{ligne.quantite}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">{formatMontant(ligne.prixHT)}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">{(ligne.tauxTVA * 100).toFixed(0)}%</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatMontant(ligneCalculee.montantHT)}</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-indigo-700">{formatMontant(ligneCalculee.montantTTC)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <button onClick={() => supprimerLigne(ligne.id)} className="text-red-500 hover:text-red-700 transition" title="Supprimer">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Totaux & Reste à Payer */}
                        <div className="p-6 bg-white border-t flex justify-end">
                            <div className="w-full max-w-sm">
                                <div className="space-y-2">
                                    <p className="flex justify-between text-sm font-medium text-gray-600">
                                        <span>Total HT :</span>
                                        <span>{formatMontant(totaux.totalHT)} Ar</span>
                                    </p>
                                    <p className="flex justify-between text-sm font-medium text-gray-600">
                                        <span>Total TVA :</span>
                                        <span>{formatMontant(totaux.totalTVA)} Ar</span>
                                    </p>
                                    <p className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2">
                                        <span>Total TTC :</span>
                                        <span>{formatMontant(totaux.totalTTC)} Ar</span>
                                    </p>
                                    <p className="flex justify-between text-sm font-medium text-gray-600">
                                        <span>Montant Payé/Reçu :</span>
                                        <span>{formatMontant(parseFloat(infoGenerales.montantPaye || 0))} Ar</span>
                                    </p>
                                    <p className={`flex justify-between text-xl font-bold border-t pt-2 ${totaux.reste > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        <span>{isVente ? 'Reste à Recouvrer' : 'Reste à Payer'} :</span>
                                        <span>{formatMontant(totaux.reste)} Ar</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bouton d'Enregistrement Final */}
                        <div className="mt-4 p-6 flex justify-end bg-gray-50 border-t">
                            <button
                                onClick={validerEnregistrement}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg transition duration-200 transform hover:scale-[1.02] flex items-center"
                                disabled={lignesProduit.length === 0 || !infoGenerales.tiers}
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

