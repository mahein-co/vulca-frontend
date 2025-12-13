import React, { useState } from 'react';

const navItems = [
    { name: 'Pièces comptables', key: 'gestion-pieces', icon: '📝' },
    { name: 'Importation OCR', key: 'import-ocr', icon: '📎' },
    { name: 'Saisie manuelle', key: 'saisie-manuelle', icon: '✍️' },
    { name: 'États financiers', key: 'gestion-transactions-cr', icon: '📦' },
    { name: 'Gestion salaire', key: 'gestion-salaire', icon: '💲' },
    { name: 'Tableau de bord', key: 'dashboard', icon: '📊' },
];

// Ajout de la prop onOpenSaisieMenu
const Header = ({ currentPage, onNavigate, onOpenSaisieMenu }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Détermine la clé active pour l'affichage (gère le cas des transactions qui sont groupées)
    const isTransactionViewActive = currentPage.startsWith('gestion-transactions-');
    
    // Si la page est 'gestion-transactions-...' elle active 'États financiers'
    const displayActiveKey = isTransactionViewActive ? 'gestion-transactions-cr' : currentPage; 

    const handleNavClick = (key) => {
        setMobileMenuOpen(false); // Fermer le menu mobile après navigation

        if (key === 'saisie-manuelle') {
            // 🛑 L'action pour 'Saisie manuelle' est d'ouvrir la modale.
            onOpenSaisieMenu();
            // On navigue aussi pour que l'onglet 'Saisie manuelle' s'active visuellement
            onNavigate('saisie-manuelle'); 
        } else {
            // Pour toutes les autres pages, on navigue normalement
            onNavigate(key);
        }
    };

    return (
        <header className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 w-full z-30">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex items-center h-14 sm:h-16">
                    
                    {/* Logo - Style italique bleu */}
                    <div className="flex items-center flex-shrink-0 mr-6 lg:mr-8">
                        <h1 
                            className="text-lg sm:text-xl lg:text-2xl font-bold italic text-indigo-600 cursor-pointer"
                            onClick={() => handleNavClick('dashboard')}
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            Assistant Comptable
                        </h1>
                    </div>

                    {/* Navigation Desktop - Centrée */}
                    <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-grow justify-center">
                        {navItems.map((item) => {
                            const isActive = displayActiveKey === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleNavClick(item.key)}
                                    className={`flex items-center text-xs xl:text-sm font-medium pb-1 transition duration-150 whitespace-nowrap
                                        ${isActive
                                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' 
                                            : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <span className="text-base xl:text-lg mr-1">{item.icon}</span>
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bouton Menu Hamburger - Visible sur mobile/tablette */}
                    <button
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition ml-auto"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Menu Mobile Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
                    <nav className="px-3 py-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = displayActiveKey === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleNavClick(item.key)}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition duration-150
                                        ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 font-bold' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <span className="text-lg mr-3">{item.icon}</span>
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;