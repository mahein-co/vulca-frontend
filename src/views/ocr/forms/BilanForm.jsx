import { useState } from 'react';
import BackToFormsPage from "../../../components/button/BackToFormsPage";
import { BASE_URL_API } from '../../../constants/globalConstants';

export default function BilanForm() {
  const [lignes, setLignes] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    numeroCompte: '',
    libelle: '',
    montant: '',
    date: '',
    type: 'Actif',
    categorie: 'Actif non courants'
  });
  const [ligneEnModification, setLigneEnModification] = useState(null);
  const [erreurNumeroCompte, setErreurNumeroCompte] = useState('');

  const categoriesActif = ['Actif non courants', 'Actif courants'];
  const categoriesPassif = ['Capitaux propres', 'Passifs non courants', 'Passifs courants'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'numeroCompte') {
      // ✅ Bloquer tout sauf valeurs commençant par 1-5
      if (value === '' || ['1','2','3','4','5'].includes(value[0])) {
        setNouvelleLigne(prev => ({ ...prev, [name]: value }));
        setErreurNumeroCompte('');
      } else {
        setErreurNumeroCompte('⚠️ Le numéro doit commencer par 1,2,3,4 ou 5');
        return;
      }
    } else if (name === 'type') {
      setNouvelleLigne(prev => ({
        ...prev,
        [name]: value,
        categorie: value === 'Actif' ? 'Actif non courants' : 'Capitaux propres'
      }));
    } else {
      setNouvelleLigne(prev => ({ ...prev, [name]: value }));
    }
  };

  const ajouterLigne = () => {
    if (!nouvelleLigne.numeroCompte || !nouvelleLigne.libelle || !nouvelleLigne.montant || !nouvelleLigne.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (erreurNumeroCompte) {
      alert('Numéro de compte invalide');
      return;
    }

    if (ligneEnModification) {
      setLignes(lignes.map(ligne =>
        ligne.id === ligneEnModification
          ? { ...nouvelleLigne, id: ligneEnModification, montant: parseFloat(nouvelleLigne.montant) }
          : ligne
      ));
      setLigneEnModification(null);
    } else {
      setLignes([...lignes, { ...nouvelleLigne, id: Date.now(), montant: parseFloat(nouvelleLigne.montant) }]);
    }

    setNouvelleLigne({
      numeroCompte: '',
      libelle: '',
      montant: '',
      date: nouvelleLigne.date,
      type: 'Actif',
      categorie: 'Actif non courants'
    });
    setErreurNumeroCompte('');
  };

  const modifierLigne = (ligne) => {
    setNouvelleLigne({ ...ligne, montant: ligne.montant.toString() });
    setLigneEnModification(ligne.id);
    setErreurNumeroCompte('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annulerModification = () => {
    setLigneEnModification(null);
    setNouvelleLigne({
      numeroCompte: '',
      libelle: '',
      montant: '',
      date: '',
      type: 'Actif',
      categorie: 'Actif non courants'
    });
    setErreurNumeroCompte('');
  };

  const supprimerLigne = (id) => setLignes(lignes.filter(ligne => ligne.id !== id));

  const enregistrerBilan = async () => {
    if (lignes.length === 0) {
      alert("Ajoutez au moins une ligne avant d'enregistrer");
      return;
    }

    const typeMapping = {
      "Actif": "ACTIF",
      "Passif": "PASSIF"
    };

    const categorieMapping = {
      "Actif courants": "ACTIF_COURANTS",
      "Actif non courants": "ACTIF_NON_COURANTS",
      "Capitaux propres": "CAPITAUX_PROPRES",
      "Passifs non courants": "PASSIFS_NON_COURANTS",
      "Passifs courants": "PASSIFS_COURANTS"
    };

    try {
      for (let i = 0; i < lignes.length; i++) {
        const element = lignes[i];

        const typeBilan = typeMapping[element.type?.trim()];
        const categorieBilan = categorieMapping[element.categorie?.trim()];

        if (!typeBilan || !categorieBilan) {
          alert(`❌ Type ou catégorie invalide à la ligne ${i + 1}`);
          return;
        }

        const dataBilan = {
          balance: null,
          numero_compte: element.numeroCompte,
          libelle: element.libelle,
          montant_ar: parseFloat(element.montant),
          date: element.date,
          type_bilan: typeBilan,
          categorie: categorieBilan
        };

        await fetch(`${BASE_URL_API}/bilans/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataBilan)
        });
      }

      alert(`✅ Bilan enregistré avec succès ! (${lignes.length} lignes)`);
      setLignes([]);
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de l'enregistrement du bilan");
    }
  };

 
  return (
    <div className="min-h-screen from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">

        {/* FORMULAIRE */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700"><BackToFormsPage /></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Compte *</label>
              <input
                type="text"
                name="numeroCompte"
                value={nouvelleLigne.numeroCompte}
                onChange={handleChange}
                className={`w-full px-3 py-2 border text-dark rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${erreurNumeroCompte ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                placeholder="Ex: 101"
              />
              {erreurNumeroCompte && (
                <p className="text-red-600 text-sm mt-1">{erreurNumeroCompte}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
              <input type="text" name="libelle" value={nouvelleLigne.libelle} onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Capital social" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (Ar) *</label>
              <input type="number" name="montant" value={nouvelleLigne.montant} onChange={handleChange} step="0.01"
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" name="date" value={nouvelleLigne.date} onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={nouvelleLigne.type} onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="Actif">Actif</option>
                <option value="Passif">Passif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select name="categorie" value={nouvelleLigne.categorie} onChange={handleChange}
                className="w-full px-3 py-2 border text-dark border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {(nouvelleLigne.type === 'Actif' ? categoriesActif : categoriesPassif).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={ajouterLigne}
              className={`${ligneEnModification ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200`}
            >
              {ligneEnModification ? '💾 Enregistrer la modification' : '➕ Ajouter la ligne'}
            </button>

            {ligneEnModification && (
              <button
                onClick={annulerModification}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
              >
                ❌ Annuler
              </button>
            )}
          </div>
        </div>

        {/* TABLEAU */}
        {lignes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Lignes saisies ({lignes.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Compte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant (Ar)</th>
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
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{ligne.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ligne.type === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ligne.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.categorie}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => modifierLigne(ligne)} className="text-blue-600 hover:text-blue-800 font-medium mr-3" title="Modifier">✏️</button>
                        <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 hover:text-red-800 font-medium" title="Supprimer">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={enregistrerBilan} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-200 transform hover:scale-105">
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
