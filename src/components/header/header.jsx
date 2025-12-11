// Fichier : ./components/header/header.jsx

import React from 'react';

// Les éléments de navigation avec les clés correspondant à l'état de App.jsx
// IMPORTANT : Les clés doivent être UNIQUES si vous voulez gérer l'état actif correctement.
const navItems = [
    { name: 'Gestion pièces', key: 'gestion-pieces', icon: '📝' },
    { name: 'Import OCR', key: 'import-ocr', icon: '📎' },
    // Les deux clés ci-dessous pointent vers la même vue 'gestion-transactions',
    // ce qui est source de confusion mais conservé si c'est votre intention.
    { name: 'Bilan', key: 'gestion-transactions-bilan', icon: '⚖️' }, // CLÉ UNIQUE
    { name: 'Compte de Resultat', key: 'gestion-transactions-cr', icon: '📦' }, // CLÉ UNIQUE
    // Si vous voulez une seule entrée pour les deux, utilisez : 
    // { name: 'Comptabilité', key: 'gestion-transactions', icon: '📚' },
    
    { name: 'Gestion salaire', key: 'gestion-salaire', icon: '💲' },
    { name: 'Tableau de bord', key: 'dashboard', icon: '📊' },
];

const Header = ({ currentPage, onNavigate }) => { // Réception des props
    // NOTE : Si vous n'utilisez pas de routeur, il est plus sûr d'utiliser des clés uniques
    // pour que l'état actif (isActive) ne s'allume pas pour deux liens à la fois.
    
    // Détection si la page actuelle est l'une des deux pages qui se cachent derrière TransactionView
    const isTransactionViewActive = currentPage.startsWith('gestion-transactions-');
    const displayActiveKey = isTransactionViewActive ? 'gestion-transactions-cr' : currentPage;

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
            <div className="max-w-full mx-auto px-1 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* Logo et Nom de l'App */}
                    <div className="flex items-center">
                        <h1 
                            className="text-xl font-semibold text-indigo-700 mr-8 cursor-pointer"
                            onClick={() => onNavigate('dashboard')} // Retour au dashboard en cliquant sur le titre
                        >
                            Assistant Comptable
                        </h1>
                    </div>

                    {/* Navigation Centrale (Icônes + Texte) */}
                    <div className="flex items-center space-x-6">
                        {navItems.map((item) => {
                            // CORRECTION : Simplification de la détection de l'état actif
                            const isActive = displayActiveKey === item.key; 

                            return (
                                <button
                                    // CORRECTION : Utiliser item.key comme clé React pour la stabilité
                                    key={item.key} 
                                    // Utilisation de la fonction onNavigate lors du clic
                                    onClick={() => onNavigate(item.key)} 
                                    className={`flex items-center text-sm font-medium pb-2 transition duration-150
                                        ${isActive
                                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' 
                                            : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                                        }
                                    `}
                                >
                                    <span className="text-lg mr-1 hidden sm:inline">{item.icon}</span>
                                    {item.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Profil Utilisateur */}
                    <div className="flex items-center">
                        {/* ... (bouton utilisateur inchangé) */}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;