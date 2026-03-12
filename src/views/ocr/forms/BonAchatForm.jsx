import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { formatNumberWithSpaces, removeSpacesFromNumber } from '../../../utils/numberFormat';
import { getTodayISO } from '../../../utils/dateUtils';
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";
import { useProjectId } from '../../../hooks/useProjectId';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import LoadingOverlay from '../../../components/layout/LoadingOverlay';
import ButtonSpinner from '../../../components/ui/ButtonSpinner';



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





export default function BonAchatForm({ onSaisieCompleted, onSaveComplete }) {

  // API Hooks
  const projectId = useProjectId();
  const [actionSaveBonAchat, { isLoading: isLoadingSave, isSuccess: isSuccessSave, isError: isErrorSave, data: dataSave }] = useSavePieceByFormularMutation();
  const [actionGenerateJournal, { isLoading: isLoadingJournal, isSuccess: isSuccessJournal, isError: isErrorJournal, error: errorJournal }] = useGenerateJournalMutation();

  const [header, setHeader] = useState(() => ({
    fournisseur: '',
    client: '',
    reference: '',
    numeroBon: '',
    dateBon: getTodayISO(),
    address: '',
    rcs: '',
    nif: '',
    stat: '',
    tauxTVA: '0', // Bons d'achat often exclude TVA or include it directly, defaulting to 0 but editable
  }));

  const [lignes, setLignes] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    description: '',
    quantite: 1,
    prixUnitaire: '',
  });
  const [ligneEnModification, setLigneEnModification] = useState(null);
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [headerErrors, setHeaderErrors] = useState({});

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);


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


  const handleChangeHeader = useCallback((e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
    if (headerErrors[name]) {
      setHeaderErrors(prev => ({ ...prev, [name]: false }));
    }
  }, [headerErrors]);

  const handleChangeLigne = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'quantite' || name === 'prixUnitaire') {
      const cleanValue = removeSpacesFromNumber(value);
      newValue = formatNumberWithSpaces(cleanValue);
    }
    setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: false }));
    }
  }, [validationErrors]);

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
    const errors = {};

    if (!description) errors.description = true;
    if (!quantite) errors.quantite = true;
    if (!prixUnitaire) errors.prixUnitaire = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Veuillez remplir tous les champs obligatoires de la ligne (Désignation, Quantité, Prix unitaire).', { duration: 2000 });
      return null;
    }

    const qteValue = parseFloat(quantite);
    const puValue = parseFloat(prixUnitaire);
    if (isNaN(qteValue) || isNaN(puValue) || qteValue <= 0 || puValue <= 0) {
      if (isNaN(qteValue) || qteValue <= 0) errors.quantite = true;
      if (isNaN(puValue) || puValue <= 0) errors.prixUnitaire = true;
      setValidationErrors(errors);
      toast.error('La quantité et le prix unitaire doivent être des nombres positifs valides.');
      return null;
    }

    setValidationErrors({});
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

    // Validate both header and line fields together
    const headerErrors = {};
    const lineErrors = {};

    // Check header fields
    if (!header.fournisseur) headerErrors.fournisseur = true;
    if (!header.client) headerErrors.client = true;
    if (!header.address) headerErrors.address = true;
    if (!header.numeroBon) headerErrors.numeroBon = true;
    if (!header.dateBon) headerErrors.dateBon = true;

    // Check line fields
    const { description, quantite, prixUnitaire } = nouvelleLigne;
    if (!description) lineErrors.description = true;
    if (!quantite) lineErrors.quantite = true;
    if (!prixUnitaire) lineErrors.prixUnitaire = true;

    // If any errors, show them all at once
    if (Object.keys(headerErrors).length > 0 || Object.keys(lineErrors).length > 0) {
      setHeaderErrors(headerErrors);
      setValidationErrors(lineErrors);
      toast.error('Veuillez remplir tous les champs obligatoires (Informations Générales et Ligne).', { duration: 2000 });
      return;
    }

    // Validate numeric values
    const qteValue = parseFloat(removeSpacesFromNumber(quantite));
    const puValue = parseFloat(removeSpacesFromNumber(prixUnitaire));
    if (isNaN(qteValue) || isNaN(puValue) || qteValue <= 0 || puValue <= 0) {
      if (isNaN(qteValue) || qteValue <= 0) lineErrors.quantite = true;
      if (isNaN(puValue) || puValue <= 0) lineErrors.prixUnitaire = true;
      setValidationErrors(lineErrors);
      toast.error('La quantité et le prix unitaire doivent être des nombres positifs valides.');
      return;
    }

    setValidationErrors({});
    const totalHTLigne = qteValue * puValue;
    const montantTVALigne = totalHTLigne * tvaRateDecimal;
    const data = {
      description,
      quantite: qteValue,
      prixUnitaire: puValue,
      totalLigneHT: totalHTLigne,
      montantTVALigne: montantTVALigne,
      totalLigneTTC: totalHTLigne + montantTVALigne
    };

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
      resetNouvelleLigne();
      toast.success("Toutes les lignes ont été supprimées. L'en-tête est déverrouillé.");
    } else {
      if (itemToDelete) {
        setLignes(lignes.filter(ligne => ligne.id !== itemToDelete));
        if (ligneEnModification === itemToDelete) resetNouvelleLigne();
        toast.success("Ligne supprimée.");
      }
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleteAll(false);
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
      toast.success("Enregistrement succès");
      setLignes([]);
      setHeader({
        fournisseur: '', client: '', reference: '', numeroBon: '', dateBon: getTodayISO(), address: '', rcs: '', nif: '', stat: '', tauxTVA: '0'
      });
      if (onSaveComplete) onSaveComplete();
    } else if (isErrorJournal) {
      toast.error(errorJournal?.data?.error || "Erreur lors de la génération du journal.");
    }
  }, [isSuccessJournal, isErrorJournal, errorJournal, onSaveComplete]);


  const enregistrerBonAchat = async () => {
    const errors = {};

    if (!header.fournisseur) errors.fournisseur = true;
    if (!header.client) errors.client = true;
    if (!header.address) errors.address = true;
    if (!header.numeroBon) errors.numeroBon = true;
    if (!header.dateBon) errors.dateBon = true;

    if (Object.keys(errors).length > 0 || lignes.length === 0) {
      setHeaderErrors(errors);
      toast.error('Veuillez renseigner tous les champs obligatoires des Informations Générales (Fournisseur, Client, Adresse, Numéro, Date) et ajouter au moins une ligne.', { duration: 2000 });
      return;
    }

    setHeaderErrors({});

    const data = {
      piece_type: "Bon d'achat",
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
      ref_file: header.numeroBon,
    };

    setDataToGenerateJournal(data);
    actionSaveBonAchat({ data, project_id: projectId });
  };

  return (
    <>
      {/* Loading Overlay */}
      {(isLoadingSave || isLoadingJournal) && (
        <LoadingOverlay
          message="Validation et enregistrement en cours..."
        />
      )}

      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header fixe */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-3 py-2">
            <div className="flex justify-between items-center">
              <div className="flex-shrink-0">
                <BackToFormsPage onClick={onSaisieCompleted} />
              </div>
              <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 flex-1 text-center px-4">
                Saisie manuelle de bon d'achat
              </h1>
              <div className="flex-shrink-0 w-[88px] flex justify-end">
                {/* Exemple Button Removed */}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto w-full p-3">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Informations Générales
                </h2>



                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fournisseur</label>
                    <input type="text" name="fournisseur" value={header.fournisseur} onChange={handleChangeHeader} placeholder="Nom du fournisseur" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.fournisseur ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      value={header.client}
                      onChange={handleChangeHeader}
                      placeholder="Nom du client"
                      className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.client ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`}
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Numéro Bon</label>
                    <input type="text" name="numeroBon" value={header.numeroBon} onChange={handleChangeHeader} placeholder="BA-001" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.numeroBon ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                    <input type="date" name="dateBon" value={header.dateBon} onChange={handleChangeHeader} max={getTodayISO()} className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.dateBon ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lieu / Adresse </label>
                    <input type="text" name="address" value={header.address} onChange={handleChangeHeader} placeholder="Adresse" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.address ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>
                </div>


              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Infos légales (Optionnel)</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">RCS</label>
                      <input type="text" name="rcs" value={header.rcs} onChange={handleChangeHeader} className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md`} placeholder="RCS..." />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">NIF</label>
                      <input type="text" name="nif" value={header.nif} onChange={handleChangeHeader} className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md`} placeholder="NIF..." />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">STAT</label>
                      <input type="text" name="stat" value={header.stat} onChange={handleChangeHeader} className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md`} placeholder="STAT..." />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">TVA (%)</label>
                      <input type="number" name="tauxTVA" value={header.tauxTVA} onChange={handleChangeHeader} className={`w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md text-right`} placeholder="0" />
                    </div>
                  </div>
                </div>

                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
                  <span>{ligneEnModification ? '✏️ Modification de la ligne' : '➕ Ajouter une ligne'}</span>
                  {lignes.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="ml-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-3 py-1 rounded text-xs font-semibold transition-colors border border-red-200 dark:border-red-800"
                    >
                      Tout supprimer
                    </button>
                  )}
                </h2>

                <div className="grid grid-cols-12 gap-3">

                  <div className="col-span-12 lg:col-span-5">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Désignation</label>
                    <input
                      type="text"
                      name="description"
                      value={nouvelleLigne.description}
                      onChange={handleChangeLigne}
                      className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.description ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                      placeholder="Ex: Marchandises diverses"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-3 lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantité</label>
                    <input
                      type="text"
                      name="quantite"
                      value={nouvelleLigne.quantite}
                      onChange={handleChangeLigne}
                      className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-right ${validationErrors.quantite ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                      placeholder="1"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-3 lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prix unitaire HT (Ar)</label>
                    <input
                      type="text"
                      name="prixUnitaire"
                      value={nouvelleLigne.prixUnitaire}
                      onChange={handleChangeLigne}
                      className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-right ${validationErrors.prixUnitaire ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total ligne TTC (Ar)</label>
                    <p className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-md text-gray-700 dark:text-gray-300 text-right font-bold">
                      {formatMontant((parseFloat(removeSpacesFromNumber(nouvelleLigne.quantite)) || 0) * (parseFloat(removeSpacesFromNumber(nouvelleLigne.prixUnitaire)) || 0) * (1 + tvaRateDecimal))}
                    </p>
                  </div>

                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={ajouterLigne}
                    className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-semibold text-sm py-1.5 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4">

                <div className='p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-sm'>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='text-gray-700 dark:text-gray-300'>Total hors taxe:</p>
                    <p className='text-gray-900 dark:text-gray-100 font-semibold'>{formatMontant(totalHT)} Ar</p>
                  </div>
                  <div className='flex justify-between items-center mb-1'>
                    <p className='text-gray-700 dark:text-gray-300'>Montant TVA ({formatMontant(parseFloat(header.tauxTVA))}%):</p>
                    <p className='text-gray-900 dark:text-gray-100 font-semibold'>{formatMontant(montantTVA)} Ar</p>
                  </div>
                  <div className='flex justify-between items-center text-base font-bold pt-2 border-t border-gray-300 dark:border-gray-600'>
                    <p className='text-gray-800 dark:text-gray-200'>Total TTC:</p>
                    <p className='text-gray-900 dark:text-gray-100'>{formatMontant(totalTTC)} Ar</p>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[30%]">Désignation</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">Quantité</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Prix unitaire HT (Ar)</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Total ligne HT (Ar)</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">TVA (Ar)</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">Total ligne TTC (Ar)</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-2 py-1.5 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[10%]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {lignes.map((ligne, index) => (
                          <tr key={ligne.id} className={`${index % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''} hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors duration-150`}>
                            <td className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 font-medium">{ligne.description}</td>
                            <td className="px-2 py-1 text-sm text-right text-gray-800 dark:text-gray-200">{formatMontant(ligne.quantite)}</td>
                            <td className="px-2 py-1 text-sm text-right text-gray-800 dark:text-gray-200">{formatMontant(ligne.prixUnitaire)}</td>
                            <td className="px-2 py-1 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{formatMontant(ligne.totalLigneHT)}</td>
                            <td className="px-2 py-1 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{formatMontant(ligne.montantTVALigne)}</td>
                            <td className="px-2 py-1 text-sm text-right font-bold text-gray-900 dark:text-gray-100">{formatMontant(ligne.totalLigneTTC)}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-center">
                              <div className='flex justify-center gap-1'>
                                <button onClick={() => modifierLigne(ligne)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition disabled:text-gray-400 p-1" title="Modifier" disabled={ligneEnModification !== null}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => supprimerLigne(ligne.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition disabled:text-gray-400 p-1" title="Supprimer" disabled={ligneEnModification !== null}>
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
                            <button onClick={() => modifierLigne(ligne)} className="text-blue-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
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
              <div className="mt-0 p-4 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 border-t dark:border-gray-700 rounded-lg shadow-lg">
                <div className="mb-3 md:mb-0 px-3 py-1 rounded-md font-bold text-base bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200">
                  TOTAL TTC: {formatMontant(totalTTC)} Ar
                </div>
                <button
                  onClick={enregistrerBonAchat}
                  disabled={isLoadingSave || isLoadingJournal}
                  className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  {(isLoadingSave || isLoadingJournal) ? (
                    <span className="flex items-center">
                      <ButtonSpinner className="mr-3" />
                      Traitement...
                    </span>
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
                <p className="text-base text-gray-800 dark:text-gray-200">Aucune ligne de détail de Bon d'Achat ajoutée</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Veuillez saisir les informations et ajouter des lignes de détail ci-dessus.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={isDeleteAll ? "Supprimer toutes les lignes ?" : "Supprimer la ligne ?"}
        message={isDeleteAll
          ? "Cette action supprimera toutes les lignes du bon d'achat et déverrouillera l'en-tête. Cette action est irréversible."
          : "Êtes-vous sûr de vouloir supprimer cette ligne ?"}
        confirmText={isDeleteAll ? "Tout supprimer" : "Supprimer"}
        isDanger={true}
      />
    </>
  );
}
