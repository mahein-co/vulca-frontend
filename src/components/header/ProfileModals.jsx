import React, { useState, useEffect } from 'react';
import { X, User, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useUpdateProfileMutation, useChangePasswordMutation, useGetProfileQuery } from '../../states/user/userApiSlice';
import toast from 'react-hot-toast';

export const EditProfileModal = ({ isOpen, onClose }) => {
    const { data: profile, isLoading: isFetching } = useGetProfileQuery(undefined, { skip: !isOpen });
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [name, setName] = useState('');

    useEffect(() => {
        if (profile) {
            setName(profile.full_name || profile.name || '');
        }
    }, [profile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateProfile({ name }).unwrap();
            const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            localStorage.setItem('userInfo', JSON.stringify({
                ...currentUserInfo,
                full_name: updatedUser.full_name,
                name: updatedUser.name
            }));
            toast.success("Nom mis à jour !");
            onClose();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl z-[151] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Modifier le profil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase ml-1">Nom complet</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isFetching}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder={isFetching ? "Chargement..." : "Votre nom"}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                    >
                        {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [changePassword, { isLoading: isUpdating }] = useChangePasswordMutation();
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            return toast.error("Les mots de passe ne correspondent pas.");
        }
        if (passwords.new_password.length < 8) {
            return toast.error("Le mot de passe doit faire au moins 8 caractères.");
        }
        try {
            await changePassword(passwords).unwrap();
            toast.success("Mot de passe modifié !");
            setPasswords({ old_password: '', new_password: '', confirm_password: '' });
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Erreur lors du changement.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl z-[151] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Sécurité
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase ml-1">Ancien mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPasswords.old ? "text" : "password"}
                                required
                                value={passwords.old_password}
                                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:focus:bg-gray-900 transition-all text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('old')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase ml-1">Nouveau mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                required
                                value={passwords.new_password}
                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:focus:bg-gray-900 transition-all text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase ml-1">Confirmer</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                required
                                value={passwords.confirm_password}
                                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:focus:bg-gray-900 transition-all text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-4 bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 mt-4"
                    >
                        {isUpdating ? "Mise à jour..." : "Mettre à jour la sécurité"}
                    </button>
                </form>
            </div>
        </div>
    );
};
