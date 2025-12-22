/*import "@fontsource/roboto";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";

function App() {
return (
    <React.Fragment>
    <BrowserRouter>
        <Routes />
        <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
            style: {
            duration: 5000,
            fontSize: "0.85rem",
            borderRadius: "8px",
            padding: "12px 16px",
            background: "#fff",
            },
            success: {
            style: {
                color: "#1f2937",
            },
            },
            error: {
            duration: 6000,
            style: {
                color: "#1f2937",
            },
            },
        }}
        />
    </BrowserRouter>
    </React.Fragment>
);
}

export default App;
*/
/*import "@fontsource/roboto";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";

function App() {
return (
    <React.Fragment>
    <BrowserRouter>
        <Routes />
        <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
            style: {
            duration: 5000,
            fontSize: "0.85rem",
            borderRadius: "8px",
            padding: "12px 16px",
            background: "#fff",
            },
            success: {
            style: {
                color: "#1f2937",
            },
            },
            error: {
            duration: 6000,
            style: {
                color: "#1f2937",
            },
            },
        }}
        />
    </BrowserRouter>
    </React.Fragment>
);
}

export default App;
*/

// Fichier : App.js

// Fichier : App.js

import React, { useState } from 'react';
import { Toaster } from "react-hot-toast";

// --- Imports des composants ---
import Header from './components/header/header';
import Dashboard from './views/dashboard/Dashboard';
import TransactionView from './views/finance/TransactionView';
import GestionPiecesBoard from './views/piece/GestionPiecesBoard';
import ImportFichier from './views/ocr/pages/ImportFichier';
import IndexAddByFormsPage from './views/ocr/pages/IndexAddByFormsPage';

// 🎯 NOUVEL IMPORT : Le formulaire de Bilan
import BilanForm from './views/ocr/forms/BilanForm'; // <--- ASSUREZ-VOUS QUE LE CHEMIN EST CORRECT
import CompteResultatForm from './views/ocr/forms/CompteResultatFormulaire'; // Si vous l'avez
import FactureForm from './views/ocr/forms/FactureForm'; // Si vous l'avez
import BonAchatForm from './views/ocr/forms/BonAchatForm';
import BankForm from './views/ocr/forms/BankForm';
import FichePayeForm from './views/ocr/forms/FichePaye.jsx';

// Composant Simple de Modale (Overlay) 
const SaisieModal = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
        <div
            className="absolute inset-0"
            onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-y-auto">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                aria-label="Fermer"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-3 sm:p-4 md:p-6 h-full">
                {children}
            </div>
        </div>
    </div>
);


function App() {

    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSaisieModalOpen, setIsSaisieModalOpen] = useState(false);
    const [formTypeToOpen, setFormTypeToOpen] = useState(null);

    // --- Fonctions de Gestion de la Modale ---
    const openSaisieModal = (formType) => {
        setFormTypeToOpen(formType);
        setIsSaisieModalOpen(true);
    };

    const closeSaisieModal = () => {
        setIsSaisieModalOpen(false);
        setFormTypeToOpen(null);
        // 🛑 Retourne au dashboard si on était sur l'onglet 'saisie-manuelle'
        if (currentPage === 'saisie-manuelle') {
            setCurrentPage('dashboard');
        }
    };
    const handleGoBackToSaisieMenu = () => {
        // Ramène l'état du contenu de la modale à l'écran du menu de saisie
        setFormTypeToOpen('SaisieMenu');
    };

    // 🎯 FONCTION CRÉÉE ET PASSÉE AU HEADER
    const openSaisieMenuFromHeader = () => {
        openSaisieModal('SaisieMenu'); // Ouvre la modale avec le menu de sélection
    };
    // ------------------------------------------

    const navigate = (page) => {
        setCurrentPage(page);
        // Ferme la modale sauf si on clique à nouveau sur 'saisie-manuelle'
        if (page !== 'saisie-manuelle') {
            closeSaisieModal();
        }
    };

    const renderModalForm = () => {
        switch (formTypeToOpen) {
            case 'bilan':
                // 🎯 CHANGEMENT ICI : Intégration de BilanForm avec les callbacks
                return (
                    <BilanForm
                        onSaisieCompleted={handleGoBackToSaisieMenu}
                        onSaveComplete={closeSaisieModal}
                    />
                );
            case 'compteResultat':
                return <CompteResultatForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={closeSaisieModal}
                />;
            case 'facture':
                return <FactureForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={closeSaisieModal}
                />;
            case 'achat':
                return <BonAchatForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={closeSaisieModal}
                />;
            case 'banque':
                return <BankForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={closeSaisieModal}
                />;
            case 'ficheDePaie':
                return <FichePayeForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={closeSaisieModal}
                />;
            case 'SaisieMenu':
            default:
                // Passe openSaisieModal pour que le menu puisse changer le contenu de la modale
                return <IndexAddByFormsPage onOpenForm={openSaisieModal} />;
        }
    };

    const renderPage = () => {
        // Wrapper par défaut avec padding pour les vues internes qui ne gèrent pas le Header fixe
        const ContentWrapper = ({ children }) => (
            <div className="pt-14 p-4 max-w-full mx-auto">{children}</div>
        );

        switch (currentPage) {
            case 'dashboard':
                return <ContentWrapper><Dashboard /></ContentWrapper>;

            case 'gestion-pieces':
                // Utilise pt-16 pour libérer la place du Header
                return <div className="pt-0"><GestionPiecesBoard /></div>;

            case 'import-ocr':
                return <ImportFichier type="OCR" isFullScreen={true} onSaisieCompleted={() => navigate('dashboard')} />;

            case 'saisie-manuelle':
                // 🛑 Affiche le Dashboard en arrière-plan lorsque la modale est ouverte
                return <ContentWrapper><Dashboard /></ContentWrapper>;

            case 'gestion-salaire':
                return <ContentWrapper><h2 className="text-2xl">Module Gestion Salaires (TODO)</h2></ContentWrapper>;

            case 'gestion-transactions-bilan':
            case 'gestion-transactions-cr':
                // Passer la fonction au composant TransactionView pour qu'il puisse ouvrir la modale si besoin
                return <ContentWrapper><TransactionView onNewSaisieClick={openSaisieMenuFromHeader} viewType={currentPage} /></ContentWrapper>;

            default:
                return <ContentWrapper><Dashboard /></ContentWrapper>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* CORRECTION : Passer la fonction openSaisieMenuFromHeader au Header */}
            <Header
                currentPage={currentPage}
                onNavigate={navigate}
                onOpenSaisieMenu={openSaisieMenuFromHeader} // <--- C'est ici que ça se joue
            />

            <main className="pt-0 min-h-screen">
                {renderPage()}
            </main>

            {/* Affiche la modale si l'état le permet */}
            {isSaisieModalOpen && (
                <SaisieModal onClose={closeSaisieModal}>
                    {renderModalForm()}
                </SaisieModal>
            )}

            {/* ... Toaster ... */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: { duration: 5000, fontSize: "0.85rem", borderRadius: "8px", padding: "12px 16px", background: "#fff" },
                    success: { style: { color: "#1f2937" } },
                    error: { duration: 6000, style: { color: "#1f2937" } },
                }}
            />
        </div>
    );
}

export default App;