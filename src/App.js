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

import React, { useState } from 'react';
import Header from './components/header/header';
import Dashboard from './views/dashboard/Dashboard';
import TransactionView from './views/finance/TransactionView';
import CompteResultatForm from './views/ocr/forms/CompteResultatFormulaire'; 
import GestionPiecesBoard from './views/piece/GestionPiecesBoard';

// --- IMPORT DU COMPOSANT D'IMPORTATION OCR ---
import ImportFichier from './views/ocr/pages/ImportFichier';
const NewInvoiceForm = ImportFichier; // Alias pour réutilisation dans la modale
// ---------------------------------------------


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
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 z-10 p-2 bg-white rounded-full shadow-lg"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {children}
        </div>
    </div>
);


function App() {
    
    const [currentPage, setCurrentPage] = useState('gestion-pieces'); // Démarrage sur la vue des pièces
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
    };
    // ------------------------------------------

    const navigate = (page) => {
        setCurrentPage(page);
        closeSaisieModal(); 
    };

    const renderPage = () => {
        // Wrapper pour les vues simples
        const ContentWrapper = ({ children }) => (
            <div className="p-6 max-w-full mx-auto">{children}</div>
        );
        
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
                
            case 'gestion-pieces':
                return <GestionPiecesBoard />;
                
            // L'importation OCR prend tout l'espace de la fenêtre principale
            case 'import-ocr':
                return <ImportFichier type="OCR" isFullScreen={true} onSaisieCompleted={() => navigate('gestion-pieces')} />;
                
            case 'gestion-salaire':
                return <ContentWrapper><h2 className="text-2xl">Module Gestion Salaires</h2></ContentWrapper>; 
            
            case 'gestion-transactions-bilan':
            case 'gestion-transactions-cr':
                return <TransactionView onNewSaisieClick={() => openSaisieModal('SaisieMenu')} viewType={currentPage} />; 
            
            default:
                return <Dashboard />;
        }
    };
    
    // --- Fonction pour déterminer le formulaire à rendre dans la modale ---
    const renderFormInModal = () => {
        const onFormCompleted = closeSaisieModal; 

        switch (formTypeToOpen) {
            case 'CompteResultat':
                return <CompteResultatForm onSaisieCompleted={onFormCompleted} />;
            case 'Vente':
                return <NewInvoiceForm type="Vente" onSaisieCompleted={onFormCompleted} />;
            case 'Achat':
                return <NewInvoiceForm type="Achat" onSaisieCompleted={onFormCompleted} />;

            case 'SaisieMenu':
                // Menu de sélection de saisie (basé sur Capture d'écran 2025-12-11 022007.png)
                return (
                    <div className="p-8 h-full flex flex-col justify-center items-center">
                        <h2 className="text-3xl font-serif font-bold italic mb-10 text-gray-800">Sélectionnez le type de saisie</h2>
                        <div className="space-y-4 w-full max-w-md">
                            <button 
                                className="w-full p-4 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center text-lg"
                                onClick={() => openSaisieModal('Vente')}
                            >
                                📝 Facture de Vente
                            </button>
                            <button 
                                className="w-full p-4 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition flex items-center justify-center text-lg"
                                onClick={() => openSaisieModal('Achat')}
                            >
                                📝 Facture d'Achat
                            </button>
                            <button 
                                className="w-full p-4 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition flex items-center justify-center text-lg"
                                onClick={() => openSaisieModal('CompteResultat')}
                            >
                                📝 Ligne de Compte de Résultat
                            </button>
                        </div>
                    </div>
                );

            default:
                return <div>Sélectionnez un formulaire.</div>;
        }
    };
    

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                currentPage={currentPage} 
                onNavigate={navigate} 
            />
            
            {/* pt-0 s'assure qu'il n'y a pas de marge supplémentaire entre le Header et le contenu */}
            <main className="pt-0"> 
                {renderPage()}
            </main>

            {/* Affichage Conditionnel de la Modale */}
            {isSaisieModalOpen && formTypeToOpen && ( 
                <SaisieModal onClose={closeSaisieModal}>
                    {renderFormInModal()} 
                </SaisieModal>
            )}
        </div>
    );
}

export default App;