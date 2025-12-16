// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// const top10AccountsData = [
//   { account: '411000', label: 'Clients', movement: 450000000, pcg: 'PCG 2005' },
//   { account: '401000', label: 'Fournisseurs', movement: 320000000, pcg: 'PCG 2005' },
//   { account: '512000', label: 'Banques', movement: 280000000, pcg: 'PCG 2005' },
//   { account: '411100', label: 'Clients - Ventes', movement: 245000000, pcg: 'PCG 2005' },
//   { account: '401100', label: 'Fournisseurs - Achats', movement: 195000000, pcg: 'PCG 2005' },
//   { account: '701000', label: 'Ventes de marchandises', movement: 180000000, pcg: 'PCG 2005' },
//   { account: '601000', label: 'Achats de marchandises', movement: 165000000, pcg: 'PCG 2005' },
//   { account: '411200', label: 'Clients - Services', movement: 145000000, pcg: 'PCG 2005' },
//   { account: '521000', label: 'Caisse', movement: 128000000, pcg: 'PCG 2005' },
//   { account: '401200', label: 'Fournisseurs - Services', movement: 112000000, pcg: 'PCG 2005' },
// ];

// export default function BarCharts() {
//   return (
//     <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-full">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
//         <h3 className="text-base sm:text-lg font-semibold text-gray-800">Top 10 des comptes les plus mouvementés</h3>
//         <span className="text-xs sm:text-sm font-medium text-gray-500 mt-2 sm:mt-0">Référence : PCG 2005</span>
//       </div>
      
//       <div className="w-full h-96 lg:h-[520px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={top10AccountsData} margin={{ top: 10, right: 30, left: 60, bottom: 100 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//             <XAxis 
//               dataKey="label" 
//               angle={-45}
//               textAnchor="end"
//               height={100}
//               tick={{ fontSize: 12 }}
//               stroke="#4b5563"
//             />
//             <YAxis 
//               stroke="#4b5563" 
//               width={60}
//               tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
//             />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: '#fff',
//                 border: '1px solid #d1d5db',
//                 borderRadius: '8px',
//                 boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//               }}
//               labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
//               formatter={(value, name) => {
//                 if (name === 'movement') {
//                   return [value.toLocaleString('fr-FR') + ' Ar', 'Montant'];
//                 }
//                 return value;
//               }}
//               labelFormatter={(label) => {
//                 const data = top10AccountsData.find(d => d.account === label);
//                 return data ? `${data.account} - ${data.label}` : label;
//               }}
//             />
//             <Legend wrapperStyle={{ paddingTop: '20px' }} />
//             <Bar
//               dataKey="movement"
//               fill="#3b82f6"
//               name="Montant Mouvementé"
//               radius={[8, 8, 0, 0]}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Assurez-vous d'importer vos données ici
// Exemple de données (à remplacer par votre 'top10AccountsData')
const top10AccountsData = [
    { label: 'Achats de marchandises', account: '601', movement: 450000000 },
    { label: 'Ventes de marchandises', account: '701', movement: 380000000 },
    { label: 'Services extérieurs', account: '61', movement: 250000000 },
    { label: 'Charges de personnel', account: '64', movement: 180000000 },
    { label: 'Impôts et taxes', account: '63', movement: 150000000 },
    { label: 'Achats de matières', account: '602', movement: 120000000 },
    { label: 'Produits financiers', account: '76', movement: 90000000 },
    { label: 'Services bancaires', account: '627', movement: 65000000 },
    { label: 'Caisse', account: '53', movement: 40000000 },
    { label: 'Banque', account: '512', movement: 30000000 },
];

export default function BarCharts() {
  // Couleur de la barre : un bleu plus vif ou un dégradé (ici un bleu standard pour simplifier)
  const barColor = '#10b981'; // Un vert émeraude frais au lieu du bleu standard

  return (
    <div className="bg-white p-5 sm:p-8 rounded-xl shadow-2xl h-full border border-gray-100 transition duration-300 hover:shadow-3xl">
      
      {/* 🚀 En-tête Amélioré */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
          📈 Top 10 des comptes les plus mouvementés
        </h3>
        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-3 sm:mt-0">
          Référence : PCG 2005
        </span>
      </div>
      
      <div className="w-full h-96 lg:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={top10AccountsData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 90 }} // Moins de marge à gauche/bas, plus à droite/haut
            barCategoryGap="20%" // Ajout d'un écart pour des barres plus épaisses
          >
            {/* Grille plus subtile */}
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
            
            {/* 🔽 Axe X Amélioré (Rotation et Police) */}
            <XAxis 
              dataKey="label" 
              angle={-35} // Moins d'angle pour une meilleure lisibilité
              textAnchor="end"
              height={90}
              tick={{ fontSize: 11, fill: '#4b5563' }} // Police plus petite
              stroke="#d1d5db" // Ligne d'axe plus claire
              interval={0} // Afficher toutes les étiquettes
            />
            
            {/* ◀️ Axe Y Amélioré (Unités) */}
            <YAxis 
              stroke="#d1d5db" 
              width={70} // Un peu plus large pour les grandes valeurs
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              tick={{ fill: '#4b5563', fontSize: 12 }}
            />
            
            {/* 💡 Tooltip (Info-bulle) Stylisé */}
            <Tooltip
              cursor={{ fill: '#f3f4f6', opacity: 0.8 }} // Ajout d'un curseur
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '10px',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}
              formatter={(value, name) => {
                if (name === 'Montant Mouvementé') {
                  // Formatage monétaire pour l'Afrique Francophone (ou France)
                  return [value.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' Ar', name];
                }
                return value;
              }}
              labelFormatter={(label) => {
                const data = top10AccountsData.find(d => d.label === label); // Recherche par 'label'
                return data ? `Compte ${data.account} : ${data.label}` : label;
              }}
            />

            {/* Légende en bas et centrée */}
            <Legend 
                wrapperStyle={{ paddingTop: '20px' }} 
                verticalAlign="bottom" 
                align="center"
            />
            
            {/* 📊 Barres Stylisées */}
            <Bar
              dataKey="movement"
              fill={barColor}
              name="Montant Mouvementé"
              radius={[10, 10, 0, 0]} // Coins supérieurs plus arrondis
              // Ajout d'une légère ombre portée pour un effet 3D subtil
              style={{ filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1))' }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// export default BarCharts; // Retirer cette ligne si vous utilisez l'export par défaut ci-dessus
