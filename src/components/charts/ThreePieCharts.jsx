import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL_API } from '../../constants/globalConstants';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Différentes palettes de couleurs pour chaque camembert
const COLORS_PRODUITS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];
const COLORS_CHARGES = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
const COLORS_COMPARISON = ['#3b82f6', '#ef4444']; // Bleu pour Produits, Rouge pour Charges

export default function ThreePieCharts({ globalDateStart, globalDateEnd }) {
  const [produitsData, setProduitsData] = useState([]);
  const [chargesData, setChargesData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Construire l'URL avec les filtres de date
    let params = '?';
    if (globalDateStart) params += `date_start=${globalDateStart}&`;
    if (globalDateEnd) params += `date_end=${globalDateEnd}`;

    // Fetch des données pour les 3 camemberts
    Promise.all([
      axios.get(`${BASE_URL_API}/CompteResultats/${params}`),
    ])
      .then(([res]) => {
        console.log('Données CompteResultats:', res.data); // Debug
        const data = res.data;
        
        // Filtrer Produits (classe 7)
        const produits = data
          .filter(item => item.nature === 'PRODUIT')
          .reduce((acc, item) => {
            const firstChar = item.numero_compte?.charAt(0);
            if (firstChar === '7') {
              const existing = acc.find(p => p.name === item.libelle);
              if (existing) {
                existing.value += parseFloat(item.montant_ar || 0);
              } else {
                acc.push({
                  name: item.libelle || `Compte ${item.numero_compte}`,
                  value: parseFloat(item.montant_ar || 0)
                });
              }
            }
            return acc;
          }, [])
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5

        // Filtrer Charges (classe 6)
        const charges = data
          .filter(item => item.nature === 'CHARGE')
          .reduce((acc, item) => {
            const firstChar = item.numero_compte?.charAt(0);
            if (firstChar === '6') {
              const existing = acc.find(c => c.name === item.libelle);
              if (existing) {
                existing.value += parseFloat(item.montant_ar || 0);
              } else {
                acc.push({
                  name: item.libelle || `Compte ${item.numero_compte}`,
                  value: parseFloat(item.montant_ar || 0)
                });
              }
            }
            return acc;
          }, [])
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5

        // Total Produits vs Total Charges
        const totalProduits = data
          .filter(item => item.nature === 'PRODUIT')
          .reduce((sum, item) => sum + parseFloat(item.montant_ar || 0), 0);
        
        const totalCharges = data
          .filter(item => item.nature === 'CHARGE')
          .reduce((sum, item) => sum + parseFloat(item.montant_ar || 0), 0);

        const comparison = [
          { name: 'Produits', value: totalProduits },
          { name: 'Charges', value: totalCharges }
        ];

        setProduitsData(produits);
        setChargesData(charges);
        setComparisonData(comparison);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des répartitions", err);
        setLoading(false);
      });
  }, [globalDateStart, globalDateEnd]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-blue-600">{Number(value).toLocaleString('fr-FR')} Ar</p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = (data, colors, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center text-gray-400">
          Aucune donnée
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex-1">
        <h4 className="text-center font-semibold text-gray-700 mb-3">{title}</h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ value }) => {
                const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                return `${percent}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md border-t-2 border-gray-300 flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement des répartitions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">📊</span>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          Répartitions Financières
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderPieChart(produitsData, COLORS_PRODUITS, "Répartition des Produits")}
        {renderPieChart(chargesData, COLORS_CHARGES, "Répartition des Charges")}
        {renderPieChart(comparisonData, COLORS_COMPARISON, "Produits vs Charges")}
      </div>
    </div>
  );
}
