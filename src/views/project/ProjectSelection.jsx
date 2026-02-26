import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    useGetProjectsQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useRequestAccessMutation
} from '../../states/project/projectApiSlice';
import { useGetProfileQuery } from '../../states/user/userApiSlice';
import { FaPlus, FaEllipsisV, FaTimes, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ButtonSpinner from '../../components/ui/ButtonSpinner';

// Helper for initials
const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'P';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Dropdown Component for Card
const ProjectCardMenu = ({ project, onDelete, onEdit, isAdmin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAdmin) return null;

    return (
        <div className="absolute top-4 right-4" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Options"
            >
                <FaEllipsisV />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-20 border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(project); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                        <FaEdit className="mr-3 text-blue-500 dark:text-blue-400" /> Modifier
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(project); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                    >
                        <FaTrash className="mr-3" /> Supprimer
                    </button>
                </div>
            )}
        </div>
    );
};

// Modern Delete Modal
const DeleteModal = ({ project, onClose, onConfirm, isDeleting }) => {
    if (!project) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
            {/* Backdrop with blur */}
            <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <FaExclamationTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
                                    Supprimer le projet
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Êtes-vous sûr de vouloir supprimer définitivement le projet <span className="font-bold text-gray-900 dark:text-white">"{project.name}"</span> ?
                                        <br />
                                        Cette action est irréversible et effacera toutes les données associées.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-lg bg-red-600 dark:bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <ButtonSpinner />
                                    <span>Suppression...</span>
                                </div>
                            ) : (
                                'Supprimer définitivement'
                            )}
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-colors"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default function ProjectSelection() {
    const navigate = useNavigate();

    // States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedProject, setSelectedProject] = useState(null); // For edit
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [requestingProjectId, setRequestingProjectId] = useState(null); // Track which project is being requested

    // Delete states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Get user info from localStorage (fallback) and API (source of truth)
    const localUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const { data: userProfile, isLoading: isProfileLoading } = useGetProfileQuery();

    // Merge info, preferring API data
    const userInfo = { ...localUserInfo, ...userProfile };

    // API hooks
    const { data: projects, isLoading: isProjectsLoading, refetch } = useGetProjectsQuery();
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
    const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
    const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
    const [requestAccess, { isLoading: isRequesting }] = useRequestAccessMutation();

    const isLoading = isProjectsLoading || isProfileLoading;

    // Determine if user is global admin based on backend is_admin field
    // The backend correctly sets is_admin based on is_superuser OR role='admin'
    const isGlobalAdmin = React.useMemo(() => {
        // Use is_admin from API (userProfile takes precedence over localStorage)
        return userInfo?.is_admin === true;
    }, [userInfo]);

    // Handlers
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', description: '' });
        setSelectedProject(null);
        setShowModal(true);
    };

    const openEditModal = (project) => {
        setModalMode('edit');
        setFormData({ name: project.name, description: project.description || '' });
        setSelectedProject(project);
        setShowModal(true);
    };

    const openDeleteModal = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await createProject(formData).unwrap();
                toast.success('Projet créé avec succès!');
                // On reste sur la liste pour permettre de créer d'autres projets ou choisir
            } else {
                await updateProject({ id: selectedProject.id, ...formData }).unwrap();
                toast.success('Projet modifié avec succès!');
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error.data?.error || 'Une erreur est survenue');
        }
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProject(projectToDelete.id).unwrap();
            toast.success('Projet supprimé avec succès');
            setShowDeleteModal(false);
            setProjectToDelete(null);
        } catch (error) {
            toast.error(error.data?.error || 'Erreur lors de la suppression');
        }
    };

    const handleSelectProject = (project) => {
        const status = project.access_status;

        // Admin global has always access, regardless of individual status
        if (isGlobalAdmin || status === 'admin' || status === 'approved') {
            const currentProjectId = localStorage.getItem('selectedProjectId');
            const newProjectId = project.id.toString();

            // Store the new project ID and Name
            localStorage.setItem('selectedProjectId', newProjectId);
            localStorage.setItem('selectedProjectName', project.name);

            // ✅ Dispatch custom event to notify components of project change
            // This triggers RTK Query cache invalidation automatically
            window.dispatchEvent(new Event('projectChanged'));

            // Navigate without forcing reload - RTK Query will handle cache
            navigate('/');
        } else if (status === 'pending') {
            toast.info('Votre demande d\'accès est en attente d\'approbation');
        } else {
            // For any other status (null, undefined, etc), request access
            handleRequestAccess(project.id);
        }
    };

    const handleRequestAccess = async (projectId) => {
        try {
            setRequestingProjectId(projectId);
            await requestAccess({ project_id: projectId }).unwrap();
            toast.success('Demande d\'accès envoyée!');
            refetch();
        } catch (error) {
            toast.error(error.data?.error || 'Erreur lors de la demande');
        } finally {
            setRequestingProjectId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
                <LoadingSpinner size="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-outfit">
                        Sélectionner un projet
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                        Gérez vos différents dossiers comptables
                    </p>
                </div>

                {/* Projects Grid with better responsive columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {/* Add Project Card (Global Admin Only) */}
                    {isGlobalAdmin && (
                        <div
                            onClick={openCreateModal}
                            className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer min-h-[240px] sm:min-h-[280px] group"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-200 dark:group-hover:ring-blue-400 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                                <FaPlus className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xl sm:text-2xl transition-colors" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                Nouveau Projet
                            </h3>
                        </div>
                    )}
                    {projects?.map(project => {
                        const status = project.access_status || 'none';
                        const canAccess = isGlobalAdmin || status === 'admin' || status === 'approved';

                        // User can manage project if they are admin ("admin" status)
                        // Note: Only admins/superusers get "admin" access_status via our backend fix
                        const isProjectAdmin = status === 'admin';

                        return (
                            <div
                                key={project.id}
                                onClick={() => canAccess && handleSelectProject(project)}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 transition-all duration-300 p-6 sm:p-8 flex flex-col items-center text-center group border border-gray-100 dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-700
                                    ${canAccess ? 'cursor-pointer hover:-translate-y-1' : ''}
                                `}
                            >
                                <ProjectCardMenu
                                    project={project}
                                    isAdmin={isProjectAdmin}
                                    onDelete={openDeleteModal}
                                    onEdit={openEditModal}
                                />

                                {/* Avatar Circle */}
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-3 flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-sm transition-transform group-hover:rotate-6
                                    ${canAccess ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-200 dark:shadow-blue-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
                                `}>
                                    {getInitials(project.name)}
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 w-full px-2 break-all" title={project.name}>
                                    {project.name}
                                </h3>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 w-full px-2 h-10">
                                    {project.description || 'Aucune description'}
                                </p>

                                {/* Badge */}
                                <div className="mt-auto">
                                    {status === 'pending' && (
                                        <div className="px-5 py-2.5 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-400 rounded-xl text-sm font-semibold shadow-sm w-full text-center">
                                            Demande envoyée
                                        </div>
                                    )}

                                    {status === 'rejected' && (
                                        <div className="flex flex-col gap-3 w-full">
                                            <div className="px-5 py-2.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold shadow-sm text-center">
                                                Demande refusée
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRequestAccess(project.id); }}
                                                disabled={isRequesting}
                                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {isRequesting ? "Envoi..." : "Demander l'accès à nouveau"}
                                            </button>
                                        </div>
                                    )}

                                    {status === 'approved' && !isGlobalAdmin && (
                                        <div className="px-5 py-2.5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold shadow-sm w-full text-center">
                                            Accès Autorisé
                                        </div>
                                    )}

                                    {(status === 'none' || !status) && !isGlobalAdmin && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRequestAccess(project.id); }}
                                            disabled={isRequesting && requestingProjectId === project.id}
                                            className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isRequesting && requestingProjectId === project.id ? (
                                                <ButtonSpinner color="text-gray-400 dark:text-gray-300" />
                                            ) : (
                                                "Demander l'accès"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}


                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 relative">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    {modalMode === 'create' ? 'Nouveau Projet' : 'Modifier le projet'}
                                </h2>

                                <form onSubmit={handleSaveProject}>
                                    <div className="space-y-5">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nom du projet <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none text-gray-900 dark:text-white"
                                                placeholder="Ex: Comptabilité 2026"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none resize-none text-gray-900 dark:text-white"
                                                placeholder="Description optionnelle..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreating || isUpdating}
                                            className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCreating || isUpdating ? (
                                                <>
                                                    <ButtonSpinner />
                                                    <span>Enregistrement...</span>
                                                </>
                                            ) : (
                                                'Enregistrer'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Delete Confirmation Modal */}
                {
                    showDeleteModal && (
                        <DeleteModal
                            project={projectToDelete}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={handleConfirmDelete}
                            isDeleting={isDeleting}
                        />
                    )
                }
            </div >
        </div >
    );
}
