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

import React, { useState, useEffect } from 'react';
import { Toaster } from "react-hot-toast";

// --- Imports des composants ---
import Header from './components/header/header';
import Dashboard from './views/dashboard/Dashboard';
import TransactionView from './views/finance/TransactionView';
import GestionPiecesBoard from './views/piece/GestionPiecesBoard';
import ImportFichier from './views/ocr/pages/ImportFichier';
import IndexAddByFormsPage from './views/ocr/pages/IndexAddByFormsPage';
// --- Import composant chatbot
import IndexChatbotPage from "./views/chat/IndexChatbotPage";
import { useDispatch, useSelector } from "react-redux";
import { actionCloseChat, actionOpenChat } from "./states/chat/chatSlice";
import { FaRobot } from "react-icons/fa";

// 🎯 Import Login Page
// import LoginPage from './LoginPage';

// 🎯 NOUVEL IMPORT : Le formulaire de Bilan
import BilanForm from './views/ocr/forms/BilanForm';
import CompteResultatForm from './views/ocr/forms/CompteResultatFormulaire';
import FactureForm from './views/ocr/forms/FactureForm';
import BonAchatForm from './views/ocr/forms/BonAchatForm';
import BankForm from './views/ocr/forms/BankForm';
import FichePayeForm from './views/ocr/forms/FichePaye.jsx';
import GestionUtilisateurs from './views/piece/GestionUtilisateurs';
import ProjectSelection from './views/project/ProjectSelection';


import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthLayout from "./views/auth/layout/AuthLayout";
import AuthIndexLogin from "./views/auth/pages/AuthIndexLogin";
import AuthIndexRegister from "./views/auth/pages/AuthIndexRegister";
import OTPVerification from "./views/auth/pages/OTPVerification";
import AuthIndexResetPasswordEmail from "./views/auth/pages/AuthIndexResetPasswordEmail";
import OTPResetPassword from "./views/auth/pages/OTPResetPassword";

// Composant Modal pour les formulaires
const FormModal = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
        <div
            className="absolute inset-0"
            onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-y-auto">


            <div className="p-3 sm:p-4 md:p-6 h-full">
                {children}
            </div>
        </div>
    </div>
);




function App() {
    const location = useLocation();

    // Check if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const userInfo = localStorage.getItem('userInfo');
        return !!userInfo;
    });

    const dispatch = useDispatch();
    const isChatModalOpen = useSelector((state) => state.chatbot.isChatModalOpen);

    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem('vulca_current_page') || 'dashboard';
    });

    useEffect(() => {
        localStorage.setItem('vulca_current_page', currentPage);
    }, [currentPage]);

    const [currentFormType, setCurrentFormType] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Check authentication on mount and when localStorage changes
    useEffect(() => {
        const checkAuth = () => {
            const userInfo = localStorage.getItem('userInfo');
            setIsAuthenticated(!!userInfo);
        };

        checkAuth();

        // Listen for storage changes (e.g., login in another tab)
        window.addEventListener('storage', checkAuth);

        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Redirect logic
    useEffect(() => {
        if (isAuthenticated) {
            const selectedProjectId = localStorage.getItem('selectedProjectId');
            const isSelectProjectPage = location.pathname === '/projects';
            const isLegacySelectPage = location.pathname === '/select-project';

            if (isLegacySelectPage) {
                window.location.replace('/projects');
                return;
            }

            // If on auth pages, redirect appropriately
            if (location.pathname.startsWith('/auth')) {
                const targetPath = selectedProjectId ? '/' : '/projects';
                window.location.replace(targetPath);
                return;
            }

            // If no project selected and not on selection page, redirect to selection
            if (!selectedProjectId && !isSelectProjectPage) {
                window.location.replace('/projects');
            }
        }
    }, [isAuthenticated, location.pathname]);
    // ...
    // If not authenticated, show auth routes
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<AuthIndexLogin />} />
                    <Route path="register" element={<AuthIndexRegister />} />
                    <Route path="verify-email/:username" element={<OTPVerification />} />
                    <Route path="reset-password/email" element={<AuthIndexResetPasswordEmail />} />
                    <Route path="otp-reset-password" element={<OTPResetPassword />} />
                    {/* Redirect root to login */}
                    <Route index element={<Navigate to="/auth/login" replace />} />
                </Route>
                {/* Catch all redirect to login */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        );
    }

    // --- Fonctions de Navigation ---
    const openSaisieMenuFromHeader = () => {
        setCurrentPage('saisie-manuelle');
        setCurrentFormType(null);
        setIsFormModalOpen(false);
    };

    const openFormInModal = (formType) => {
        setCurrentFormType(formType);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentFormType(null);
    };

    const handleGoBackToSaisieMenu = () => {
        setIsFormModalOpen(false);
        setCurrentFormType(null);
    };

    const handleSaveComplete = () => {
        setIsFormModalOpen(false);
        setCurrentFormType(null);
    };



    const navigate = (page) => {
        setCurrentPage(page);
        if (page === 'saisie-manuelle') {
            setCurrentFormType(null);
            setIsFormModalOpen(false);
        }
    };

    const renderFormInModal = () => {
        switch (currentFormType) {
            case 'bilan':
                return (
                    <BilanForm
                        onSaisieCompleted={handleGoBackToSaisieMenu}
                        onSaveComplete={handleSaveComplete}
                    />
                );
            case 'compteResultat':
                return <CompteResultatForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={handleSaveComplete}
                />;
            case 'facture':
                return <FactureForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={handleSaveComplete}
                />;
            case 'achat':
                return <BonAchatForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={handleSaveComplete}
                />;
            case 'banque':
                return <BankForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={handleSaveComplete}
                />;
            case 'ficheDePaie':
                return <FichePayeForm
                    onSaisieCompleted={handleGoBackToSaisieMenu}
                    onSaveComplete={handleSaveComplete}
                />;
            default:
                return null;
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
                return <ImportFichier type="OCR" isFullScreen={true} />;

            case 'saisie-manuelle':
                return <div className="pt-14 p-4 max-w-7xl mx-auto"><IndexAddByFormsPage onOpenForm={openFormInModal} /></div>;

            case 'gestion-user':
                return <div className="pt-14"><GestionUtilisateurs /></div>;

            case 'gestion-transactions-bilan':
            case 'gestion-transactions-cr':
                // Passer la fonction au composant TransactionView pour qu'il puisse ouvrir la modale si besoin
                return <ContentWrapper><TransactionView onNewSaisieClick={openSaisieMenuFromHeader} viewType={currentPage} /></ContentWrapper>;

            default:
                return <ContentWrapper><Dashboard /></ContentWrapper>;
        }
    };


    const handleOpenChat = () => dispatch(actionOpenChat());
    const handleCloseChat = () => dispatch(actionCloseChat());

    const isProjectSelection = location.pathname === '/projects';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* CORRECTION : Passer la fonction openSaisieMenuFromHeader au Header */}
            <Header
                currentPage={currentPage}
                onNavigate={navigate}
                onOpenSaisieMenu={openSaisieMenuFromHeader} // <--- C'est ici que ça se joue
                hideNavigation={isProjectSelection}
            />

            <main className="pt-0 min-h-screen">
                {/* Project Selection Route */}
                {isProjectSelection ? (
                    <ProjectSelection />
                ) : (
                    <>
                        {renderPage()}
                        {/* Modal pour les formulaires */}
                        {isFormModalOpen && currentFormType && (
                            <FormModal onClose={closeFormModal}>
                                {renderFormInModal()}
                            </FormModal>
                        )}
                    </>
                )}
            </main>

            {/* ... Toaster ... */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: { duration: 5000, fontSize: "0.85rem", borderRadius: "8px", padding: "12px 16px", background: '#fff', color: '#1f2937' },
                    success: { style: { background: '#ecfdf5', color: '#064e3b' } },
                    error: { duration: 6000, style: { background: '#fef2f2', color: '#7f1d1d' } },
                }}
            />

            {/* CHATBOT BUTTON - Hidden on project selection */}
            {!isProjectSelection && (
                <div className="z-[100]">
                    <button
                        onClick={handleOpenChat}
                        className="fixed right-6 bottom-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
                        aria-label="Ouvrir l'assistant"
                    >
                        <FaRobot size={24} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    </button>
                </div>
            )}

            {/* CHATBOT MODAL */}
            {isChatModalOpen && (
                <IndexChatbotPage close={handleCloseChat} />
            )}
        </div>
    );
}

export default App;