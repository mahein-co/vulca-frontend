import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { formatNumberWithSpaces, removeSpacesFromNumber } from '../../../utils/numberFormat';
import { getTodayISO } from '../../../utils/dateUtils';
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";
import { useProjectId } from '../../../hooks/useProjectId';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

// Helper for currency formatting
const formatMontant = (montant) => {
  if (typeof montant === 'string') {
    montant = parseFloat(montant.replace(/,/g, '.'));
  }
  if (isNaN(montant)) return '0,00';
  const roundedMontant = Math.round(montant * 100) / 100;
  return roundedMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};



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

// Composant Overlay de Chargement
const LoadingOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm z-[10000] flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center max-w-sm w-full text-center">
      {/* Spinner style iOS/moderne */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
        <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 animate-pulse px-4">{message}</p>
    </div>
  </div>
);

export default function BankForm({ onSaisieCompleted, onSaveComplete }) {

  // API Hooks
  const projectId = useProjectId();
  const [actionSaveReleveBancaire, { isLoading: isLoadingSave, isSuccess: isSuccessSave, isError: isErrorSave, data: dataSave }] = useSavePieceByFormularMutation();
  const [actionGenerateJournal, { isLoading: isLoadingJournal, isSuccess: isSuccessJournal, isError: isErrorJournal, error: errorJournal }] = useGenerateJournalMutation();

  // State
  const [header, setHeader] = useState(() => ({
    nomTitulaire: '',
    numeroCompte: '',
    nomBanque: '',
    dateDebut: '',
    dateFin: getTodayISO(),
  }));

  const [transactions, setTransactions] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState(() => ({
    date: getTodayISO(),
    reference: '',
    description: '',
    debit: '',
    credit: '',
  }));
  const [ligneEnModification, setLigneEnModification] = useState(null);
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [headerErrors, setHeaderErrors] = useState({});

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Handlers
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
    // Format debit and credit fields with spaces
    if (name === 'debit' || name === 'credit') {
      const cleanValue = removeSpacesFromNumber(value);
      newValue = formatNumberWithSpaces(cleanValue);
    }
    setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: false }));
    }
  }, [validationErrors]);

  const resetNouvelleLigne = useCallback(() => {
    setNouvelleLigne({ date: getTodayISO(), reference: '', description: '', debit: '', credit: '' });
    setLigneEnModification(null);
  }, []);

  const validateAndGetLigneData = () => {
    const { date, reference, description, debit, credit } = nouvelleLigne;
    const errors = {};

    if (!date) errors.date = true;
    if (!description) errors.description = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Veuillez remplir tous les champs obligatoires de la transaction (Date et Description).', { duration: 2000 });
      return null;
    }

    const debitVal = parseFloat(removeSpacesFromNumber(debit) || '0');
    const creditVal = parseFloat(removeSpacesFromNumber(credit) || '0');

    if (debitVal === 0 && creditVal === 0) {
      setValidationErrors({ debit: true, credit: true });
      toast.error('Veuillez saisir un montant en Débit ou en Crédit.');
      return null;
    }

    setValidationErrors({});
    return {
      date,
      reference: reference || '',
      description,
      debit: debitVal,
      credit: creditVal
    };
  };

  const ajouterLigne = () => {
    if (ligneEnModification) {
      sauvegarderModification(); return;
    }

    // Validate both account info and transaction fields together
    const headerErrors = {};
    const lineErrors = {};

    // Check account info fields
    if (!header.nomBanque) headerErrors.nomBanque = true;
    if (!header.numeroCompte) headerErrors.numeroCompte = true;
    if (!header.nomTitulaire) headerErrors.nomTitulaire = true;
    if (!header.dateDebut) headerErrors.dateDebut = true;
    if (!header.dateFin) headerErrors.dateFin = true;

    // Check transaction fields
    const { date, reference, description, debit, credit } = nouvelleLigne;
    if (!date) lineErrors.date = true;
    if (!reference) lineErrors.reference = true;
    if (!description) lineErrors.description = true;

    // If any errors, show them all at once
    if (Object.keys(headerErrors).length > 0 || Object.keys(lineErrors).length > 0) {
      setHeaderErrors(headerErrors);
      setValidationErrors(lineErrors);
      toast.error('Veuillez remplir tous les champs obligatoires (Informations Compte et Transaction).', { duration: 2000 });
      return;
    }

    // Validate debit/credit
    // Remove spaces and replace comma with dot for correct parsing
    const cleanAmount = (val) => val ? parseFloat(val.toString().replace(/\s/g, '').replace(',', '.')) : 0;

    const debitValue = cleanAmount(debit);
    const creditValue = cleanAmount(credit);

    if (debitValue === 0 && creditValue === 0) {
      setValidationErrors({ debit: true, credit: true });
      toast.error('Veuillez saisir un montant en Débit ou en Crédit.');
      return;
    }

    setValidationErrors({});
    const ligne = { date, reference: nouvelleLigne.reference, description, debit: debitValue, credit: creditValue, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    setTransactions(prev => [...prev, ligne]);
    // Preserve date for next entry as it might be sequential
    setNouvelleLigne(prev => ({ ...prev, reference: '', description: '', debit: '', credit: '' }));
  };

  const modifierLigne = (ligne) => {
    setLigneEnModification(ligne.id);
    setNouvelleLigne({
      date: ligne.date,
      reference: ligne.reference || '',
      description: ligne.description,
      debit: ligne.debit === 0 ? '' : ligne.debit.toString(),
      credit: ligne.credit === 0 ? '' : ligne.credit.toString()
    });
  };

  const sauvegarderModification = () => {
    const data = validateAndGetLigneData();
    if (data === null) return;
    setTransactions(transactions.map(t => t.id === ligneEnModification ? { ...t, ...data } : t));
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
      setTransactions([]);
      resetNouvelleLigne();
      toast.success("Toutes les lignes ont été supprimées. L'en-tête est déverrouillé.");
    } else {
      if (itemToDelete) {
        setTransactions(transactions.filter(t => t.id !== itemToDelete));
        if (ligneEnModification === itemToDelete) resetNouvelleLigne();
        toast.success("Transaction supprimée.");
      }
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleteAll(false);
  };

  // Calculations
  const checkTotals = useMemo(() => {
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const soldeFinal = totalCredit - totalDebit; // Solde du relevé (net)

    return { totalDebit, totalCredit, soldeFinal };
  }, [transactions]);


  // Validation & Save
  const handleSubmit = async () => {
    const errors = {};

    if (!header.nomBanque) errors.nomBanque = true;
    if (!header.numeroCompte) errors.numeroCompte = true;
    if (!header.nomTitulaire) errors.nomTitulaire = true;
    if (!header.dateDebut) errors.dateDebut = true;
    if (!header.dateFin) errors.dateFin = true;

    if (Object.keys(errors).length > 0 || transactions.length === 0) {
      setHeaderErrors(errors);
      toast.error('Veuillez remplir tous les champs obligatoires des Informations Compte (Banque, N°, Titulaire, Période) et ajouter au moins une transaction.', { duration: 2000 });
      return;
    }

    setHeaderErrors({});

    // Trouver la date de la dernière transaction (la plus récente)
    const lastTransactionDate = transactions.reduce((latest, t) => {
      return t.date > latest ? t.date : latest;
    }, transactions[0].date);

    // Déterminer le type de pièce (Virement, Salaire, Chèque, etc.)
    let finalPieceType = "Relevé bancaire";

    if (transactions.length === 1) {
      const t = transactions[0];
      const ref = (t.reference || '').toUpperCase();
      const desc = (t.description || '').toUpperCase();
      const content = ref + ' ' + desc;

      if (ref.includes('SALAIRE') || ref.includes('PAIE') || ref.includes('PAYE') || ref.includes('REMUNERATION') ||
        desc.includes('SALAIRE') || desc.includes('PAIE') || desc.includes('PAYE') || desc.includes('REMUNERATION')) {
        finalPieceType = "Paiement de salaire";
      } else if (ref.includes('VIREMENT') || ref.includes('VIRM') || ref.includes('VIR') ||
        desc.includes('VIREMENT') || desc.includes('VIRM') || desc.includes('VIR')) {
        finalPieceType = "Virement bancaire";
      } else if (ref.includes('CHEQUE') || ref.includes('CHQ') || desc.includes('CHEQUE') || desc.includes('CHQ')) {
        finalPieceType = "Chèque";
      } else if (ref.includes('RETRAIT') || ref.includes('DAB') || ref.includes('ATM') ||
        desc.includes('RETRAIT') || desc.includes('DAB') || desc.includes('ATM')) {
        finalPieceType = "Retrait";
      } else if (ref.includes('DEPOT') || ref.includes('VERSEMENT') ||
        desc.includes('DEPOT') || desc.includes('VERSEMENT')) {
        finalPieceType = "Dépôt";
      }
    }

    const data = {
      piece_type: finalPieceType,
      description_json: {
        name_titulaire: header.nomTitulaire,
        account_number: header.numeroCompte,
        bank_name: header.nomBanque,
        periode_date_start: header.dateDebut,
        periode_date_end: header.dateFin,
        initial_sold: 0,
        transactions_details: transactions,
        totalDebit: checkTotals.totalDebit,
        totalCredit: checkTotals.totalCredit,
        soldeFinal: checkTotals.soldeFinal,
      },
      // Si une seule transaction, la référence du fichier DOIT être la référence de la transaction (ex: PAIE-01-2025)
      // Sinon (Relevé complet), on utilise le numéro de compte
      ref_file: transactions.length === 1 ? transactions[0].reference : header.numeroCompte,
      date: lastTransactionDate, // Date de la dernière transaction pour filtrage
    };

    setDataToGenerateJournal(data);
    actionSaveReleveBancaire({ data, project_id: projectId });
  };

  // Effects for API
  useEffect(() => {
    if (isSuccessSave && dataSave) {
      const journalData = {
        ...dataToGenerateJournal,
        file_source: null,
        form_source: dataSave?.form_source?.id,
      };
      actionGenerateJournal(journalData);
    } else if (isErrorSave) {
      toast.error("Erreur lors de l'enregistrement du relevé.");
    }
  }, [isSuccessSave, isErrorSave, dataSave, actionGenerateJournal, dataToGenerateJournal]);

  useEffect(() => {
    if (isSuccessJournal) {
      toast.success("Enregistrement succès");
      setTransactions([]);
      setHeader({
        nomTitulaire: '', numeroCompte: '', nomBanque: '', dateDebut: '', dateFin: getTodayISO()
      });
      if (onSaveComplete) onSaveComplete();
    } else if (isErrorJournal) {
      toast.error(errorJournal?.data?.error || "Erreur lors de la génération du journal.");
    }
  }, [isSuccessJournal, isErrorJournal, errorJournal, onSaveComplete]);


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
                Saisie Manuelle de Relevé Bancaire
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

              {/* Card 1: Account Info */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Informations Compte
                </h2>



                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Banque</label>
                    <input type="text" name="nomBanque" value={header.nomBanque} onChange={handleChangeHeader} placeholder="Ex: BNI, BOA..." className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.nomBanque ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">N° Compte (RIB)</label>
                    <input type="text" name="numeroCompte" value={header.numeroCompte} onChange={handleChangeHeader} placeholder="Ex: 0000 1234..." className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.numeroCompte ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titulaire</label>
                    <input type="text" name="nomTitulaire" value={header.nomTitulaire} onChange={handleChangeHeader} placeholder="Nom du titulaire" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${headerErrors.nomTitulaire ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                  </div>
                  {/* Solde Initial input removed */}

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Période Du</label>
                      <input type="date" name="dateDebut" value={header.dateDebut} onChange={handleChangeHeader} className={`w-full px-1 py-1 text-xs border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${headerErrors.dateDebut ? 'border-2 border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Au</label>
                      <input type="date" name="dateFin" value={header.dateFin} onChange={handleChangeHeader} className={`w-full px-1 py-1 text-xs border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${headerErrors.dateFin ? 'border-2 border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Add Transaction */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
                  <span>{ligneEnModification ? '✏️ Modifier transaction' : '➕ Ajouter transaction'}</span>
                  {transactions.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="ml-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-3 py-1 rounded text-xs font-semibold transition-colors border border-red-200 dark:border-red-800"
                    >
                      Tout supprimer
                    </button>
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                    <input type="date" name="date" value={nouvelleLigne.date} onChange={handleChangeLigne} className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.date ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Référence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={nouvelleLigne.reference}
                      onChange={handleChangeLigne}
                      placeholder="Ex: VIRM-..."
                      className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.reference ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description / Libellé</label>
                    <input type="text" name="description" value={nouvelleLigne.description} onChange={handleChangeLigne} placeholder="Ex: Virement reçu..." className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.description ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Débit (Ar)</label>
                    <input type="text" name="debit" value={nouvelleLigne.debit} onChange={handleChangeLigne} placeholder="0" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-right ${validationErrors.debit ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Crédit (Ar)</label>
                    <input type="text" name="credit" value={nouvelleLigne.credit} onChange={handleChangeLigne} placeholder="0" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-right ${validationErrors.credit ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                  </div>
                </div>

                <div className="mt-4 flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={ajouterLigne}
                    className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-semibold text-sm py-1.5 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ligneEnModification ? "M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                    {ligneEnModification ? 'Valider' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Summary */}
            {transactions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4">

                {/* Stats Mobile/Header */}
                <div className='p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-sm grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-gray-500 dark:text-gray-400 text-xs uppercase font-bold'>Total Débit</p>
                    <p className='text-red-600 dark:text-red-400 font-bold text-base'>{formatNumberWithSpaces(checkTotals.totalDebit)} Ar</p>
                  </div>
                  <div className='text-center border-l border-r border-gray-200 dark:border-gray-700'>
                    <p className='text-gray-500 dark:text-gray-400 text-xs uppercase font-bold'>Total Crédit</p>
                    <p className='text-emerald-600 dark:text-emerald-400 font-bold text-base'>{formatNumberWithSpaces(checkTotals.totalCredit)} Ar</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-gray-500 dark:text-gray-400 text-xs uppercase font-bold'>Solde (Net)</p>
                    <p className={`font-bold text-base ${checkTotals.soldeFinal < 0 ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>{formatNumberWithSpaces(checkTotals.soldeFinal)} Ar</p>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[12%]">Date</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[15%]">Référence</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[33%]">Description</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[13%]">Débit</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[13%]">Crédit</th>
                          <th className="border-b-2 border-gray-200 dark:border-gray-600 px-3 py-2 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase w-[14%]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((t, index) => (
                          <tr key={t.id} className={`${index % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''} hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors duration-150`}>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{t.date}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{t.reference || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 font-medium">{t.description}</td>
                            <td className="px-3 py-2 text-sm text-right text-red-600 dark:text-red-400 font-medium">{t.debit > 0 ? formatMontant(t.debit) : '-'}</td>
                            <td className="px-3 py-2 text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">{t.credit > 0 ? formatMontant(t.credit) : '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">
                              <div className='flex justify-center gap-2'>
                                <button onClick={() => modifierLigne(t)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Modifier"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg></button>
                                <button onClick={() => supprimerLigne(t.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Supprimer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                  {transactions.map(t => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">{t.date}</span>
                        {t.reference && <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{t.reference}</span>}
                      </div>
                      <div className="font-bold text-gray-800 mb-2">{t.description}</div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-red-600">Déb: {t.debit > 0 ? formatMontant(t.debit) : '-'}</div>
                        <div className="text-emerald-600">Cré: {t.credit > 0 ? formatMontant(t.credit) : '-'}</div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => modifierLigne(t)} className="text-blue-600 text-xs">Modifier</button>
                        <button onClick={() => supprimerLigne(t.id)} className="text-red-600 text-xs">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="mt-0 p-4 flex justify-end items-center bg-white dark:bg-gray-800 border-t dark:border-gray-700 rounded-lg shadow-lg">
                <button
                  onClick={handleSubmit}
                  disabled={isLoadingSave || isLoadingJournal}
                  className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                >
                  {(isLoadingSave || isLoadingJournal) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Traitement...
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

            {transactions.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                <p className="text-base text-gray-800 dark:text-gray-200">Aucune transaction bancaire ajoutée</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Veuillez renseigner les détails et ajouter des transactions ci-dessus.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={isDeleteAll ? "Supprimer toutes les lignes ?" : "Supprimer la transaction ?"}
        message={isDeleteAll
          ? "Cette action supprimera toutes les transactions saisies et déverrouillera l'en-tête. Cette action est irréversible."
          : "Êtes-vous sûr de vouloir supprimer cette transaction ?"}
        confirmText={isDeleteAll ? "Tout supprimer" : "Supprimer"}
        isDanger={true}
      />
    </>
  );
}
