import { useState, useMemo } from 'react';
import BackToFormsPage from "../../../components/button/BackToFormsPage";
import { BASE_URL_API } from '../../../constants/globalConstants';

// État initial d'une nouvelle ligne de facture
const LIGNE_INITIALE = {
  libelle: '',
  quantite: 1,
  prixUnitaire: 0,
  tvaRate: 0.20 // Taux de TVA par défaut à 20%
};

// État initial du formulaire de facture
const FACTURE_INITIALE = {
  typeDocument: 'Vente', // 'Vente' ou 'Achat'
  reference: '',
  date: new Date().toISOString().slice(0, 10),
  partenaire: '', // Nom du Client ou Fournisseur
  lignesFacture: [{ ...LIGNE_INITIALE }],
};

export default function FactureForm() {
  const [facture, setFacture] = useState(FACTURE_INITIALE);

  // ----------------------------------------------------------------------
  // 1. CALCUL DES TOTAUX (Optimisé avec useMemo)
  // ----------------------------------------------------------------------
  const { sousTotalHT, totalTVA, montantTotalTTC } = useMemo(() => {
    let ht = 0;
    let tva = 0;

    facture.lignesFacture.forEach(ligne => {
      // Assure que les montants sont des nombres pour le calcul
      const pu = parseFloat(ligne.prixUnitaire) || 0;
      const qte = parseFloat(ligne.quantite) || 0;
      const tauxTVA = parseFloat(ligne.tvaRate) || 0;

      const sousTotalLigne = pu * qte;
      const montantTVA = sousTotalLigne * tauxTVA;

      ht += sousTotalLigne;
      tva += montantTVA;
    });

    return {
      sousTotalHT: ht,
      totalTVA: tva,
      montantTotalTTC: ht + tva
    };
  }, [facture.lignesFacture]);
  // ----------------------------------------------------------------------


  const handleChangeEnTete = (e) => {
    const { name, value } = e.target;
    setFacture(prev => ({ ...prev, [name]: value }));
  };

  // ----------------------------------------------------------------------
  // 2. GESTION DES LIGNES DE FACTURE
  // ----------------------------------------------------------------------
  const handleLigneChange = (index, e) => {
    const { name, value } = e.target;
    const nouvellesLignes = facture.lignesFacture.map((ligne, i) => {
      if (i === index) {
        // Gère la conversion des nombres (pour prix, quantité, taux)
        if (['quantite', 'prixUnitaire', 'tvaRate'].includes(name)) {
            // Le toFixed(2) est utilisé pour s'assurer que les taux sont gérés correctement s'ils sont saisis en pourcentages
            // Ici, nous stockons le taux décimal (ex: 0.20)
            return { ...ligne, [name]: parseFloat(value) || 0 };
        }
        return { ...ligne, [name]: value };
      }
      return ligne;
    });
    setFacture(prev => ({ ...prev, lignesFacture: nouvellesLignes }));
  };

  const ajouterLigne = () => {
    setFacture(prev => ({ 
      ...prev, 
      lignesFacture: [...prev.lignesFacture, { ...LIGNE_INITIALE }] 
    }));
  };

  const supprimerLigne = (index) => {
    if (facture.lignesFacture.length > 1) {
      setFacture(prev => ({ 
        ...prev, 
        lignesFacture: prev.lignesFacture.filter((_, i) => i !== index) 
      }));
    }
  };
  // ----------------------------------------------------------------------


  // ----------------------------------------------------------------------
  // 3. ENREGISTREMENT À L'API
  // ----------------------------------------------------------------------
  const enregistrerFacture = async () => {
    // Validation minimale
    if (!facture.reference || !facture.partenaire || facture.lignesFacture.length === 0 || montantTotalTTC <= 0) {
      alert("Veuillez remplir toutes les informations d'en-tête, ajouter au moins une ligne et assurer un montant total positif.");
      return;
    }
    
    // Construction des données pour l'API
    const documentData = {
      // En-tête
      reference: facture.reference,
      date: facture.date,
      partenaire: facture.partenaire, 
      type_doc: facture.typeDocument.toUpperCase(), // EN MAJUSCULES pour l'API

      // Totaux calculés
      sous_total_ht: sousTotalHT,
      total_tva: totalTVA,
      montant_total_ttc: montantTotalTTC,
      
      // Lignes de facture formatées pour l'API
      lignes: facture.lignesFacture.map(l => ({
          libelle: l.libelle,
          quantite: l.quantite,
          prix_unitaire: l.prixUnitaire,
          taux_tva: l.tvaRate,
          montant_ht: (l.prixUnitaire * l.quantite), // Montant HT de la ligne
      }))
    };

    console.log(`Envoi à l'API (${facture.typeDocument}):`, documentData);

    try {
      // L'URL est dynamique: /ventes/factures/ ou /achats/factures/
      const url = `${BASE_URL_API}/${facture.typeDocument.toLowerCase()}s/factures/`; 
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status} lors de l'enregistrement de la facture.`);
      }
      
      alert(`✅ Facture ${facture.typeDocument} enregistrée avec succès !`);
      setFacture(FACTURE_INITIALE); // Réinitialiser le formulaire
    } catch (error) {
      console.error(error);
      alert(`❌ Erreur lors de l'enregistrement de la facture: ${error.message}`);
    }
  };
  // ----------------------------------------------------------------------


  // Fonction utilitaire pour le formatage monétaire
  const formatMonetaire = (montant) => montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE DU DOCUMENT */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <BackToFormsPage /> 
            Formulaire de Facture ({facture.typeDocument})
          </h2>
          <hr className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Type Document (Vente/Achat) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select 
                name="typeDocument" 
                value={facture.typeDocument} 
                onChange={handleChangeEnTete}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="Vente">Facture Vente</option>
                <option value="Achat">Facture Achat</option>
              </select>
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence *</label>
              <input type="text" name="reference" value={facture.reference} onChange={handleChangeEnTete}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="N° FAC-001" />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" name="date" value={facture.date} onChange={handleChangeEnTete}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-blue-500" />
            </div>

            {/* Partenaire (Client ou Fournisseur - Dynamique) */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {facture.typeDocument === 'Vente' ? 'Client' : 'Fournisseur'} *
              </label>
              <input type="text" name="partenaire" value={facture.partenaire} onChange={handleChangeEnTete}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-blue-500"
                placeholder={`Nom du ${facture.typeDocument === 'Vente' ? 'Client' : 'Fournisseur'}`} />
            </div>
            
          </div>
        </div>

        {/* LIGNES DÉTAILLÉES */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Détail des lignes</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé *</th>
                  <th className="w-1/12 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité *</th>
                  <th className="w-1/6 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix U. (HT) *</th>
                  <th className="w-1/12 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux TVA (0.00) *</th>
                  <th className="w-1/6 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                  <th className="w-1/12 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facture.lignesFacture.map((ligne, index) => (
                  <tr key={index}>
                    <td className="px-2 py-2">
                      <input type="text" name="libelle" value={ligne.libelle} 
                        onChange={(e) => handleLigneChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" name="quantite" value={ligne.quantite} min="1" step="1"
                        onChange={(e) => handleLigneChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" name="prixUnitaire" value={ligne.prixUnitaire} min="0" step="0.01"
                        onChange={(e) => handleLigneChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" name="tvaRate" value={ligne.tvaRate} min="0" step="0.01" max="1"
                        onChange={(e) => handleLigneChange(index, e)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right" />
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-gray-800">
                      {formatMonetaire(ligne.prixUnitaire * ligne.quantite)} Ar
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => supprimerLigne(index)} title="Supprimer la ligne"
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={facture.lignesFacture.length === 1}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={ajouterLigne}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 border border-blue-600 rounded-lg transition duration-200">
            ➕ Ajouter une ligne
          </button>
        </div>

        {/* RÉSUMÉ DES TOTAUX ET BOUTON DE VALIDATION */}
        <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Synthèse</h3>
                
                <div className="space-y-2">
                    <div className="flex justify-between font-medium text-gray-600">
                        <span>Sous-Total HT:</span>
                        <span>{formatMonetaire(sousTotalHT)} Ar</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-600">
                        <span>Total TVA:</span>
                        <span>{formatMonetaire(totalTVA)} Ar</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-2 border-t border-gray-300 text-blue-600">
                        <span>TOTAL TTC:</span>
                        <span>{formatMonetaire(montantTotalTTC)} Ar</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button onClick={enregistrerFacture}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-[1.01]">
                        💾 Enregistrer la Facture {facture.typeDocument}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}