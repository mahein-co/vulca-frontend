import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";

const BASE_URL_API = 'http://api.exemple.com'; // Placeholder, unused with real API
const TAUX_TVA_DEFAULT = 20;

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

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().substring(0, 10);
};

export default function BonAchatForm({ onSaisieCompleted, onSaveComplete }) {

  // API Hooks
  const [actionSaveBonAchat, { isLoading: isLoadingSave, isSuccess: isSuccessSave, isError: isErrorSave, data: dataSave }] = useSavePieceByFormularMutation();
  const [actionGenerateJournal, { isLoading: isLoadingJournal, isSuccess: isSuccessJournal, isError: isErrorJournal, error: errorJournal }] = useGenerateJournalMutation();

  const [header, setHeader] = useState({
    fournisseur: '',
    client: '',
    reference: '',
    numeroBon: '',
    dateBon: getTodayDate(),
    address: '',
    rcs: '',
    nif: '',
    stat: '',
    tauxTVA: '0', // Bons d'achat often exclude TVA or include it directly, defaulting to 0 but editable
  });

  const [lignes, setLignes] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    description: '',
    quantite: 1,
    prixUnitaire: '',
  });
  const [ligneEnModification, setLigneEnModification] = useState(null);
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState(null);

  const hasLines = useMemo(() => lignes.length > 0, [lignes]);

  const formatMontant = useCallback((montant) => {
    if (typeof montant === 'string') {
      montant = parseFloat(montant.replace(/,/g, '.'));
    }
    if (isNaN(montant)) return '0,00';
    const roundedMontant = Math.round(montant * 100) / 100;
    return roundedMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const resetNouvelleLigne = useCallback(() => {
    setNouvelleLigne({ description: '', quantite: 1, prixUnitaire: '', });
    setLigneEnModification(null);
  }, []);

  const remplirExemple = () => {
    setHeader({
      ...header,
      fournisseur: 'Jovenna Station',
      client: 'Mahein Co',
      reference: 'TICKET-254',
      date: getTodayDate(),
      lieu: 'Antananarivo',
      tauxTVA: '20'
    });
    setLignes([
      { id: 1, description: 'Carburant Super Sans Plomb', quantite: 40, prixUnitaire: 5900, totalLigneHT: 236000, montantTVALigne: 47200, totalLigneTTC: 283200 },
      { id: 2, description: 'Lavage Auto', quantite: 1, prixUnitaire: 15000, totalLigneHT: 15000, montantTVALigne: 3000, totalLigneTTC: 18000 }
    ]);
    toast.success("Exemple chargé !");
  };

  const handleChangeHeader = useCallback((e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChangeLigne = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'quantite' || name === 'prixUnitaire') {
      newValue = value.replace(/[^0-9.]/g, '');
    }
    setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));
  }, []);

  const tvaRateDecimal = useMemo(() => {
    const tvaPercent = parseFloat(header.tauxTVA);
    return isNaN(tvaPercent) ? 0 : tvaPercent / 100;
  }, [header.tauxTVA]);

  const { totalHT, montantTVA, totalTTC } = useMemo(() => {
    const totalHT = lignes.reduce((sum, ligne) =>
      sum + (ligne.quantite * ligne.prixUnitaire), 0
    );
    const montantTVA = totalHT * tvaRateDecimal;
    const totalTTC = totalHT + montantTVA;
    return { totalHT, montantTVA, totalTTC };
  }, [lignes, tvaRateDecimal]);

  const validateAndGetLigneData = () => {
    const { description, quantite, prixUnitaire } = nouvelleLigne;
    if (!description || !quantite || !prixUnitaire) {
      alert('Veuillez remplir la description, la quantité et le prix unitaire.');
      return null;
    }
    const qteValue = parseFloat(quantite);
    const puValue = parseFloat(prixUnitaire);
    if (isNaN(qteValue) || isNaN(puValue) || qteValue <= 0 || puValue <= 0) {
      alert('La quantité et le prix unitaire doivent être des nombres positifs valides.');
      return null;
    }

    const totalHTLigne = qteValue * puValue;
    const montantTVALigne = totalHTLigne * tvaRateDecimal;

    return {
      description,
      quantite: qteValue,
      prixUnitaire: puValue,
      totalLigneHT: totalHTLigne,
      montantTVALigne: montantTVALigne,
      totalLigneTTC: totalHTLigne + montantTVALigne
    };
  }

  const ajouterLigne = () => {
    if (ligneEnModification) {
      sauvegarderModification(); return;
    }
    const data = validateAndGetLigneData();
    if (data === null) return;
    const ligne = { ...data, id: Date.now() };
    setLignes(prevLignes => [...prevLignes, ligne]);
    resetNouvelleLigne();
  };

  const modifierLigne = (ligne) => {
    setLigneEnModification(ligne.id);
    setNouvelleLigne({ description: ligne.description, quantite: ligne.quantite.toString(), prixUnitaire: ligne.prixUnitaire.toString() });
  };

  const sauvegarderModification = () => {
    const data = validateAndGetLigneData();
    if (data === null) return;
    setLignes(lignes.map(ligne => ligne.id === ligneEnModification ? { ...ligne, ...data } : ligne));
    resetNouvelleLigne();
  };

  const supprimerLigne = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
      setLignes(lignes.filter(ligne => ligne.id !== id));
      if (ligneEnModification === id) resetNouvelleLigne();
    }
  };

  useEffect(() => {
    setLignes(prevLignes => prevLignes.map(ligne => {
      const totalHTLigne = ligne.quantite * ligne.prixUnitaire;
      const montantTVALigne = totalHTLigne * tvaRateDecimal;
      return {
        ...ligne,
        montantTVALigne: montantTVALigne,
        totalLigneTTC: totalHTLigne + montantTVALigne
      };
    }));
  }, [tvaRateDecimal]);

  // Handle Save Response
  useEffect(() => {
    if (isSuccessSave && dataSave) {
      toast.success("Bon d'achat enregistré ! Génération du journal...");
      const journalData = {
        ...dataToGenerateJournal,
        file_source: null,
        form_source: dataSave?.form_source?.id,
      };
      actionGenerateJournal(journalData);
    } else if (isErrorSave) {
      toast.error("Erreur lors de l'enregistrement du bon d'achat.");
    }
  }, [isSuccessSave, isErrorSave, dataSave, actionGenerateJournal, dataToGenerateJournal]);

  // Handle Journal Response
  useEffect(() => {
    if (isSuccessJournal) {
      toast.success("Journal généré avec succès !");
      setLignes([]);
      setHeader({
        fournisseur: '', client: '', reference: '', numeroBon: '', dateBon: getTodayDate(), address: '', rcs: '', nif: '', stat: '', tauxTVA: '0'
      });
      if (onSaveComplete) onSaveComplete();
    } else if (isErrorJournal) {
      toast.error(errorJournal?.data?.error || "Erreur lors de la génération du journal.");
    }
  }, [isSuccessJournal, isErrorJournal, errorJournal, onSaveComplete]);


  const enregistrerBonAchat = async () => {
    if (!header.fournisseur || !header.numeroBon || lignes.length === 0) {
      alert('Veuillez renseigner le fournisseur, le numéro du bon et ajouter au moins une ligne.');
      return;
    }

    const data = {
      piece_type: "Type bon d'achat",
      description_json: {
        fournisseur: header.fournisseur,
        client: header.client || 'Client divers',
        reference_bon_achat: header.reference,
        rcs: header.rcs,
        nif: header.nif,
        stat: header.stat,
        num_bon_achat: header.numeroBon,
        date: header.dateBon,
        address: header.address,
        taux_tva: header.tauxTVA,
        details: lignes.map(l => ({
          designation: l.description,
          quantite: l.quantite,
          prix: l.prixUnitaire,
          total: l.totalLigneTTC // or HT depending on backend expectation, preserving existing mapping logic
        })),
        totalGeneral: totalTTC,
        totalHT: totalHT,
      },
    };

    setDataToGenerateJournal(data);
    actionSaveBonAchat(data);
  };

  return (
    <div className="w-full h-full lg:p-1 flex flex-col">
      <div className="max-w-7xl mx-auto w-full">

        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="flex-shrink-0">
            <BackToFormsPage onClick={onSaisieCompleted} />
          </div>
          <h1 className="text-lg font-bold text-gray-800 flex-1 text-center px-4">
            Saisie Manuelle de Bon d'Achat
          </h1>
          <div className="flex-shrink-0 w-[88px] flex justify-end">
            <button
              onClick={remplirExemple}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition"
            >
              Exemple
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 border-t-2 border-gray-300">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Informations Générales
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Fournisseur</label>
                <input type="text" name="fournisseur" value={header.fournisseur} onChange={handleChangeHeader} placeholder="Nom du fournisseur" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Client</label>
                <input type="text" name="client" value={header.client} onChange={handleChangeHeader} placeholder="Nom du client" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">N° Bon</label>
                <input type="text" name="numeroBon" value={header.numeroBon} onChange={handleChangeHeader} placeholder="BA-001" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" name="dateBon" value={header.dateBon} onChange={handleChangeHeader} className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Lieu / Adresse</label>
                <input type="text" name="address" value={header.address} onChange={handleChangeHeader} placeholder="Adresse" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
              </div>
            </div>


          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 border-t-2 border-gray-300">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Infos Légales (Optionnel)</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">RCS</label>
                  <input type="text" name="rcs" value={header.rcs} onChange={handleChangeHeader} className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" placeholder="RCS..." />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">NIF</label>
                  <input type="text" name="nif" value={header.nif} onChange={handleChangeHeader} className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" placeholder="NIF..." />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">STAT</label>
                  <input type="text" name="stat" value={header.stat} onChange={handleChangeHeader} className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" placeholder="STAT..." />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">TVA (%)</label>
                  <input type="number" name="tauxTVA" value={header.tauxTVA} onChange={handleChangeHeader} className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md text-right" placeholder="0" />
                </div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 mb-3">
              {ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une ligne'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Désignation</label>
                <input
                  type="text"
                  name="description"
                  value={nouvelleLigne.description}
                  onChange={handleChangeLigne}
                  className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 border-gray-300`}
                  placeholder="Ex: Marchandises diverses"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Qté</label>
                <input
                  type="number"
                  step="any"
                  name="quantite"
                  value={nouvelleLigne.quantite}
                  onChange={handleChangeLigne}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-right"
                  placeholder="1"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Prix U. HT (Ar) </label>
                <input
                  type="text"
                  name="prixUnitaire"
                  value={nouvelleLigne.prixUnitaire}
                  onChange={handleChangeLigne}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-right"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Ligne TTC (Ar)</label>
                <p className="w-full px-2 py-1 text-sm border border-gray-200 bg-gray-50 rounded-md text-gray-700 text-right font-bold">
                  {formatMontant(nouvelleLigne.quantite * nouvelleLigne.prixUnitaire * (1 + tvaRateDecimal))}
                </p>
              </div>

            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={resetNouvelleLigne}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm py-1.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                {ligneEnModification ? 'Annuler' : 'Vider'}
              </button>

              <button
                onClick={ajouterLigne}
                className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm py-1.5 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ligneEnModification ? "M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
                {ligneEnModification ? 'Valider modif.' : 'Ajouter ligne'}
              </button>
            </div>


          </div>

        </div>

        {lignes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">

            <div className='p-3 bg-gray-50 border-b border-gray-200 text-sm'>
              <div className='flex justify-between items-center mb-1'>
                <p className='text-gray-700'>Total Hors Taxe:</p>
                <p className='text-gray-900 font-semibold'>{formatMontant(totalHT)} Ar</p>
              </div>
              <div className='flex justify-between items-center mb-1'>
                <p className='text-gray-700'>Montant TVA ({formatMontant(parseFloat(header.tauxTVA))}%):</p>
                <p className='text-gray-900 font-semibold'>{formatMontant(montantTVA)} Ar</p>
              </div>
              <div className='flex justify-between items-center text-base font-bold pt-2 border-t border-gray-300'>
                <p className='text-gray-800'>TOTAL TTC:</p>
                <p className='text-gray-900'>{formatMontant(totalTTC)} Ar</p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase w-[30%]">Désignation</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[10%]">Qté</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[15%]">Prix U. HT (Ar)</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[15%]">Total HT (Ar)</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[10%]">TVA (Ar)</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-right text-xs font-bold text-gray-700 uppercase w-[10%]">Total TTC (Ar)</th>
                      <th className="border-b-2 border-gray-200 px-2 py-1.5 text-center text-xs font-bold text-gray-700 uppercase w-[10%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {lignes.map((ligne, index) => (
                      <tr key={ligne.id} className={`${index % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-indigo-50/30 transition-colors duration-150`}>
                        <td className="px-2 py-1 text-sm text-gray-700 font-medium">{ligne.description}</td>
                        <td className="px-2 py-1 text-sm text-right text-gray-800">{formatMontant(ligne.quantite)}</td>
                        <td className="px-2 py-1 text-sm text-right text-gray-800">{formatMontant(ligne.prixUnitaire)}</td>
                        <td className="px-2 py-1 text-sm text-right font-medium text-gray-900">{formatMontant(ligne.totalLigneHT)}</td>
                        <td className="px-2 py-1 text-sm text-right font-semibold text-gray-900">{formatMontant(ligne.montantTVALigne)}</td>
                        <td className="px-2 py-1 text-sm text-right font-bold text-gray-900">{formatMontant(ligne.totalLigneTTC)}</td>
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
            </div>

            {/* Mobile View omitted for brevity but should be here if needed */}
            <div className="md:hidden">
              <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
                {lignes.map((ligne) => (
                  <div key={ligne.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-900 mb-2 text-sm">{ligne.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-600">Total TTC: <span className="text-gray-900 font-bold">{formatMontant(ligne.totalLigneTTC)} Ar</span></div>
                      <div className="text-right flex gap-2 justify-end">
                        <button onClick={() => modifierLigne(ligne)} className="text-blue-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg></button>
                        <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {lignes.length > 0 && (
          <div className="mt-0 p-4 flex flex-col md:flex-row justify-between items-center bg-white border-t rounded-lg shadow-lg">
            <div className="mb-3 md:mb-0 px-3 py-1 rounded-md font-bold text-base bg-gray-100 text-gray-800">
              TOTAL TTC: {formatMontant(totalTTC)} Ar
            </div>
            <button
              onClick={enregistrerBonAchat}
              disabled={isLoadingSave || isLoadingJournal}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {(isLoadingSave || isLoadingJournal) ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Traitement...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Valider et Enregistrer
                </>
              )}
            </button>
          </div>
        )}

        {lignes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 border border-gray-200">
            <p className="text-base">Aucune ligne de détail de Bon d'Achat ajoutée</p>
            <p className="text-sm mt-1">Veuillez saisir les informations et ajouter des lignes de détail ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
