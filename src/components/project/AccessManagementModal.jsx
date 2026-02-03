import React from 'react';
import { FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useGetPendingRequestsQuery, useManageAccessMutation } from '../../states/project/projectApiSlice';

const AccessManagementModal = ({ isOpen, onClose }) => {
    const { data: requests, isLoading, refetch } = useGetPendingRequestsQuery();
    const [manageAccess, { isLoading: isUpdating }] = useManageAccessMutation();

    const handleAction = async (accessId, action) => {
        try {
            await manageAccess({
                access_id: accessId,
                action: action
            }).unwrap();

            toast.success(action === 'approve' ? 'Accès approuvé!' : 'Accès refusé');
            refetch();
        } catch (error) {
            toast.error(error.data?.error || 'Une erreur est survenue');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                            <FaUser size={20} />
                        </span>
                        Demandes d'accès
                        {requests?.length > 0 && (
                            <span className="ml-3 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {requests.length}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-3 text-gray-500">Chargement...</p>
                        </div>
                    ) : requests && requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between group hover:shadow-md transition-all"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {request.user_name || request.user_email || 'Utilisateur inconnu'}
                                        </p>
                                        <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                                            <span>
                                                Email: {request.user_email}
                                            </span>
                                            <span className="mt-1">
                                                Souhaite accéder au projet :
                                                <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                                                    {request.project_name}
                                                </span>
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Demandé le : {request.requested_at ? new Date(request.requested_at).toLocaleDateString() : 'Date inconnue'}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleAction(request.id, 'approve')}
                                            disabled={isUpdating}
                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                            title="Approuver"
                                        >
                                            <FaCheck size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.id, 'reject')}
                                            disabled={isUpdating}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                            title="Refuser"
                                        >
                                            <FaTimes size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FaUser size={24} className="opacity-50" />
                            </div>
                            <p>Aucune demande d'accès en attente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessManagementModal;
