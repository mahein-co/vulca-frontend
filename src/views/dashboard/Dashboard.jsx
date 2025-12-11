import React, { useState } from 'react';
import BalanceModal from '../balance/BalanceModal';
<<<<<<< HEAD
import FactureForm from '../ocr/forms/NewInvoiceForm';
import BarCharts from '../../components/charts/BarCharts';
import PieChartRepartition from '../../components/charts/PieChartRepartition';
import LineChartCAEvolution from '../../components/charts/LineChartCAEvolution';
=======

// import FactureForm from '../ocr/forms/NewInvoiceForm';
>>>>>>> 7e081e3ffbf2c3ff71a276b0dc77714310a1cb3a

// --- 1. Données Statiques (inchangées) ---

const summaryCards = [
  { title: 'Chiffre d\'affaires', value: 'Ar 37 800 000', bgColor: 'bg-orange-100', icon: '📄', borderColor: 'border-orange-500', action: 'none' },
  { title: 'EBE', value: 'Ar 45350', unit: 'Excédent Brut d’Exploitation', bgColor: 'bg-yellow-100', icon: '🔔', borderColor: 'border-yellow-500', action: 'none' },
  { title: 'Bénéfice net', value: 'Ar 7 678 300', unit: 'Marge nette', bgColor: 'bg-red-100', icon: '🚨', borderColor: 'border-red-500', action: 'none' },
  { title: 'BFR', value: 'Ar 209 202 800', unit: 'Besoin en Fonds de Roulement', bgColor: 'bg-blue-100', icon: '✉️', borderColor: 'border-blue-500', action: 'openBalance' },
  { title: 'Leverage brut', value: 'Ar 35 641 500', unit: '', bgColor: 'bg-green-100', icon: '💲', borderColor: 'border-green-500', action: 'none' },
];

const evolutionLegend = [
    { label: 'Charges', color: 'bg-red-500' },
    { label: 'Chiffre d\'affaires', color: 'bg-orange-500' },
    { label: 'Résultat', color: 'bg-blue-500' },
];

const tvaLegend = [
    { label: 'TVA collectée', color: 'bg-blue-500' },
    { label: 'TVA déductible', color: 'bg-red-500' },
    { label: 'TVA nette', color: 'bg-green-500' },
];

const chargesLegend = [
    { label: 'Achats de marchandises', color: 'bg-red-500' },
    { label: 'Achats stockés de matières premières et fournitures', color: 'bg-orange-500' },
    { label: 'Charges patronales', color: 'bg-green-500' },
    { label: 'Rémunérations du personnel', color: 'bg-blue-500' },
];

const journals = [
    { name: 'Caisses', amount: '19 446 024 Ar', percentage: '9.2%', color: 'bg-yellow-500', value: 9.2 },
    { name: 'Banques', amount: '23 604 000 Ar', percentage: '11.1%', color: 'bg-purple-500', value: 11.1 },
    { name: 'Achats', amount: '60 570 024 Ar', percentage: '28.6%', color: 'bg-blue-500', value: 28.6 },
    { name: 'Ventes', amount: '105 370 800 Ar', percentage: '49.8%', color: 'bg-green-500', value: 49.8 },
    { name: 'Opérations diverses', amount: '2 750 000 Ar', percentage: '1.3%', color: 'bg-gray-500', value: 1.3 },
];


// --- 2. Composants de Support (inchangés) ---

const ChartPlaceholder = ({ title, legendItems, height = 'h-64' }) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="flex flex-wrap justify-end text-xs sm:text-sm mb-2">
      {legendItems.map((item) => (
        <span key={item.label} className="flex items-center ml-2 sm:ml-4 text-gray-600">
          <span className={`w-3 h-3 rounded-full mr-1 ${item.color}`}></span>
          {item.label}
        </span>
      ))}
    </div>
    <div className={`${height} bg-gray-50 border border-dashed flex items-center justify-center text-gray-400 text-sm`}>
      Placeholder Graphique (Simulation Visuelle) papa 
    </div>
  </div>
);

const JournalRepartition = () => {
  const total = '211 740 848 Ar';
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Répartition par journal</h3>
      {journals.map((journal) => (
        <div key={journal.name} className="mb-3">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
            <span className="font-medium text-gray-700">{journal.name} <span className="text-xs text-indigo-600 ml-1 cursor-pointer hidden sm:inline">voir</span></span>
            <span className="text-gray-800 font-medium">{journal.amount} ({journal.percentage})</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full ${journal.color}`} 
              style={{ width: `${journal.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
        <span className="font-semibold text-gray-700">Total</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
};


// --- 3. Composant Principal Dashboard ---

const Dashboard = () => {
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Sélecteur de Période (Responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-3 sm:mb-0">
          <p className="font-medium text-gray-700">Période d'exercice</p>
          <p className="text-xs text-gray-500">Sélectionnez la période à analyser</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:space-x-4 items-center text-sm">
          <div className="flex items-center space-x-2">
            <label className="text-gray-500 text-xs sm:text-sm">Du</label>
            <input type="date" defaultValue="2024-12-10" className="p-1 sm:p-2 border rounded-lg text-xs sm:text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-500 text-xs sm:text-sm">Au</label>
            <input type="date" defaultValue="2025-12-10" className="p-1 sm:p-2 border rounded-lg text-xs sm:text-sm" />
          </div>
          <button className="bg-gray-100 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-200">
            11 déc. 2024 - 10 déc. 2025
          </button>
        </div>
      </div>

      {/* 2. Cartes de Résumé (Responsive Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-5 mb-8">
        {summaryCards.map((card, index) => (
          <div 
            key={index} 
            className={`flex items-start p-3 sm:p-4 rounded-lg shadow-md bg-white border-l-4 ${card.borderColor} ${card.action === 'openBalance' ? 'cursor-pointer hover:shadow-lg transition duration-150' : ''}`}
            onClick={card.action === 'openBalance' ? () => handleCardClick(card.action) : null}
          >
            <div className={`p-2 rounded-full mr-3 ${card.bgColor} ${card.borderColor.replace('border-', 'text-')}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">{card.title}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 my-1">{card.value}</p>
              <p className="text-xs text-gray-400">{card.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Graphique d'Évolution du Chiffre d'Affaires */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Évolution du Chiffre d'Affaires</h3>
        <LineChartCAEvolution />
      </div>

      {/* 4. Graphique Top 10 des comptes les plus mouvementés */}
      <BarCharts />

      {/* 5. Produits et Charges */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Répartition Produits et Charges</h3>
        </div>
        
        {/* PieChart Repartition */}
        <PieChartRepartition />
      </div>
      
      {/* 6. Répartition par Journal */}
      <JournalRepartition />

      {/* La modale de la Balance (Invisible par défaut) */}
      <BalanceModal 
        isOpen={isBalanceModalOpen} 
        onClose={() => setIsBalanceModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;