import React, { useState, useCallback, useEffect } from 'react';
import toast from "react-hot-toast";
import { getTodayISO } from '../../../utils/dateUtils';
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";
import { formatNumberWithSpaces, removeSpacesFromNumber } from '../../../utils/numberFormat';
import { useProjectId } from '../../../hooks/useProjectId';
import LoadingOverlay from '../../../components/layout/LoadingOverlay';
import ButtonSpinner from '../../../components/ui/ButtonSpinner';

// Helper for currency formatting
const formatMontant = (montant) => {
    if (typeof montant === 'string') {
        montant = parseFloat(montant.replace(/,/g, '.'));
    }
    if (isNaN(montant)) return '0,00';
    // Use Math.round to avoid float artifacts, though for simple display format is enough
    return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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



export default function FichePayeForm({ onSaisieCompleted, onSaveComplete }) {

    // API Hooks
    const projectId = useProjectId();
    const [actionSaveFichePaie, { isLoading: isLoadingSave, isSuccess: isSuccessSave, isError: isErrorSave, data: dataSave }] = useSavePieceByFormularMutation();
    const [actionGenerateJournal, { isLoading: isLoadingJournal, isSuccess: isSuccessJournal, isError: isErrorJournal, error: errorJournal }] = useGenerateJournalMutation();

    // State
    const [formData, setFormData] = useState(() => ({
        employe: '',
        numFichePaie: '',
        periodePaie: '',
        dateEmission: getTodayISO(),
        dateEcheance: '',

        salaireBrut: '',
        cotisationSalariale: '',
        cotisationPatronale: '',
        retenueSource: '',
        netAPayer: '',
    }));

    const [validationErrors, setValidationErrors] = useState({});
    const [dataToGenerateJournal, setDataToGenerateJournal] = useState(null);

    // Handlers
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: false }));
        }
    }, [validationErrors]);

    const handleChangeAmount = useCallback((e) => {
        const { name, value } = e.target;
        // Format with spaces
        const cleanValue = removeSpacesFromNumber(value);
        // Normalize comma/dot
        const normalizedValue = cleanValue.replace(/,/g, '.');
        const formattedValue = formatNumberWithSpaces(normalizedValue);
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }, []);

    // IRSA Calculation Logic
    useEffect(() => {
        const brut = parseFloat(removeSpacesFromNumber(formData.salaireBrut).replace(/,/g, '.') || '0');
        if (brut > 0) {
            // CNaPS 1%
            const cnaps = brut * 0.01;

            // Base Imposable
            const baseImposable = brut - cnaps;

            let irsa = 0;
            // Tranche 1: 0 - 350,000 : 0%

            // Tranche 2: 350,001 - 400,000 : 5%
            if (baseImposable > 350000) {
                const tr2 = Math.min(baseImposable, 400000) - 350000;
                irsa += tr2 * 0.05;
            }

            // Tranche 3: 400,001 - 500,000 : 10%
            if (baseImposable > 400000) {
                const tr3 = Math.min(baseImposable, 500000) - 400000;
                irsa += tr3 * 0.10;
            }

            // Tranche 4: 500,001 - 600,000 : 15%
            if (baseImposable > 500000) {
                const tr4 = Math.min(baseImposable, 600000) - 500000;
                irsa += tr4 * 0.15;
            }

            // Tranche 5: > 600,000 : 20%
            if (baseImposable > 600000) {
                const tr5 = baseImposable - 600000;
                irsa += tr5 * 0.20;
            }

            // Net à payer
            const net = brut - cnaps - irsa;

            setFormData(prev => ({
                ...prev,
                cotisationSalariale: formatNumberWithSpaces(cnaps.toFixed(2)),
                cotisationPatronale: formatNumberWithSpaces((brut * 0.13).toFixed(2)),
                retenueSource: formatNumberWithSpaces(irsa.toFixed(2)),
                netAPayer: formatNumberWithSpaces(net.toFixed(2))
            }));
        }
    }, [formData.salaireBrut]);

    // Optional: Auto-calculate Net if needed, but user might want manual control. 
    // We will trust the user input for now as per "manual entry" requirement.

    // Validation & Save
    const handleSubmit = async () => {
        // Basic validation
        const errors = {};
        if (!formData.employe) errors.employe = true;
        if (!formData.numFichePaie) errors.numFichePaie = true;
        if (!formData.periodePaie) errors.periodePaie = true;
        if (!formData.dateEmission) errors.dateEmission = true;
        if (!formData.dateEcheance) errors.dateEcheance = true;
        if (!formData.salaireBrut) errors.salaireBrut = true;
        if (!formData.netAPayer) errors.netAPayer = true;

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Veuillez remplir les champs obligatoires (Employé, N°, Période, Dates, Brut, Net).');
            return;
        }

        const parseAmount = (val) => parseFloat(String(removeSpacesFromNumber(val)).replace(/,/g, '.') || '0');

        const data = {
            piece_type: "Fiche de paie",
            description_json: {
                employee_name: formData.employe,
                payslip_number: formData.numFichePaie,
                payment_period: formData.periodePaie,
                date_emission: formData.dateEmission,
                date_echeance: formData.dateEcheance,

                salaire_brut: parseAmount(formData.salaireBrut),
                total_cotisation_salariale: parseAmount(formData.cotisationSalariale),
                total_cotisation_patronale: parseAmount(formData.cotisationPatronale),
                retenue_source: parseAmount(formData.retenueSource),
                net_a_payer: parseAmount(formData.netAPayer),
            },
            ref_file: formData.numFichePaie,
        };

        setDataToGenerateJournal(data);
        actionSaveFichePaie({ data, project_id: projectId });
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
            toast.error("Erreur lors de l'enregistrement de la fiche de paie.");
        }
    }, [isSuccessSave, isErrorSave, dataSave, actionGenerateJournal, dataToGenerateJournal]);

    useEffect(() => {
        if (isSuccessJournal) {
            toast.success("Enregistrement succès");
            setFormData({
                employe: '', numFichePaie: '', periodePaie: '', dateEmission: getTodayISO(), dateEcheance: '',
                salaireBrut: '', cotisationSalariale: '', cotisationPatronale: '', retenueSource: '', netAPayer: ''
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
                                Saisie Manuelle de Fiche de Paie
                            </h1>
                            <div className="flex-shrink-0 w-[88px]"></div>
                        </div>
                    </div>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto w-full p-3">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                            {/* Card 1: Informations Générales */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    Informations Employé & Paiement
                                </h2>
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Employé</label>
                                        <input type="text" name="employe" value={formData.employe} onChange={handleChange} placeholder="Nom de l'employé" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${validationErrors.employe ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">N° Fiche de Paye</label>
                                            <input type="text" name="numFichePaie" value={formData.numFichePaie} onChange={handleChange} placeholder="ex: PAIE-2025-01" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 ${validationErrors.numFichePaie ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Période de Paiement</label>
                                            <input type="text" name="periodePaie" value={formData.periodePaie} onChange={handleChange} placeholder="ex: Janvier 2025" className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.periodePaie ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date Émission</label>
                                            <input type="date" name="dateEmission" value={formData.dateEmission} onChange={handleChange} className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.dateEmission ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date Échéance</label>
                                            <input type="date" name="dateEcheance" value={formData.dateEcheance} onChange={handleChange} className={`w-full px-2 py-1 text-sm rounded-md focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.dateEcheance ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Détails Financiers */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-t-2 border-gray-300 dark:border-gray-700">
                                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    Détails du Salaire
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 uppercase tracking-wide">Salaire Brut (Ar)</label>
                                        <input type="text" name="salaireBrut" value={formData.salaireBrut} onChange={handleChangeAmount} placeholder="0.00" className={`w-full px-3 py-2 text-base font-semibold rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 ${validationErrors.salaireBrut ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cotisation Salariale</label>
                                            <input type="text" name="cotisationSalariale" value={formData.cotisationSalariale} onChange={handleChangeAmount} placeholder="0.00" className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 text-right" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cotisation Patronale</label>
                                            <input type="text" name="cotisationPatronale" value={formData.cotisationPatronale} onChange={handleChangeAmount} placeholder="0.00" className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 text-right" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Retenue à la source (IRSA)</label>
                                        <input type="text" name="retenueSource" value={formData.retenueSource} onChange={handleChangeAmount} placeholder="0.00" className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 text-right" />
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1 uppercase">Net à Payer (Ar)</label>
                                        <input type="text" name="netAPayer" value={formData.netAPayer} onChange={handleChangeAmount} placeholder="0.00" className={`w-full px-3 py-2 text-lg font-bold rounded-md text-emerald-700 dark:text-emerald-400 text-right bg-emerald-50 dark:bg-emerald-900/20 ${validationErrors.netAPayer ? 'border-2 border-red-500 focus:border-red-500' : 'border border-gray-300 dark:border-gray-600 focus:border-emerald-500'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-2 p-4 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 border-t dark:border-gray-700 rounded-lg shadow-lg">
                            <div className="mb-3 md:mb-0 px-3 py-1 rounded-md font-bold text-base bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                                Net à Payer : {formData.netAPayer ? formatMontant(formData.netAPayer) : '0,00'} Ar
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoadingSave || isLoadingJournal}
                                className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-xl transition duration-200 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                            >
                                {(isLoadingSave || isLoadingJournal) ? (
                                    <>
                                        <ButtonSpinner className="mr-3" />
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

                    </div>
                </div>
            </div>
        </>
    );
}
