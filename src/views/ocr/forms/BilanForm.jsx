import { useState } from 'react';
import BackToFormsPage from "../../../components/button/BackToFormsPage";

export default function BilanForm() {
  const [lignes, setLignes] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    numeroCompte: '',
    libelle: '',
    montant: '',
    nature: 'Débit',
    date: '',
    type: 'Actif',
    categorie: 'Actif circulant'
  });
  const [ligneEnModification, setLigneEnModification] = useState(null);

  const categoriesActif = [
    'Actif immobilisé',
    'Actif circulant',
    'Trésorerie-Actif'
  ];

  const categoriesPassif = [
    'Capitaux propres',
    'Provisions',
    'Dettes financières',
    'Dettes non financières',
    'Trésorerie-Passif'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si on change le type, adapter la catégorie
    if (name === 'type') {
      setNouvelleLigne(prev => ({
        ...prev,
        [name]: value,
        categorie: value === 'Actif' ? 'Actif circulant' : 'Capitaux propres'
      }));
    } else {
      setNouvelleLigne(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const ajouterLigne = () => {
    if (!nouvelleLigne.numeroCompte || !nouvelleLigne.libelle || !nouvelleLigne.montant || !nouvelleLigne.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (ligneEnModification) {
      // Mode modification
      setLignes(lignes.map(ligne => 
        ligne.id === ligneEnModification ? {
          ...nouvelleLigne,
          id: ligneEnModification,
          montant: parseFloat(nouvelleLigne.montant)
        } : ligne
      ));
      setLigneEnModification(null);
    } else {
      // Mode ajout
      const ligne = {
        ...nouvelleLigne,
        id: Date.now(),
        montant: parseFloat(nouvelleLigne.montant)
      };
      setLignes([...lignes, ligne]);
    }
    
    // Réinitialiser le formulaire
    setNouvelleLigne({
      numeroCompte: '',
      libelle: '',
      montant: '',
      nature: 'Débit',
      date: nouvelleLigne.date, // Garder la même date
      type: 'Actif',
      categorie: 'Actif circulant'
    });
  };

  const modifierLigne = (ligne) => {
    setNouvelleLigne({
      numeroCompte: ligne.numeroCompte,
      libelle: ligne.libelle,
      montant: ligne.montant.toString(),
      nature: ligne.nature,
      date: ligne.date,
      type: ligne.type,
      categorie: ligne.categorie
    });
    setLigneEnModification(ligne.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annulerModification = () => {
    setLigneEnModification(null);
    setNouvelleLigne({
      numeroCompte: '',
      libelle: '',
      montant: '',
      nature: 'Débit',
      date: '',
      type: 'Actif',
      categorie: 'Actif circulant'
    });
  };

  const supprimerLigne = (id) => {
    setLignes(lignes.filter(ligne => ligne.id !== id));
  };

  const enregistrerBilan = async () => {
    if (lignes.length === 0) {
      alert('Ajoutez au moins une ligne avant d\'enregistrer');
      return;
    }

    // Simuler l'envoi vers la base de données
    console.log('Données à enregistrer:', lignes);
    
    // Ici vous pouvez faire un appel API
    // Par exemple:
    // const response = await fetch('/api/bilan', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(lignes)
    // });

    alert(`✅ Bilan enregistré avec succès!\n${lignes.length} ligne(s) enregistrée(s)`);
    setLignes([]);
  };

  const calculerTotaux = () => {
    const totalActif = lignes
      .filter(l => l.type === 'Actif')
      .reduce((sum, l) => sum + l.montant, 0);
    
    const totalPassif = lignes
      .filter(l => l.type === 'Passif')
      .reduce((sum, l) => sum + l.montant, 0);

    return { totalActif, totalPassif };
  };

  const { totalActif, totalPassif } = calculerTotaux();

  return (
    <div className="min-h-screen from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Formulaire de saisie */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
                <BackToFormsPage />
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Compte *
              </label>
              <input
                type="text"
                name="numeroCompte"
                value={nouvelleLigne.numeroCompte}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 101"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Libellé *
              </label>
              <input
                type="text"
                name="libelle"
                value={nouvelleLigne.libelle}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Capital social"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (Ar) *
              </label>
              <input
                type="number"
                name="montant"
                value={nouvelleLigne.montant}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nature
              </label>
              <select
                name="nature"
                value={nouvelleLigne.nature}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Débit">Débit</option>
                <option value="Crédit">Crédit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={nouvelleLigne.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={nouvelleLigne.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Actif">Actif</option>
                <option value="Passif">Passif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                name="categorie"
                value={nouvelleLigne.categorie}
                onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(nouvelleLigne.type === 'Actif' ? categoriesActif : categoriesPassif).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={ajouterLigne}
              className={`${ligneEnModification ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200`}
            >
              {ligneEnModification ? '💾 Enregistrer la modification' : '➕ Ajouter la ligne'}
            </button>
          </div>
        </div>

        {/* Tableau des lignes */}
        {lignes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Lignes saisies ({lignes.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Compte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant (Ar)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lignes.map((ligne) => (
                    <tr key={ligne.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.numeroCompte}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {ligne.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.nature}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ligne.type === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ligne.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.categorie}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => modifierLigne(ligne)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => supprimerLigne(ligne.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bouton d'enregistrement */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={enregistrerBilan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
              >
                💾 Valider
              </button>
            </div>
          </div>
        )}

        {lignes.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
            <p className="text-lg">Aucune ligne ajoutée pour le moment</p>
            <p className="text-sm mt-2">Remplissez le formulaire ci-dessus et cliquez sur "Ajouter la ligne"</p>
          </div>
        )}
      </div>
    </div>
  );
}