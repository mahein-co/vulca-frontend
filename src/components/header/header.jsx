import React, { useState } from 'react';
import { useTheme } from '../../states/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { EditProfileModal, ChangePasswordModal } from './ProfileModals';
import { useGetProfileQuery } from '../../states/user/userApiSlice';
import { URL_IMAGE } from '../../states/constants/constants';

import AccessManagementModal from '../project/AccessManagementModal';
import { useGetPendingRequestsQuery } from '../../states/project/projectApiSlice';
import { useCurrentProjectName } from '../../hooks/useProjectId';

const navItems = [
    { name: 'Pièces comptables', key: 'gestion-pieces', icon: '📝' },
    { name: 'Importer des factures', key: 'import-ocr', icon: '📎' },
    { name: 'Saisie manuelle', key: 'saisie-manuelle', icon: '✍️' },
    { name: 'États financiers', key: 'gestion-transactions-cr', icon: '📦' },
    { name: 'Gestion Utilisateurs', key: 'gestion-user', icon: '👤', adminOnly: true },
    { name: 'Tableau de bord', key: 'dashboard', icon: '📊' },
];

const Header = ({ currentPage, onNavigate, onOpenSaisieMenu, hideNavigation }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const projectName = useCurrentProjectName();

    const [modalOpen, setModalOpen] = useState(null); // 'profile' or 'security'
    const { theme, toggleTheme } = useTheme();

    // Utilisation de la query pour avoir les données temps réel
    const { data: profile } = useGetProfileQuery();
    // Fallback sur localStorage si la query n'est pas encore prête
    const userInfo = profile || JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role === 'admin';

    // Filtrer les items de navigation selon le rôle
    const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

    const isTransactionViewActive = currentPage.startsWith('gestion-transactions-');
    const displayActiveKey = isTransactionViewActive ? 'gestion-transactions-cr' : currentPage;

    const handleNavClick = (key) => {
        setMobileMenuOpen(false);
        if (key === 'saisie-manuelle') {
            onOpenSaisieMenu();
            onNavigate('saisie-manuelle');
        } else {
            onNavigate(key);
        }
    };

    // ... (getInitials and getAvatarSrc)



    const getInitials = (userName) => {
        if (!userName) return 'U';
        const parts = userName.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'U';
        return parts[0][0].toUpperCase();
    };

    const getAvatarSrc = (path) => {
        if (!path || path === "null") return null;
        if (path.startsWith('http')) return path;
        return `${URL_IMAGE}${path}`;
    };

    const [accessModalOpen, setAccessModalOpen] = useState(false);

    // Fetch pending requests for admin notification
    const { data: pendingRequests } = useGetPendingRequestsQuery(undefined, {
        skip: !isAdmin,
    });

    const pendingCount = pendingRequests?.length || 0;

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 w-full z-[10010]">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex items-center h-12 sm:h-14 font-sans justify-between">

                    {/* Left Section: Logo & Desktop Nav */}
                    <div className="flex items-center">
                        <div className="flex items-center flex-shrink-0 mr-4 lg:mr-6">
                            <h1
                                className="text-sm font-bold text-gray-900 dark:text-indigo-400 cursor-pointer not-italic tracking-tight flex items-center"
                                onClick={() => !hideNavigation && handleNavClick('dashboard')}
                            >
                                {hideNavigation ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700/50 shadow-sm flex items-center justify-center">
                                            <img 
                                                src="/rekapy_logo.png" 
                                                alt="Rekapy Logo" 
                                                className="w-full h-full object-contain p-1"
                                                onError={(e) => {
                                                    console.warn("Rekapy logo not found at /assets, trying src import");
                                                    // Fallback will be handled by the component logic if needed
                                                }}
                                            />
                                        </div>
                                        <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-indigo-400">Rekapy</span>
                                    </div>
                                ) : (
                                    <>
                                        {projectName}
                                    </>
                                )}
                            </h1>
                        </div>

                        {!hideNavigation && (
                            <nav className="hidden xl:flex items-center space-x-3 xl:space-x-5">
                                {filteredNavItems.map((item) => {
                                    const isActive = displayActiveKey === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNavClick(item.key)}
                                            className={`flex items-center text-xs font-medium pb-0.5 transition duration-150 whitespace-nowrap not-italic
                                                ${isActive
                                                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-gray-800 dark:border-gray-100 font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                }
                                            `}
                                        >
                                            <span className="text-sm xl:text-base mr-1">{item.icon}</span>
                                            {item.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    {/* Right Section: Mobile Menu & Avatar */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Admin Notification Bell */}
                        {isAdmin && (
                            <button
                                onClick={() => setAccessModalOpen(true)}
                                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Notifications"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {pendingCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800 animate-pulse">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {!hideNavigation && (
                            <button
                                className="xl:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition mr-2"
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
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="relative group transition-transform hover:scale-110 active:scale-95 flex items-center"
                                title="Mon Profil"
                            >
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white overflow-hidden">
                                    {getAvatarSrc(userInfo?.profile_picture) ? (
                                        <img
                                            src={getAvatarSrc(userInfo.profile_picture)}
                                            alt={userInfo.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-base sm:text-lg font-bold">
                                            {getInitials(userInfo?.full_name || userInfo?.name || userInfo?.username)}
                                        </span>
                                    )}
                                </div>
                            </button>

                            <UserProfileDropdown
                                isOpen={profileOpen}
                                onClose={() => setProfileOpen(false)}
                                userInfo={userInfo}
                                onOpenProfile={() => setModalOpen('profile')}
                                onOpenSecurity={() => setModalOpen('security')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal isOpen={modalOpen === 'profile'} onClose={() => setModalOpen(null)} />
            <ChangePasswordModal isOpen={modalOpen === 'security'} onClose={() => setModalOpen(null)} />
            <AccessManagementModal isOpen={accessModalOpen} onClose={() => setAccessModalOpen(false)} />

            {/* Menu Mobile Dropdown */}
            {
                mobileMenuOpen && !hideNavigation && (
                    <div className="xl:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden animate-in slide-in-from-top duration-200">
                        <nav className="px-3 py-3 space-y-1">
                            {filteredNavItems.map((item) => {
                                const isActive = displayActiveKey === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => handleNavClick(item.key)}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition duration-150
                                        ${isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }
                                    `}
                                    >
                                        <span className="text-lg mr-4">{item.icon}</span>
                                        {item.name}
                                    </button>
                                );
                            })}

                            <div className="h-px bg-gray-100 my-2" />

                        </nav>
                    </div>
                )
            }
        </header >
    );
};

export default Header;