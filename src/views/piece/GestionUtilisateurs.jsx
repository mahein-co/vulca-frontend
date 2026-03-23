import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, Edit2, Trash2, UserPlus, Loader, Eye, EyeOff } from 'lucide-react';
import { useGetUsersQuery, useGetAdminCountQuery, useCreateUserByAdminMutation, useUpdateUserMutation, useDeleteUserMutation } from '../../states/user/userApiSlice';
import toast from 'react-hot-toast';
import LoadingOverlay from '../../components/layout/LoadingOverlay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ButtonSpinner from '../../components/ui/ButtonSpinner';

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, userName, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-semibold text-gray-800 dark:text-gray-200">{userName}</span> ? Cette action est irréversible.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        {isDeleting ? (
                            <>
                                <ButtonSpinner />
                                <span>Suppression...</span>
                            </>
                        ) : (
                            "Supprimer"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GestionUtilisateurs = () => {
    // FETCH USERS FROM API
    const { data: users = [], isLoading } = useGetUsersQuery();
    const { data: adminCountData } = useGetAdminCountQuery();
    const adminCount = adminCountData?.admin_count || 0;
    const [createUser, { isLoading: isCreating }] = useCreateUserByAdminMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const { userAuthenticated } = useSelector((state) => state.user);

    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'expert_comptable',
        status: 'Active',
        avatar: null
    });
    const [createFormData, setCreateFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'expert_comptable'
    });
    const [showPassword, setShowPassword] = useState(false);

    // TODO: Implement Update Mutation
    const handleSubmit = async () => {
        if (!editingUser) return;

        try {
            await updateUser({
                id: editingUser.id,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                is_active: formData.status === 'Active'
            }).unwrap();

            toast.success("Utilisateur mis à jour avec succès");
            setShowModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.username || user.name, // Adjust based on API response
            email: user.email,
            role: user.role || 'expert_comptable',
            status: user.is_active ? 'Active' : 'Bloqué', // Adjust based on API boolean
            avatar: user.avatar
        });
        setShowModal(true);
    };

    // TODO: Implement Delete Mutation
    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id).unwrap();
            toast.success("Utilisateur supprimé avec succès");
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error?.data?.error || "Erreur lors de la suppression");
        }
    };

    const handleCreateUser = async () => {
        if (!createFormData.username || !createFormData.name || !createFormData.email || !createFormData.password || !createFormData.role) {
            toast.error("Tous les champs sont requis");
            return;
        }

        if (createFormData.password.length < 8) {
            toast.error("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        try {
            await createUser(createFormData).unwrap();
            toast.success("Utilisateur créé avec succès");
            setShowCreateModal(false);
            setCreateFormData({ username: '', name: '', email: '', password: '', role: 'expert_comptable' });
            setShowPassword(false);
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.error || "Erreur lors de la création");
        }
    };



    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Determine loading message
    let loadingMessage = "";
    if (isLoading) loadingMessage = "Chargement des utilisateurs...";
    else if (isCreating) loadingMessage = "Création en cours...";
    else if (isUpdating) loadingMessage = "Mise à jour en cours...";
    else if (isDeleting) loadingMessage = "Suppression en cours...";

    return (
        <div className="fixed inset-0 pt-14 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {loadingMessage && <LoadingOverlay message={loadingMessage} fullScreen={false} />}
            <div className="flex-grow overflow-y-auto p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestion des Utilisateurs</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Add User Card */}
                        <div
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center min-h-[280px]"
                        >
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center">
                                Ajouter Utilisateur
                            </h3>
                        </div>

                        {/* Liste des utilisateurs */}
                        {users.map(user => (
                            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        disabled={isDeleting}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center pt-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.username || user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-white text-xl font-bold">
                                                {getInitials(user.username || user.name)}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-1">
                                        {user.username || user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 capitalize">
                                        {user.role === 'expert_comptable' ? 'Expert Comptable' : user.role === 'admin' ? 'Administrateur' : 'Expert Comptable'}
                                    </p>

                                    <span className={`${user.is_active ? 'bg-green-500' : 'bg-red-500'} text-white px-5 py-1.5 rounded-full text-sm font-medium shadow-md`}>
                                        {user.is_active ? 'Actif' : 'Bloqué'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Modifier Utilisateur
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Entrez le nom complet"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="exemple@email.com"
                                    />
                                </div>



                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Rôle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        disabled={editingUser?.id === userAuthenticated?.id}
                                        className={`w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all ${editingUser?.id === userAuthenticated?.id ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="admin">Administrateur</option>
                                        <option value="expert_comptable">Expert Comptable</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Statut <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        disabled={editingUser?.id === userAuthenticated?.id}
                                        className={`w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all ${editingUser?.id === userAuthenticated?.id ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="Active">Actif</option>
                                        <option value="Bloqué">Bloqué</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-start pt-3 border-t border-gray-100 dark:border-gray-700 mt-5">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isUpdating}
                                        className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <ButtonSpinner />
                                                <span>Mise à jour...</span>
                                            </>
                                        ) : (
                                            "Enregistrer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    userName={userToDelete?.username || userToDelete?.name || ""}
                    isDeleting={isDeleting}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                />

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Créer Utilisateur
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Nom d'utilisateur <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createFormData.username}
                                        onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Nom d'utilisateur"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createFormData.name}
                                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Entrez le nom complet"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={createFormData.email}
                                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="exemple@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={createFormData.password}
                                            onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                            className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5 focus:outline-none" /> : <Eye className="w-5 h-5 focus:outline-none" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Rôle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={createFormData.role}
                                        onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                                    >
                                        {adminCount < 3 && <option value="admin">Administrateur</option>}
                                        <option value="expert_comptable">Expert Comptable</option>
                                    </select>
                                    {/* Dynamic Admin Quota Message */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {adminCount >= 3 ? (
                                            <span className="text-red-500 font-medium">⚠️ Il y a déjà 3 administrateurs</span>
                                        ) : (
                                            <span>
                                                {3 - adminCount} administrateur{3 - adminCount > 1 ? 's' : ''} {3 - adminCount > 1 ? 'peuvent' : 'peut'} être créé{3 - adminCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-start pt-3 border-t border-gray-100 dark:border-gray-700 mt-5">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleCreateUser}
                                        disabled={isCreating}
                                        className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2 min-w-[100px]"
                                    >
                                        {isCreating ? (
                                            <>
                                                <ButtonSpinner />
                                                <span>Création...</span>
                                            </>
                                        ) : (
                                            "Créer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionUtilisateurs;