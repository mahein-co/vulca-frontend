import React from "react";
import { 
    ScaleIcon,         
    CalculatorIcon,   
    DocumentTextIcon, 
    ShoppingCartIcon, 
    BanknotesIcon,
    ReceiptPercentIcon, 
} from '@heroicons/react/24/outline'; 

const FORM_TYPES = {
    bilan: 'bilan',
    compteResultat: 'compteResultat',
    facture: 'facture',
    achat: 'achat',
    banque: 'banque',
    ficheDePaie: 'ficheDePaie',
};

// Structure de données (inchangée)
const formSections = [
    {
        title: 'États Financiers Synthétiques',
        forms: [
            // Section 1 : 2 formulaires
            { type: FORM_TYPES.bilan, name: 'Bilan', description: 'Actif et passif de l\'entreprise à une date donnée.', icon: ScaleIcon, color: 'blue' },
            { type: FORM_TYPES.compteResultat, name: 'Compte de Résultat', description: 'Charges et produits pour déterminer le résultat net de l\'exercice.', icon: CalculatorIcon, color: 'green' },
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

    const handleFormClick = (formType) => {
        onOpenForm(formType); 
    };

    const colorClasses = {
        blue: { text: 'text-blue-600', hoverBorder: 'hover:border-blue-500', ring: 'focus:ring-blue-500', lightBg: 'bg-blue-50' },
        green: { text: 'text-green-600', hoverBorder: 'hover:border-green-500', ring: 'focus:ring-green-500', lightBg: 'bg-green-50' },
        indigo: { text: 'text-indigo-600', hoverBorder: 'hover:border-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-50' },
        orange: { text: 'text-orange-600', hoverBorder: 'hover:border-orange-500', ring: 'focus:ring-orange-500', lightBg: 'bg-orange-50' },
        red: { text: 'text-red-600', hoverBorder: 'hover:border-red-500', ring: 'focus:ring-red-500', lightBg: 'bg-red-50' },
        purple: { text: 'text-purple-600', hoverBorder: 'hover:border-purple-500', ring: 'focus:ring-purple-500', lightBg: 'bg-purple-50' },
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-full"> 
            

            {formSections.map((section, sectionIndex) => {
                const lgGridCols = section.forms.length <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-4';

                return (
                    <div 
                        key={sectionIndex} 
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">
                            {section.title}
                        </h2>
                        
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgGridCols} gap-3 sm:gap-4`}>
                            {section.forms.map((form) => {
                                const colors = colorClasses[form.color];
                                const Icon = form.icon;

                                return (
                                    <button
                                        key={form.type}
                                        onClick={() => handleFormClick(form.type)}
                                        className={`group relative flex flex-col items-start p-4 rounded-xl border-2 border-gray-200 bg-white shadow-sm 
                                                   transition-all duration-300 transform hover:shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 ${colors.hoverBorder} ${colors.ring}`}
                                    >
                                        <div className={`p-2 rounded-lg ${colors.lightBg} mb-2 transition-all duration-300 group-hover:shadow-sm`}>
                                            <Icon className={`w-6 h-6 ${colors.text} transition-transform duration-300 group-hover:scale-105`} />
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1"> 
                                            {form.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 text-left flex-grow"> 
                                            {form.description}
                                        </p>
                                        
                                        <span 
                                            className={`absolute bottom-3 right-3 p-0.5 rounded-full 
                                                        text-gray-800 bg-gray-200 
                                                        group-hover:text-white group-hover:${colors.text.replace('text-', 'bg-')} transition-all duration-300`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.47a.75.75 0 011.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l4.158-3.92H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            
            <div className="h-6"></div>
        </div>
    );
}