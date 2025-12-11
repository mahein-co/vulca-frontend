// Fichier : ImportFactureClient.jsx (Interface d'Importation/Vérification OCR)

import React, { useState } from 'react';

// Composant Simulé pour l'affichage du PDF ou de l'Image
const DocumentViewer = ({ fileName, isLoaded }) => (
    <div className={`bg-gray-100 border border-dashed rounded-lg flex items-center justify-center p-6 h-full min-h-[500px] transition duration-300 ${isLoaded ? 'border-blue-300' : 'border-gray-300'}`}>
        {isLoaded ? (
            <div className="text-center">
                <p className="text-sm font-semibold text-blue-700">Pièce jointe chargée :</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{fileName}</p>
                {/* Simulation de l'affichage du document */}
                <div className="mt-4 text-gray-500">
                    <p>-- Aperçu du document ici --</p>
                    <p>(PDF/Image pour vérification OCR)</p>
                </div>
            </div>
        ) : (
            <div className="text-center">
                <span className="text-gray-500">
                    Déposer ici ou <button className="text-blue-600 font-medium hover:text-blue-700">Ajouter</button>
                </span>
            </div>
        )}
    </div>
);

// Composant Principal
export default function ImportFichier() {
    // État Simulé pour le chargement d'un fichier (correspondant aux images 10.jpg et 11.png)
    const [documentLoaded, setDocumentLoaded] = useState(true); // Passez à 'true' pour simuler le fichier chargé (10.jpg)
    const [fileName] = useState('facture_santatra.png'); 

    // États Simules pour les données OCR (basé sur 10.jpg)
    const [montant, setMontant] = useState('5880000');
    const [totalHT, setTotalHT] = useState('4900000');
    const [client, setClient] = useState('Santatra client');
    const [numeroFacture, setNumeroFacture] = useState('FAC-2024-128');


    const handleValider = () => {
        console.log('Facture validée et enregistrée !', { montant, totalHT, numeroFacture });
        // Logique d'enregistrement ici
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Importation de facture client
            </h2>

            {/* CONTENEUR PRINCIPAL : DOCUMENT (GAUCHE) et FORMULAIRE (DROITE) */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* BLOC GAUCHE : VISUALISATION DE LA PIÈCE JOINTE */}
                <div className="lg:w-1/2">
                    <DocumentViewer fileName={fileName} isLoaded={documentLoaded} />
                </div>

                {/* BLOC DROIT : FORMULAIRE OCR ET CONTRÔLES */}
                <div className="lg:w-1/2">
                    <div className="bg-white p-6 rounded-xl shadow-lg">

                        {/* Note Justificative */}
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 mb-4">
                            un justificatif est un document qui prouve la réalité de cette transaction (facture, reçu/ticket de caisses, etc.)
                        </div>
                        
                        {/* Champ Montant */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Montant</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 text-sm">Ar</span>
                                <input 
                                    type="number" 
                                    value={montant} 
                                    onChange={(e) => setMontant(e.target.value)}
                                    className="block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Ligne TVA (simplifié) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Ligne TVA</label>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                                <div>
                                    <label className="block text-xs text-gray-500">Total HT</label>
                                    <input type="number" value={totalHT} onChange={(e) => setTotalHT(e.target.value)} className="w-full border-gray-300 rounded-md sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Taux</label>
                                    <select defaultValue="20" className="w-full border-gray-300 rounded-md sm:text-sm">
                                        <option>Aucune</option>
                                        <option>20</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Total TVA</label>
                                    <input type="number" defaultValue="980000" readOnly className="w-full border-gray-300 bg-gray-50 rounded-md sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Champ Client */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Client</label>
                            <input type="text" value={client} onChange={(e) => setClient(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                        </div>

                        {/* Dates et Numéro */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date d'émission</label>
                                <input type="date" defaultValue="2025-11-29" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                                <input type="date" defaultValue="2025-12-29" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Numéro facture</label>
                                <input type="text" value={numeroFacture} onChange={(e) => setNumeroFacture(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                        </div>

                        {/* Ventilation / Catégorie */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ventilation</label>
                                <input type="text" defaultValue="701 - Ventes de produits finis" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                                <input type="text" defaultValue="Vente" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                        </div>

                        {/* Commentaires */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Commentaires</label>
                            <textarea placeholder="ajouter une commentaire" rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
                        </div>
                        
                        {/* Justificatif de paiement */}
                        <div className="mb-6">
                            <div className="text-sm font-medium text-gray-700 mb-1">Justificatif de paiement <button className="text-blue-600 font-medium">+ Ajouter</button></div>
                            <p className="text-xs text-gray-500">un justificatif est un document qui prouve que le montant à été encaissé (facture, reçu/ticket de caisses, etc)</p>
                        </div>

                        {/* BOUTON DE VALIDATION CLÉ AJOUTÉ */}
                        <button 
                            onClick={handleValider}
                            className="w-full bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Valider et Enregistrer la Facture
                        </button>

                    </div>
                </div>

            </div>
            
        </div>
    );
}