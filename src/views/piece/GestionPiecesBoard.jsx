import React, { useState, useMemo, useEffect } from 'react';
import { Eye, X, FileText } from 'lucide-react';
import { BASE_URL_API } from '../../constants/globalConstants';

// --- 0. COMPOSANT : Modale de Détails ---
const DetailsModal = ({ isOpen, document, onClose }) => {
    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-start border-b p-6 pb-3 flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">
                        Détails de la pièce
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 pt-4 space-y-3 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-600 uppercase tracking-wider text-[10px]">Origine</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${document.source_type === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {document.source_label}
                        </span>
                    </div>

                    {document.source_type === 'file' ? (
                        <>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Nom du fichier</p>
                                <p className="text-base text-gray-900 font-medium truncate">{document.nom}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Référence</p>
                                <p className="text-base text-gray-900 font-medium">{document.ref || 'N/A'}</p>
                            </div>
                        </>
                    ) : (
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Référence</p>
                            <p className="text-base text-gray-900 font-medium">{document.ref || document.nom}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Type</p>
                            <p className="text-base text-gray-900">{document.piece_type}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Date</p>
                            <p className="text-base text-gray-900">{document.date || 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                                {document.description || 'Aucune description disponible'}
                            </pre>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const TYPE_STYLES = {
    'Facture': { color: 'border-blue-500', badge: 'bg-blue-500', bgCard: 'bg-white' },
    'Bon d\'achat': { color: 'border-yellow-500', badge: 'bg-yellow-500', bgCard: 'bg-yellow-50' },
    'Relevé bancaire': { color: 'border-purple-500', badge: 'bg-purple-500', bgCard: 'bg-purple-50' },
    'Virement bancaire': { color: 'border-indigo-500', badge: 'bg-indigo-500', bgCard: 'bg-indigo-50' },
    'Fiche de paie': { color: 'border-green-500', badge: 'bg-green-500', bgCard: 'bg-green-50' },
    'Autres': { color: 'border-orange-500', badge: 'bg-orange-500', bgCard: 'bg-orange-50' },
};

const COLUMNS = [
    {
        key: 'compta',
        label: 'Factures & Achats',
        types: ['Facture', 'Bon d\'achat'],
        badge: 'bg-blue-600'
    },
    {
        key: 'banque',
        label: 'Banque',
        types: ['Relevé bancaire', 'Virement bancaire'],
        badge: 'bg-purple-600'
    },
    {
        key: 'rh',
        label: 'Fiches de paie',
        types: ['Fiche de paie'],
        badge: 'bg-green-500'
    },
    {
        key: 'autres',
        label: 'Autres',
        types: ['Autres'],
        badge: 'bg-orange-500'
    },
];

// --- 2. COMPOSANT : Carte de Document ---
const DocumentCard = ({ piece, onClick, onViewDetails }) => {
    const style = TYPE_STYLES[piece.piece_type] || TYPE_STYLES['Autres'];
    const borderColor = style.color;
    const cardBgColor = style.bgCard;

    const handleViewClick = (e) => {
        e.stopPropagation();
        onViewDetails(piece);
    };

    return (
        <div
            className={`${cardBgColor} p-3 mb-3 rounded-xl shadow-sm border-l-4 hover:shadow-md cursor-pointer transition duration-150 ${borderColor} relative group`}
            onClick={() => onClick(piece)}
        >
            <div className="flex items-start space-x-3 mb-2">
                <span className="text-sm pt-1 text-blue-600 flex-shrink-0">
                    <FileText size={18} />
                </span>

                <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate pr-8" title={piece.nom}>
                        {piece.nom}
                    </p>
                    <div className="flex items-center mt-0.5 space-x-2">
                        <span className={`text-[9px] uppercase tracking-wider text-white font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                            {piece.piece_type}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleViewClick}
                    className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition duration-150 focus:outline-none"
                    aria-label={`Voir détails ${piece.nom}`}
                >
                    <Eye size={16} />
                </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex items-center text-[11px] text-gray-500 overflow-hidden">
                    <>
                        <span className="font-semibold mr-1 flex-shrink-0">Ref:</span>
                        <span className="truncate">{piece.ref || '---'}</span>
                    </>
                </div>
                <div className="text-[11px] text-gray-400 whitespace-nowrap ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                    {piece.date || '---'}
                </div>
            </div>
        </div>
    );
};

// --- 3. COMPOSANT PRINCIPAL ---
export default function GestionPiecesBoard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recherche, setRecherche] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [dateDebut, setDateDebut] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split('T')[0];
    });
    const [dateFin, setDateFin] = useState(() => new Date().toISOString().split('T')[0]);

    // Charger les données depuis l'API
    useEffect(() => {
        const fetchPieces = async () => {
            try {
                setLoading(true);
                console.log(`Fetching pieces from ${BASE_URL_API}/pieceslist/ ...`);
                const response = await fetch(`${BASE_URL_API}/pieceslist/`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                console.log("Data received:", data);

                if (data.status === 'success') {
                    setDocuments(data.pieces);
                } else {
                    console.error("API returned success:false", data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des pièces:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPieces();
    }, []);

    const handleDocumentClick = (piece) => {
        setSelectedDocument(piece);
        setIsModalOpen(true);
    };

    const handleViewDetails = (document) => {
        setSelectedDocument(document);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDocument(null);
    };

    const groupedDocuments = useMemo(() => {
        const documentsFiltres = documents.filter(piece => {
            const matchesRecherche = piece.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                (piece.ref && piece.ref.toLowerCase().includes(recherche.toLowerCase()));

            const pieceDate = piece.date;
            // Si la pièce n'a pas de date, on décide si on l'affiche ou pas. 
            // Ici on l'affiche si aucune borne n'est définie, ou si on veut être strict on l'exclut.
            const matchesDate = (!dateDebut || (pieceDate && pieceDate >= dateDebut)) &&
                (!dateFin || (pieceDate && pieceDate <= dateFin));

            return matchesRecherche && matchesDate;
        });

        return documentsFiltres.reduce((acc, piece) => {
            const pieceType = piece.piece_type;
            const column = COLUMNS.find(col => col.types.includes(pieceType)) || COLUMNS[COLUMNS.length - 1];
            const key = column.key;

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(piece);
            return acc;
        }, {});
    }, [documents, recherche, dateDebut, dateFin]);

    return (
        <div className="relative pt-14 pb-6 h-screen bg-gray-50 overflow-hidden flex flex-col">
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="flex flex-col items-center max-w-sm w-full text-center">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-gray-800 animate-pulse px-4">Chargement des pièces...</p>
                    </div>
                </div>
            )}

            <div className="px-6 space-y-4 flex-shrink-0">

                {/* 1. PÉRIODE D'EXERCICE - Style Dashboard */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-3 sm:p-4 rounded-lg shadow-md border-t-2 border-gray-300">
                    <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-gray-800 flex items-center">
                            Période d'exercice
                        </p>
                        <p className="text-xs text-gray-500">Sélectionnez la période à analyser</p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm">
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-600 text-xs sm:text-sm">Du</label>
                            <input
                                type="date"
                                value={dateDebut}
                                className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                                onChange={(e) => setDateDebut(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-600 text-xs sm:text-sm">Au</label>
                            <input
                                type="date"
                                value={dateFin}
                                className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                                onChange={(e) => setDateFin(e.target.value)}
                            />
                        </div>
                        <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-900 font-medium shadow-sm transition-all">
                            {dateDebut && dateFin ? `${new Date(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : "Sélectionnez une période"}
                        </button>
                    </div>
                </div>

                {/* 2. BARRE DE RECHERCHE */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Ref, nom du fichier"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            className="w-full p-2 border-0 focus:ring-0 text-sm placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* 3. ZONE DE COLONNES (Workflow) */}
            <div className="flex-1 overflow-hidden px-4 md:px-6 pt-4">
                <div className="flex flex-col space-y-6 lg:flex-row lg:space-x-4 lg:space-y-0 items-stretch h-full overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto pb-6">
                    {COLUMNS.map((column) => {
                        const pieces = groupedDocuments[column.key] || [];
                        const piecesCount = pieces.length;

                        return (
                            <div
                                key={column.key}
                                className="flex-shrink-0 w-full lg:w-[350px] bg-gray-100/50 rounded-2xl p-4 flex flex-col h-auto lg:h-full border border-gray-200/60"
                            >
                                <div className={`flex items-center justify-between pb-3 mb-4 border-b border-gray-200 flex-shrink-0`}>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">{column.label}</h3>
                                    <span className={`text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm ${column.badge}`}>
                                        {piecesCount}
                                    </span>
                                </div>

                                <div className="flex-grow overflow-y-auto pr-1">
                                    {piecesCount > 0 ? (
                                        pieces.map(piece => (
                                            <DocumentCard
                                                key={piece.id}
                                                piece={piece}
                                                onClick={handleDocumentClick}
                                                onViewDetails={handleViewDetails}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-8">
                                            Aucune pièce.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODALE */}
            <DetailsModal
                isOpen={isModalOpen}
                document={selectedDocument}
                onClose={closeModal}
            />
        </div>
    );
}