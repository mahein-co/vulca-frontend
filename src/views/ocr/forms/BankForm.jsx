import React, { useState, useCallback, useMemo, useEffect } from 'react';
import toast from "react-hot-toast";
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";

// Helper for currency formatting
const formatMontant = (montant) => {
  if (typeof montant === 'string') {
    montant = parseFloat(montant.replace(/,/g, '.'));
  }
  if (isNaN(montant)) return '0,00';
  const roundedMontant = Math.round(montant * 100) / 100;
  return roundedMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().substring(0, 10);
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
  <div className="fixed inset-0 backdrop-blur-sm z-[10000] flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center max-w-sm w-full text-center">
      {/* Spinner style iOS/moderne */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-base sm:text-lg font-semibold text-gray-800 animate-pulse px-4">{message}</p>
    </div>
  </div>
);

export default function BankForm({ onSaisieCompleted, onSaveComplete }) {

  // API Hooks
  const [actionSaveReleveBancaire, { isLoading: isLoadingSave, isSuccess: isSuccessSave, isError: isErrorSave, data: dataSave }] = useSavePieceByFormularMutation();
  const [actionGenerateJournal, { isLoading: isLoadingJournal, isSuccess: isSuccessJournal, isError: isErrorJournal, error: errorJournal }] = useGenerateJournalMutation();

  // State
  const [header, setHeader] = useState({
    nomTitulaire: '',
    numeroCompte: '',
    nomBanque: '',
    dateDebut: '',
    dateFin: getTodayDate(),
  });

  const [transactions, setTransactions] = useState([]);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    date: getTodayDate(),
    reference: '',
    description: '',
    debit: '',
    credit: '',
  });
  const [ligneEnModification, setLigneEnModification] = useState(null);
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState(null);

  // Handlers
  const handleChangeHeader = useCallback((e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChangeLigne = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Allow date and description as is, but restrict debit/credit to numbers/dots
    if (name === 'debit' || name === 'credit') {
      newValue = value.replace(/[^0-9.]/g, '');
    }
    setNouvelleLigne(prev => ({ ...prev, [name]: newValue }));
  }, []);

  const resetNouvelleLigne = useCallback(() => {
    setNouvelleLigne({ date: getTodayDate(), reference: '', description: '', debit: '', credit: '' });
    setLigneEnModification(null);
  }, []);

  const validateAndGetLigneData = () => {
    const { date, reference, description, debit, credit } = nouvelleLigne;
    if (!date || !description) {
      toast.error('La date et la description sont obligatoires.');
      return null;
    }

    const debitVal = parseFloat(debit || '0');
    const creditVal = parseFloat(credit || '0');

    if (debitVal === 0 && creditVal === 0) {
      toast.error('Veuillez saisir un montant en Débit ou en Crédit.');
      return null;
    }

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
    const data = validateAndGetLigneData();
    if (data === null) return;

    const ligne = { ...data, id: Date.now() };
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      setTransactions(transactions.filter(t => t.id !== id));
      if (ligneEnModification === id) resetNouvelleLigne();
    }
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
    if (!header.nomBanque || !header.numeroCompte || transactions.length === 0) {
      toast.error('Veuillez remplir les informations du compte et ajouter au moins une transaction.');
      return;
    }

    const data = {
      piece_type: "Relevé bancaire",
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
      ref_file: header.numeroCompte,
    };

    setDataToGenerateJournal(data);
    actionSaveReleveBancaire(data);
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
        nomTitulaire: '', numeroCompte: '', nomBanque: '', dateDebut: '', dateFin: getTodayDate()
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
        <div className="flex-shrink-0 bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-3 py-2">
            <div className="flex justify-between items-center">
              <div className="flex-shrink-0">
                <BackToFormsPage onClick={onSaisieCompleted} />
              </div>
              <h1 className="text-base font-bold text-gray-800 flex-1 text-center px-4">
                Saisie Manuelle de Relevé Bancaire
              </h1>
              <div className="flex-shrink-0 w-[88px] flex justify-end">
                {/* Exemple Button Removed */}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-3">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* Card 1: Account Info */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 border-t-2 border-gray-300">
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Informations Compte
                </h2>

                {transactions.length > 0 && (
                  <p className="text-xs text-red-600 bg-red-50 p-1 rounded mb-2 border border-red-200">
                    ⚠️ Les informations de l'en-tête sont bloquées car des lignes ont déjà été ajoutées. Supprimez toutes les lignes pour les modifier.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Banque</label>
                    <input type="text" name="nomBanque" value={header.nomBanque} onChange={handleChangeHeader} disabled={transactions.length > 0} placeholder="Ex: BNI, BOA..." className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${transactions.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">N° Compte (RIB)</label>
                    <input type="text" name="numeroCompte" value={header.numeroCompte} onChange={handleChangeHeader} disabled={transactions.length > 0} placeholder="Ex: 0000 1234..." className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${transactions.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Titulaire</label>
                    <input type="text" name="nomTitulaire" value={header.nomTitulaire} onChange={handleChangeHeader} disabled={transactions.length > 0} placeholder="Nom du titulaire" className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 ${transactions.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                  </div>
                  {/* Solde Initial input removed */}

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Période Du</label>
                      <input type="date" name="dateDebut" value={header.dateDebut} onChange={handleChangeHeader} disabled={transactions.length > 0} className={`w-full px-1 py-1 text-xs border border-gray-300 rounded-md ${transactions.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Au</label>
                      <input type="date" name="dateFin" value={header.dateFin} onChange={handleChangeHeader} disabled={transactions.length > 0} className={`w-full px-1 py-1 text-xs border border-gray-300 rounded-md ${transactions.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Add Transaction */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 border-t-2 border-gray-300">
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  {ligneEnModification ? '✏️ Modifier transaction' : '➕ Ajouter transaction'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                    <input type="date" name="date" value={nouvelleLigne.date} onChange={handleChangeLigne} className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Référence</label>
                    <input type="text" name="reference" value={nouvelleLigne.reference} onChange={handleChangeLigne} placeholder="Ex: VIRM-... " className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description / Libellé</label>
                    <input type="text" name="description" value={nouvelleLigne.description} onChange={handleChangeLigne} placeholder="Ex: Virement reçu..." className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Débit (Ar)</label>
                    <input type="text" name="debit" value={nouvelleLigne.debit} onChange={handleChangeLigne} placeholder="0" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-right" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Crédit (Ar)</label>
                    <input type="text" name="credit" value={nouvelleLigne.credit} onChange={handleChangeLigne} placeholder="0" className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-right" />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-2 border-t border-gray-100">
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
                    {ligneEnModification ? 'Valider' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Summary */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">

                {/* Stats Mobile/Header */}
                <div className='p-3 bg-gray-50 border-b border-gray-200 text-sm grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-gray-500 text-xs uppercase font-bold'>Total Débit</p>
                    <p className='text-red-600 font-bold text-base'>{formatMontant(checkTotals.totalDebit)} Ar</p>
                  </div>
                  <div className='text-center border-l border-r border-gray-200'>
                    <p className='text-gray-500 text-xs uppercase font-bold'>Total Crédit</p>
                    <p className='text-emerald-600 font-bold text-base'>{formatMontant(checkTotals.totalCredit)} Ar</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-gray-500 text-xs uppercase font-bold'>Solde (Net)</p>
                    <p className={`font-bold text-base ${checkTotals.soldeFinal < 0 ? 'text-red-700' : 'text-blue-700'}`}>{formatMontant(checkTotals.soldeFinal)} Ar</p>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase w-[12%]">Date</th>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase w-[15%]">Référence</th>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase w-[33%]">Description</th>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase w-[13%]">Débit</th>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase w-[13%]">Crédit</th>
                          <th className="border-b-2 border-gray-200 px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase w-[14%]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {transactions.map((t, index) => (
                          <tr key={t.id} className={`${index % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-indigo-50/30 transition-colors duration-150`}>
                            <td className="px-3 py-2 text-sm text-gray-600">{t.date}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 font-medium">{t.reference || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-800 font-medium">{t.description}</td>
                            <td className="px-3 py-2 text-sm text-right text-red-600 font-medium">{t.debit > 0 ? formatMontant(t.debit) : '-'}</td>
                            <td className="px-3 py-2 text-sm text-right text-emerald-600 font-medium">{t.credit > 0 ? formatMontant(t.credit) : '-'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <div className='flex justify-center gap-2'>
                                <button onClick={() => modifierLigne(t)} className="text-blue-600 hover:text-blue-800" title="Modifier"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7m-7-7v7h7" /></svg></button>
                                <button onClick={() => supprimerLigne(t.id)} className="text-red-600 hover:text-red-800" title="Supprimer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
              <div className="mt-0 p-4 flex justify-end items-center bg-white border-t rounded-lg shadow-lg">
                <button
                  onClick={handleSubmit}
                  disabled={isLoadingSave || isLoadingJournal}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
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
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 border border-gray-200">
                <p className="text-base">Aucune transaction bancaire ajoutée</p>
                <p className="text-sm mt-1">Veuillez renseigner les détails et ajouter des transactions ci-dessus.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
