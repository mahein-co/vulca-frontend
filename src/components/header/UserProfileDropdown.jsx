import React, { useRef, useEffect } from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { URL_IMAGE } from '../../states/constants/constants';

const UserProfileDropdown = ({ isOpen, onClose, userInfo, onOpenProfile, onOpenSecurity }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('vulca_current_page');
        window.location.href = '/';
    };

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

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-[28px] shadow-2xl z-[110] overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header Section */}
            <div className="p-5 flex flex-col items-center bg-gray-50 dark:bg-gray-900/50 mx-2 mt-2 rounded-[24px]">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 overflow-hidden mb-3">
                    {getAvatarSrc(userInfo?.profile_picture) ? (
                        <img
                            src={getAvatarSrc(userInfo.profile_picture)}
                            alt={userInfo.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-white text-3xl font-bold">
                            {getInitials(userInfo?.full_name || userInfo?.name || userInfo?.username)}
                        </span>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                        {userInfo?.full_name || userInfo?.name || userInfo?.username}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[220px]">
                        {userInfo?.email}
                    </p>
                </div>
            </div>

            {/* Actions Menu */}
            <div className="px-2 py-4 space-y-1">
                <button
                    onClick={() => { onOpenProfile(); onClose(); }}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                    <User className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    Modifier le profil
                </button>
                <button
                    onClick={() => { onOpenSecurity(); onClose(); }}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-[13px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                    <Shield className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    Sécurité & Mot de passe
                </button>

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                    <LogOut className="w-4 h-4 mr-3 text-red-400 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    Déconnexion
                </button>
            </div>

            {/* Footer-like info */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 flex justify-center border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                    {userInfo?.role || 'Utilisateur'}
                </p>
            </div>
        </div>
    );
};

export default UserProfileDropdown;
