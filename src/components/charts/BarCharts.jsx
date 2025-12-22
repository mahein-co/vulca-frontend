import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL_API } from '../../constants/globalConstants';
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

export default function BarCharts({ globalDateStart, globalDateEnd }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Couleur de la barre : un bleu plus vif ou un dégradé (ici un bleu standard pour simplifier)
  const barColor = '#10b981'; // Un vert émeraude frais au lieu du bleu standard

  useEffect(() => {
    // Fetch top 10 accounts data
    let url = `${BASE_URL_API}/top-comptes-mouvementes/?`;
    if (globalDateStart) url += `date_start=${globalDateStart}&`;
    if (globalDateEnd) url += `date_end=${globalDateEnd}`;

    axios.get(url)
      .then(res => {
        // Map backend API response to chart data format
        // Backend: { compte, libelle, mt_mvt }
        // Chart: { account, label, movement }
        const formattedData = res.data.map(item => ({
          account: item.compte,
          label: item.libelle,
          movement: parseFloat(item.mt_mvt)
        }));
        setData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération du Top 10 comptes", err);
        setLoading(false);
      });
  }, [globalDateStart, globalDateEnd]);

  if (loading) {
    return (
      <div className="bg-white p-5 sm:p-8 rounded-xl h-full border border-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-xl h-full border border-gray-100 transition duration-300 hover:shadow-3xl">
      
      {/* 🚀 En-tête Amélioré */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
          📈 Top 10 des comptes les plus mouvementés
        </h3>
      </div>

      <div className="w-full h-96 lg:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 60, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="label" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
              stroke="#4b5563"
            />
            <YAxis 
              stroke="#4b5563" 
              width={60}
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
                const item = data.find(d => d.label === label); // Recherche par 'label'
                return item ? `Compte ${item.account} : ${item.label}` : label;
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
