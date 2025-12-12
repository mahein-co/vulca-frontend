import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { X } from 'lucide-react';

// --- Données pour la Balance ---
const balanceData = [
  { compte: '641', libelle: 'Rémunérations du personnel', totalDebit: 2350000.00, totalCredit: 0, solde: 2350000.00, nature: 'Débiteur' },
  { compte: '421', libelle: 'Personnel - Rémunérations dues', totalDebit: 0, totalCredit: 2150000.00, solde: 2150000.00, nature: 'Créditeur' },
  { compte: '411', libelle: 'Clients (Créances)', totalDebit: 105370800, totalCredit: 18048000, solde: 87322800, nature: 'Débiteur' },
  { compte: '401', libelle: 'Fournisseurs (Dettes)', totalDebit: 23733000, totalCredit: 59301000, solde: 35568000, nature: 'Créditeur' },
  { compte: '512', libelle: 'Banques (Compte courant)', totalDebit: 11316000, totalCredit: 12288000, solde: 972000, nature: 'Créditeur' },
  { compte: '612', libelle: 'Achats stockés de matières premières et fournitures', totalDebit: 16307500, totalCredit: 0, solde: 16307500, nature: 'Débiteur' },
  { compte: '645', libelle: 'Charges patronales', totalDebit: 400000, totalCredit: 0, solde: 400000, nature: 'Débiteur' },
  { compte: '411', libelle: 'Clients (Créances)', totalDebit: 105370800, totalCredit: 18048000, solde: 87322800, nature: 'Débiteur' },
  { compte: '401', libelle: 'Fournisseurs (Dettes)', totalDebit: 23733000, totalCredit: 59301000, solde: 35568000, nature: 'Créditeur' },
  { compte: '512', libelle: 'Banques (Compte courant)', totalDebit: 11316000, totalCredit: 12288000, solde: 972000, nature: 'Créditeur' },
  { compte: '612', libelle: 'Achats stockés de matières premières et fournitures', totalDebit: 16307500, totalCredit: 0, solde: 16307500, nature: 'Débiteur' },
  { compte: '645', libelle: 'Charges patronales', totalDebit: 400000, totalCredit: 0, solde: 400000, nature: 'Débiteur' },
  { compte: '701', libelle: 'Ventes de produits finis', totalDebit: 0, totalCredit: 79670000, solde: 79670000, nature: 'Créditeur' },
];

// --- Composant Modal Balance ---
const BalanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalDebit = balanceData.reduce((sum, item) => sum + item.totalDebit, 0);
  const totalCredit = balanceData.reduce((sum, item) => sum + item.totalCredit, 0);
  const totalSolde = balanceData.reduce((sum, item) => sum + Math.abs(item.solde), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-gray-50">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'cursive' }}>
            Balance
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tableau - Scrollable */}
        <div className="flex-1 overflow-auto">
          {/* Version Desktop & Tablet */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Compte</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Libellé</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase text-xs">Total Débit</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase text-xs">Total Crédit</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase text-xs">Solde</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase text-xs">Nature</th>
                </tr>
              </thead>
              <tbody>
                {balanceData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.compte}</td>
                    <td className="px-4 py-3 text-gray-700">{item.libelle}</td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: item.totalDebit > 0 ? '#10b981' : '#6b7280' }}>
                      {item.totalDebit > 0 ? formatAmount(item.totalDebit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: item.totalCredit > 0 ? '#ef4444' : '#6b7280' }}>
                      {item.totalCredit > 0 ? formatAmount(item.totalCredit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatAmount(item.solde)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.nature === 'Débiteur' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.nature}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold sticky bottom-0 border-t-2">
                <tr>
                  <td colSpan="2" className="px-4 py-4 text-left text-gray-900 text-base">Total Général</td>
                  <td className="px-4 py-4 text-right text-green-600 text-base">{formatAmount(totalDebit)} ArUS</td>
                  <td className="px-4 py-4 text-right text-red-600 text-base">{formatAmount(totalCredit)} ArUS</td>
                  <td className="px-4 py-4 text-right text-orange-600 text-base">{formatAmount(totalSolde)} ArUS</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Version Mobile - Cards */}
          <div className="sm:hidden p-4 space-y-4">
            {balanceData.map((item, index) => (
              <div 
                key={index} 
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3 pb-3 border-b">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{item.compte}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.libelle}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.nature === 'Débiteur' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.nature}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Débit:</span>
                    <span className="font-semibold" style={{ color: item.totalDebit > 0 ? '#10b981' : '#6b7280' }}>
                      {item.totalDebit > 0 ? formatAmount(item.totalDebit) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Crédit:</span>
                    <span className="font-semibold" style={{ color: item.totalCredit > 0 ? '#ef4444' : '#6b7280' }}>
                      {item.totalCredit > 0 ? formatAmount(item.totalCredit) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold text-gray-700">Solde:</span>
                    <span className="font-bold text-gray-900">{formatAmount(item.solde)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Mobile */}
            <div className="bg-gray-100 rounded-lg p-4 font-bold border-2">
              <p className="text-gray-900 mb-3 text-base">Total Général</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Débit:</span>
                  <span className="text-green-600">{formatAmount(totalDebit)} ArUS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Crédit:</span>
                  <span className="text-red-600">{formatAmount(totalCredit)} ArUS</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-900">Solde:</span>
                  <span className="text-orange-600">{formatAmount(totalSolde)} ArUS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Données Statiques ---
const summaryCards = [
  { title: 'Chiffre d\'affaires', value: 'Ar 37 800 000', bgColor: 'bg-orange-100', icon: '📄', borderColor: 'border-orange-500', action: 'none' },
  { title: 'EBE', value: 'Ar 45350', unit: 'Excédent Brut d\'Exploitation', bgColor: 'bg-yellow-100', icon: '🔔', borderColor: 'border-yellow-500', action: 'none' },
  { title: 'Bénéfice net', value: 'Ar 7 678 300', unit: 'Marge nette', bgColor: 'bg-red-100', icon: '🚨', borderColor: 'border-red-500', action: 'none' },
  { title: 'BFR', value: 'Ar 209 202 800', unit: 'Besoin en Fonds de Roulement', bgColor: 'bg-blue-100', icon: '✉️', borderColor: 'border-blue-500', action: 'openBalance' },
  { title: 'Leverage brut', value: 'Ar 35 641 500', unit: '', bgColor: 'bg-green-100', icon: '💲', borderColor: 'border-green-500', action: 'none' },
];

const journals = [
  { name: 'Caisses', amount: '19 446 024 Ar', percentage: '9.2%', color: 'bg-yellow-500', value: 9.2 },
  { name: 'Banques', amount: '23 604 000 Ar', percentage: '11.1%', color: 'bg-purple-500', value: 11.1 },
  { name: 'Achats', amount: '60 570 024 Ar', percentage: '28.6%', color: 'bg-blue-500', value: 28.6 },
  { name: 'Ventes', amount: '105 370 800 Ar', percentage: '49.8%', color: 'bg-green-500', value: 49.8 },
  { name: 'Opérations diverses', amount: '2 750 000 Ar', percentage: '1.3%', color: 'bg-gray-500', value: 1.3 },
];

const caData = [
  { month: 'Jan', ca: 2500000, charges: 1800000, resultat: 700000 },
  { month: 'Fév', ca: 3200000, charges: 2100000, resultat: 1100000 },
  { month: 'Mar', ca: 2800000, charges: 1900000, resultat: 900000 },
  { month: 'Avr', ca: 3500000, charges: 2300000, resultat: 1200000 },
  { month: 'Mai', ca: 3100000, charges: 2000000, resultat: 1100000 },
  { month: 'Jun', ca: 3800000, charges: 2500000, resultat: 1300000 },
];

const topComptesData = [
  { compte: '411 - Clients', montant: 85000000 },
  { compte: '401 - Fournisseurs', montant: 72000000 },
  { compte: '512 - Banque', montant: 65000000 },
  { compte: '607 - Achats', montant: 58000000 },
  { compte: '707 - Ventes', montant: 95000000 },
  { compte: '641 - Salaires', montant: 42000000 },
  { compte: '44571 - TVA', montant: 35000000 },
  { compte: '215 - Matériel', montant: 28000000 },
];

const repartitionData = [
  { name: 'Produits', value: 105370800, color: '#10b981' },
  { name: 'Charges', value: 60570024, color: '#ef4444' },
];

const evolutionLegend = [
  { label: 'Charges', color: 'bg-red-500' },
  { label: 'Chiffre d\'affaires', color: 'bg-orange-500' },
  { label: 'Résultat', color: 'bg-blue-500' },
];

// --- Composants Graphiques ---
const LineChartCAEvolution = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={caData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M Ar`} />
      <Legend />
      <Line type="monotone" dataKey="ca" stroke="#f97316" strokeWidth={2} name="CA" />
      <Line type="monotone" dataKey="charges" stroke="#ef4444" strokeWidth={2} name="Charges" />
      <Line type="monotone" dataKey="resultat" stroke="#3b82f6" strokeWidth={2} name="Résultat" />
    </LineChart>
  </ResponsiveContainer>
);

const BarCharts = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Top 10 des comptes les plus mouvementés</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topComptesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="compte" angle={-15} textAnchor="end" height={100} fontSize={11} />
        <YAxis />
        <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M Ar`} />
        <Bar dataKey="montant" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const PieChartRepartition = () => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={repartitionData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {repartitionData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M Ar`} />
    </PieChart>
  </ResponsiveContainer>
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

// --- Composant Principal Dashboard ---
const Dashboard = () => {
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleCardClick = (action) => {
    if (action === 'openBalance') {
      setIsBalanceModalOpen(true);
    }
  };

  return (
    <div className="px-4 sm:px-0 bg-gray-50 min-h-screen">
      
      {/* 1. Sélecteur de Période */}
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

      {/* 2. Cartes de Résumé */}
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
        <div className="flex flex-wrap justify-end text-xs sm:text-sm mb-2">
          {evolutionLegend.map((item) => (
            <span key={item.label} className="flex items-center ml-2 sm:ml-4 text-gray-600">
              <span className={`w-3 h-3 rounded-full mr-1 ${item.color}`}></span>
              {item.label}
            </span>
          ))}
        </div>
        <LineChartCAEvolution />
      </div>

      {/* 4. Graphique Top 10 des comptes */}
      <BarCharts />

      {/* 5. Produits et Charges */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Répartition Produits et Charges</h3>
        </div>
        <PieChartRepartition />
      </div>
      
      {/* 6. Répartition par Journal */}
      <JournalRepartition />

      {/* La modale de la Balance */}
      <BalanceModal 
        isOpen={isBalanceModalOpen} 
        onClose={() => setIsBalanceModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;