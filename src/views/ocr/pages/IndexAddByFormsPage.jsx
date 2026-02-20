import React, { useState } from "react";
import {
    ScaleIcon,
    CalculatorIcon,
    DocumentTextIcon,
    ShoppingCartIcon,
    BanknotesIcon,
    ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import ImportExcel from './ImportExcel';

const FORM_TYPES = {
    bilan: 'bilan',
    compteResultat: 'compteResultat',
    facture: 'facture',
    achat: 'achat',
    banque: 'banque',
    ficheDePaie: 'ficheDePaie',
    importExcel: 'importExcel',
};

// Structure de données (inchangée)
const formSections = [
    {
        title: 'États Financiers Synthétiques',
        forms: [
            // Section 1 : 3 formulaires
            { type: FORM_TYPES.bilan, name: 'Bilan', description: 'Actif et passif de l\'entreprise à une date donnée.', icon: ScaleIcon, color: 'blue' },
            { type: FORM_TYPES.compteResultat, name: 'Compte de Résultat', description: 'Charges et produits pour déterminer le résultat net de l\'exercice.', icon: CalculatorIcon, color: 'green' },
            { type: FORM_TYPES.importExcel, name: 'Importation par IA', description: 'Importer des états financiers via Excel ou CSV.', icon: DocumentTextIcon, color: 'indigo' },
        ],
    },
    {
        title: 'Documents de Base & Flux',
        forms: [
            // Section 2 : 4 formulaires
            { type: FORM_TYPES.facture, name: 'Facture Client/Fournisseur', description: 'Enregistrement détaillé d\'une facture d\'achat ou de vente.', icon: DocumentTextIcon, color: 'indigo' },
            { type: FORM_TYPES.achat, name: 'Bon d\'Achat/Réception', description: 'Saisie d\'un document d\'achat ou de réception sans détail comptable complet.', icon: ShoppingCartIcon, color: 'orange' },
            { type: FORM_TYPES.ficheDePaie, name: 'Fiche de Paie / Salaire', description: 'Enregistrement des charges sociales, salaires nets et bruts.', icon: ReceiptPercentIcon, color: 'purple' },
            { type: FORM_TYPES.banque, name: 'Relevé Bancaire', description: 'Enregistrement manuel des mouvements de trésorerie (dépenses, encaissements).', icon: BanknotesIcon, color: 'red' },
        ],
    },
];

export default function IndexAddByFormsPage({ onOpenForm }) {
    const [showExcelImport, setShowExcelImport] = useState(false);

    const handleFormClick = (formType) => {
        if (formType === FORM_TYPES.importExcel) {
            setShowExcelImport(true);
            return;
        }
        onOpenForm(formType);
    };

    const handleExcelImportComplete = () => {
        console.log('Import Excel terminé');
        setShowExcelImport(false);
        // Optionnel: rafraîchir les données, afficher un message, etc.
    };

    // --- Composant local : ImportExcelInline ---
    function ImportExcelInline({ onFilesSelected }) {
        // Simple UI: centered button + drop area. On select/drop -> call onImported()
        const inputRef = React.useRef(null);
        const [isDragActive, setIsDragActive] = useState(false);

        const openFilePicker = () => {
            if (inputRef.current) inputRef.current.click();
        };

        const handleFilesChosen = (e) => {
            const files = (e.target && e.target.files) || e;
            if (!files || files.length === 0) return;
            // stocker les fichiers en attente de validation
            if (onFilesSelected) onFilesSelected(files);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            setIsDragActive(false);
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesChosen(e.dataTransfer.files);
            }
        };

        return (
            <div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={(e) => handleFilesChosen(e.target.files)}
                    className="hidden"
                    multiple
                />

                <div
                    onClick={openFilePicker}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                    onDragLeave={() => setIsDragActive(false)}
                    className={`cursor-pointer select-none rounded-lg border-2 border-dashed p-16 flex flex-col items-center justify-center text-center ${isDragActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'}`}
                >
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <div className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">Importation par IA (Excel / CSV)</div>
                    <div className="text-sm text-gray-500 mt-2 text-center">ou glissez-déposez ici</div>
                </div>
            </div>
        );
    }

    const colorClasses = {
        blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800', hoverBorder: 'group-hover:border-blue-300 dark:group-hover:border-blue-600', hoverBg: 'group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10' },
        green: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800', hoverBorder: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-600', hoverBg: 'group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10' },
        indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800', hoverBorder: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-600', hoverBg: 'group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10' },
        orange: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800', hoverBorder: 'group-hover:border-orange-300 dark:group-hover:border-orange-600', hoverBg: 'group-hover:bg-orange-50/50 dark:group-hover:bg-orange-900/10' },
        red: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-800', hoverBorder: 'group-hover:border-rose-300 dark:group-hover:border-rose-600', hoverBg: 'group-hover:bg-rose-50/50 dark:group-hover:bg-rose-900/10' },
        purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-800', hoverBorder: 'group-hover:border-purple-300 dark:group-hover:border-purple-600', hoverBg: 'group-hover:bg-purple-50/50 dark:group-hover:bg-purple-900/10' },
    };

    return (
        <div className="p-4 sm:p-5 lg:p-6 w-full mx-auto space-y-5">

            <div className={`transition-all duration-300 ${showExcelImport ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>

                <div className="text-center mb-5">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Saisie Manuelle</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sélectionnez le type de document ou d'état financier à saisir.</p>
                </div>

                {
                    formSections.map((section, sectionIndex) => {
                        const lgGridCols = section.forms.length <= 2 ? 'lg:grid-cols-2' : (section.forms.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4');

                        return (
                            <div key={sectionIndex} className="space-y-3">
                                <div className="flex items-center space-x-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
                                    <div className="h-3 w-1 bg-indigo-500 rounded-full"></div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgGridCols} gap-4`}>
                                    {section.forms.map((form) => {
                                        const colors = colorClasses[form.color];
                                        const Icon = form.icon;

                                        return (
                                            <button
                                                key={form.type}
                                                onClick={() => handleFormClick(form.type)}
                                                className={`group relative flex flex-col p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left h-full ${colors.border} ${colors.hoverBorder} ${colors.hoverBg}`}
                                            >
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300 ${colors.bg} ${colors.text}`}>
                                                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                                                </div>

                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                                                    {form.name}
                                                </h4>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-grow">
                                                    {form.description}
                                                </p>

                                                <div className={`flex items-center text-xs font-semibold ${colors.text} opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300`}>
                                                    Commencer
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform">
                                                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.47a.75.75 0 011.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l4.158-3.92H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                }

            </div>

            {/* Importation Excel */}
            {showExcelImport && (
                <ImportExcel
                    onSaisieCompleted={handleExcelImportComplete}
                />
            )}

            <div className="h-2"></div>
        </div >
    );
}