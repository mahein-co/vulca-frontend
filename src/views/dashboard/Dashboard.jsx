import React, { useState } from 'react';
import BalanceModal from '../balance/BalanceModal';

import BarCharts from '../../components/charts/BarCharts';
import TvaBarChart from '../../components/charts/TvaBarChart';
import PieChartRepartition from '../../components/charts/PieChartRepartition';
import LineChartCAEvolution from '../../components/charts/LineChartCAEvolution';

// --- 1. Données Statiques ---

const summaryCards = [
  { title: "Chiffre d'affaires", value: 'Ar 37 800 000', icon: '📊', action: 'none' },
  { title: 'EBE', value: 'Ar 45350', unit: "Excédent Brut d'Exploitation", icon: '💰', action: 'none' },
  { title: 'Bénéfice net', value: 'Ar 7 678 300', unit: 'Marge nette', icon: '📈', action: 'none' },
  { title: 'BALANCE', value: 'Ar 209 202 800', unit: '', icon: '⚖️', action: 'openBalance' },
  { title: 'BFR', value: 'Ar 35 641 500', unit: 'Besoin en Fonds de Roulement', icon: '💵', action: 'none' },
];

const journals = [
  { name: 'Caisses', amount: '19 446 024 Ar', percentage: '9.2%', value: 9.2, color: 'bg-amber-800' },
  { name: 'Banques', amount: '23 604 000 Ar', percentage: '11.1%', value: 11.1, color: 'bg-blue-900' },
  { name: 'Achats', amount: '60 570 024 Ar', percentage: '28.6%', value: 28.6, color: 'bg-red-800' },
  { name: 'Ventes', amount: '105 370 800 Ar', percentage: '49.8%', value: 49.8, color: 'bg-emerald-900' },
  { name: 'Opérations diverses', amount: '2 750 000 Ar', percentage: '1.3%', value: 1.3, color: 'bg-gray-600' },
];


// --- 2. Composants de Support ---

const JournalRepartition = () => {
  const total = '211 740 848 Ar';
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Données exemple pour chaque journal (plus d'entrées pour la pagination)
  const journalEntries = {
    'Caisses': [
      { date: '2024-12-01', compte: '530000', libelle: 'Encaissement client ABC', debit: '1 500 000', credit: '-' },
      { date: '2024-12-05', compte: '401000', libelle: 'Paiement fournisseur XYZ', debit: '-', credit: '850 000' },
      { date: '2024-12-10', compte: '530000', libelle: 'Encaissement vente comptoir', debit: '2 300 000', credit: '-' },
      { date: '2024-12-15', compte: '411000', libelle: 'Remboursement client', debit: '-', credit: '350 000' },
      { date: '2024-12-18', compte: '530000', libelle: 'Recette journalière', debit: '4 200 000', credit: '-' },
      { date: '2024-12-20', compte: '401100', libelle: 'Règlement facture F-2024-089', debit: '-', credit: '1 150 000' },
      { date: '2024-12-22', compte: '530000', libelle: 'Encaissement client GHI', debit: '3 800 000', credit: '-' },
      { date: '2024-12-25', compte: '411000', libelle: 'Avoir client retour', debit: '-', credit: '420 000' },
    ],
    'Banques': [
      { date: '2024-12-02', compte: '512000', libelle: 'Virement client DEF', debit: '5 000 000', credit: '-' },
      { date: '2024-12-08', compte: '512100', libelle: 'Prélèvement charges sociales', debit: '-', credit: '1 200 000' },
      { date: '2024-12-15', compte: '421000', libelle: 'Virement salaires personnel', debit: '-', credit: '3 500 000' },
      { date: '2024-12-20', compte: '512000', libelle: 'Encaissement chèque', debit: '2 800 000', credit: '-' },
      { date: '2024-12-22', compte: '512000', libelle: 'Virement client JKL', debit: '6 500 000', credit: '-' },
      { date: '2024-12-24', compte: '627000', libelle: 'Frais bancaires', debit: '-', credit: '45 000' },
      { date: '2024-12-26', compte: '512100', libelle: 'Prélèvement loyer', debit: '-', credit: '2 500 000' },
    ],
    'Achats': [
      { date: '2024-12-03', compte: '607000', libelle: 'Achat marchandises', debit: '8 500 000', credit: '-' },
      { date: '2024-12-12', compte: '606100', libelle: 'Fournitures bureau', debit: '450 000', credit: '-' },
      { date: '2024-12-18', compte: '601000', libelle: 'Matières premières', debit: '12 000 000', credit: '-' },
      { date: '2024-12-22', compte: '602000', libelle: 'Autres approvisionnements', debit: '1 800 000', credit: '-' },
      { date: '2024-12-24', compte: '607100', libelle: 'Achat emballages', debit: '650 000', credit: '-' },
      { date: '2024-12-26', compte: '606300', libelle: 'Petit outillage', debit: '320 000', credit: '-' },
    ],
    'Ventes': [
      { date: '2024-12-04', compte: '701000', libelle: 'Vente produit fini A', debit: '-', credit: '15 000 000' },
      { date: '2024-12-09', compte: '706000', libelle: 'Prestation service B', debit: '-', credit: '8 500 000' },
      { date: '2024-12-14', compte: '701000', libelle: 'Vente produit fini C', debit: '-', credit: '22 000 000' },
      { date: '2024-12-19', compte: '707000', libelle: 'Vente marchandises', debit: '-', credit: '9 200 000' },
      { date: '2024-12-21', compte: '701100', libelle: 'Vente produit fini D', debit: '-', credit: '18 500 000' },
      { date: '2024-12-23', compte: '706100', libelle: 'Prestation conseil', debit: '-', credit: '5 800 000' },
      { date: '2024-12-27', compte: '707000', libelle: 'Vente comptoir', debit: '-', credit: '12 400 000' },
    ],
    'Opérations diverses': [
      { date: '2024-12-06', compte: '445710', libelle: 'Régularisation TVA collectée', debit: '500 000', credit: '-' },
      { date: '2024-12-11', compte: '129000', libelle: 'Écriture de clôture', debit: '-', credit: '250 000' },
      { date: '2024-12-25', compte: '658000', libelle: 'Charges exceptionnelles', debit: '180 000', credit: '-' },
      { date: '2024-12-28', compte: '445660', libelle: 'TVA déductible immobilisations', debit: '750 000', credit: '-' },
      { date: '2024-12-29', compte: '672000', libelle: 'Charges sur exercice antérieur', debit: '320 000', credit: '-' },
      { date: '2024-12-30', compte: '758000', libelle: 'Produits divers', debit: '-', credit: '890 000' },
    ],
  };

  // Reset page quand on change de journal
  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setCurrentPage(1);
  };

  // Logique de pagination
  const getCurrentEntries = () => {
    if (!selectedJournal) return [];
    const entries = journalEntries[selectedJournal.name] || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return entries.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    if (!selectedJournal) return 0;
    const entries = journalEntries[selectedJournal.name] || [];
    return Math.ceil(entries.length / itemsPerPage);
  };

  const getTotalEntries = () => {
    if (!selectedJournal) return 0;
    return (journalEntries[selectedJournal.name] || []).length;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border-t-2 border-gray-300">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Répartition par journal</h3>
      {journals.map((journal) => (
        <div key={journal.name} className="mb-3">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
            <span className="font-medium text-gray-700">
              {journal.name}
              <button
                onClick={() => handleSelectJournal(journal)}
                className="inline-flex items-center text-xs text-emerald-600 ml-2 cursor-pointer hover:text-emerald-700 font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                voir détails
              </button>
            </span>
            <span className="text-gray-800 font-medium">{journal.amount} <span className="text-gray-500">({journal.percentage})</span></span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-2 ${journal.color} rounded-full transition-all duration-300`}
              style={{ width: `${journal.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between">
        <span className="font-semibold text-gray-700">Total</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900">{total}</span>
      </div>

      {/* Modal Journal Detail */}
      {selectedJournal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl h-[85vh] w-full flex flex-col border-t-2 border-gray-300">
            <div className="flex-none p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${selectedJournal.color} mr-3`}></div>
                <h3 className="text-lg font-bold text-gray-800">Journal : {selectedJournal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-none p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Montant Total</p>
                  <p className="text-lg font-bold text-gray-900">{selectedJournal.amount}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Part du total</p>
                  <p className="text-lg font-bold text-gray-900">{selectedJournal.percentage}</p>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 min-h-0 bg-white">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-800 text-white">
                      <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Date</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">N° Compte</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Libellé</th>
                      <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Débit</th>
                      <th className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentEntries().map((entry, idx) => (
                      <tr key={idx} className={`hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="border-b border-gray-100 px-3 py-2.5 text-gray-600 font-medium">{entry.date}</td>
                        <td className="border-b border-gray-100 px-3 py-2.5">
                          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{entry.compte}</span>
                        </td>
                        <td className="border-b border-gray-100 px-3 py-2.5 text-gray-800">{entry.libelle}</td>
                        <td className="border-b border-gray-100 px-3 py-2.5 text-right">
                          {entry.debit !== '-' ? (
                            <span className="text-red-600 font-semibold">{entry.debit} Ar</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border-b border-gray-100 px-3 py-2.5 text-right">
                          {entry.credit !== '-' ? (
                            <span className="text-emerald-600 font-semibold">{entry.credit} Ar</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-none p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                  Affichage <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * itemsPerPage, getTotalEntries())}</span> sur <span className="font-semibold">{getTotalEntries()}</span> écritures
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {currentPage} / {getTotalPages()}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                    disabled={currentPage === getTotalPages()}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Suivant →
                  </button>
                </div>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- 3. Composant Principal Dashboard ---

const Dashboard = () => {
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isAlertesModalOpen, setIsAlertesModalOpen] = useState(false);
  const [isRentabiliteModalOpen, setIsRentabiliteModalOpen] = useState(false);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  return (
    <div className="px-4 sm:px-0 bg-gradient-to-br from-gray-50 to-slate-50 min-h-screen">

      {/* 1. Sélecteur de Période */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-3 sm:p-4 rounded-lg shadow-md border-t-2 border-gray-300">
        <div className="mb-2 sm:mb-0">
          <p className="font-semibold text-gray-800">Période d'exercice</p>
          <p className="text-xs text-gray-500">Sélectionnez la période à analyser</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm">
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 text-xs sm:text-sm">Du</label>
            <input type="date" defaultValue="2024-12-10" className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200" />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 text-xs sm:text-sm">Au</label>
            <input type="date" defaultValue="2025-12-10" className="p-1.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200" />
          </div>
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-gray-900 font-medium shadow-sm transition-all">
            11 déc. 2024 - 10 déc. 2025
          </button>
        </div>
      </div>

      {/* 2. Actions Rapides (Modern UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-all opacity-50 blur-2xl"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base group-hover:text-indigo-700 transition-colors">Import OCR</h3>
              <p className="text-xs text-gray-500 mt-1">Scanner et importer des factures automatiquement</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-all opacity-50 blur-2xl"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base group-hover:text-emerald-700 transition-colors">Saisie Facture</h3>
              <p className="text-xs text-gray-500 mt-1">Créer une nouvelle pièce comptable</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-all opacity-50 blur-2xl"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base group-hover:text-amber-700 transition-colors">Bilan & États</h3>
              <p className="text-xs text-gray-500 mt-1">Visualiser les états financiers et le bilan</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cartes de Résumé */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`flex items-start p-3 sm:p-4 rounded-lg shadow-md bg-white border-t-2 border-gray-300 ${card.action === 'openBalance' ? 'cursor-pointer hover:shadow-lg hover:border-emerald-500' : 'hover:shadow-lg'} transition-all duration-200`}
            onClick={card.action === 'openBalance' ? () => handleCardClick(card.action) : null}
          >
            <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
              <span className="text-xl">{card.icon}</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">{card.title}</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 my-1">{card.value}</p>
              <p className="text-xs text-gray-400">{card.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Graphique d'Évolution du Chiffre d'Affaires */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Évolution du Chiffre d'Affaires</h3>
        <LineChartCAEvolution />
      </div>

      {/* 5. Top 10 comptes mouvementés + TVA côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch mb-4">
        <div className="h-full">
          <BarCharts />
        </div>
        <div className="h-full">
          <TvaBarChart />
        </div>
      </div>

      {/* 6. Produits et Charges */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Répartition Produits et Charges</h3>
        </div>
        <PieChartRepartition />
      </div>

      {/* 7. Autres Indicateurs */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Autres Indicateurs</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg cursor-pointer hover:shadow-md border border-gray-200 hover:border-emerald-400 transition-all" onClick={() => setIsAlertesModalOpen(true)}>
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🚨</span>
              <h4 className="text-base font-semibold text-gray-800">Alertes & risques</h4>
            </div>
            <p className="text-sm text-gray-600">Cliquez pour voir les alertes et risques</p>
            <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">Voir détails →</span>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg cursor-pointer hover:shadow-md border border-gray-200 hover:border-emerald-400 transition-all" onClick={() => setIsRentabiliteModalOpen(true)}>
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">💹</span>
              <h4 className="text-base font-semibold text-gray-800">Rentabilité</h4>
            </div>
            <p className="text-sm text-gray-600">Cliquez pour voir la rentabilité</p>
            <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">Voir détails →</span>
          </div>
        </div>
      </div>

      {/* 8. Répartition par Journal */}
      <JournalRepartition />

      {/* La modale de la Balance */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
      />

      {/* Modale Alertes & Risques */}
      {isAlertesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative border-t-2 border-gray-300">
            <button onClick={() => setIsAlertesModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center mb-5">
              <span className="text-2xl mr-3">🚨</span>
              <h3 className="text-xl font-bold text-gray-800">Alertes & Risques</h3>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-semibold">Risque</th>
                    <th className="px-4 py-3 font-semibold text-right">Ratio</th>
                    <th className="px-4 py-3 font-semibold text-right">Seuil</th>
                    <th className="px-4 py-3 font-semibold text-center">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Annuité d'emprunt / CAF</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">0.40</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">&lt; 0.50</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Dette LMT / CAF</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">3.20</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">&lt; 3.50</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Résultat net / Chiffre d'affaires</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">-1.2%</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">(seuil interne)</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Charge financière / EBE</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">35%</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">&lt; 30%</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Charge financière / CA</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">6%</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">&lt; 5%</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                  <tr className="group hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Marge d'endettement (CMLT / FP)</td>
                    <td className="px-4 py-3 text-gray-700 text-right font-mono">1.10</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right">&lt; 1.30</td>
                    <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">Alerte</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modale Rentabilité */}
      {isRentabiliteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative border-t-2 border-gray-300">
            <button onClick={() => setIsRentabiliteModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center mb-5">
              <span className="text-2xl mr-3">💹</span>
              <h3 className="text-xl font-bold text-gray-800">Rentabilité</h3>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-semibold">Indicateur</th>
                    <th className="px-4 py-3 font-semibold text-right">Valeur</th>
                    <th className="px-4 py-3 font-semibold text-right">Variation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Return on Equity (ROE)</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">12.5%</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">↘ -1.5%</td>
                  </tr>
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Return on Assets (ROA)</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">8.7%</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +0.8%</td>
                  </tr>
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Capacité d'autofinancement (CAF)</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">Ar 1 200 000</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +5.2%</td>
                  </tr>
                  <tr className="group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">Marge opérationnelle</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">15.3%</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">↗ +2.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;