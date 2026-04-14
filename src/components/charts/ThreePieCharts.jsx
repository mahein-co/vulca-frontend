import React, { useState, useEffect } from 'react';
import { useTheme } from '../../states/context/ThemeContext';
import axios from 'axios';
import { BASE_URL_API } from '../../constants/globalConstants';
import { getApiHeaders, fetchWithReauth } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import LoadingOverlay from '../layout/LoadingOverlay';


export default function ThreePieCharts({ globalDateStart, globalDateEnd, onLoad }) {
  const { isDarkMode } = useTheme();
  const [produitsData, setProduitsData] = useState([]);
  const [chargesData, setChargesData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const projectId = useProjectId();

  // Palettes de couleurs à fort contraste et très distinctes
  const COLORS_PRODUITS_NEW = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
  const COLORS_CHARGES_NEW = ['#ef4444', '#f97316', '#eab308', '#dc2626', '#db2777', '#9333ea', '#ea580c'];
  const COLORS_COMPARISON_NEW = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']; // Bleu, Rouge, Vert, Orange

  useEffect(() => {
    // Reset loading state on filter change
    setLoading(true);

    // Construire l'URL avec les filtres de date
    let params = '?';
    if (globalDateStart) params += `date_start=${globalDateStart}&`;
    if (globalDateEnd) params += `date_end=${globalDateEnd}`;

    // Fetch des données pour les 3 camemberts
    fetchWithReauth(`/CompteResultats/${params}`)
      .then(res => res.json())
      .then(rawData => {
        // Gérer la pagination si nécessaire
        const data = Array.isArray(rawData) ? rawData : (rawData && rawData.results ? rawData.results : []);

        if (data.length === 0) {
          setProduitsData([]);
          setChargesData([]);
          setComparisonData([]);
          setLoading(false);
          if (onLoad) onLoad(false);
          return;
        }

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
          .filter(p => p.value > 0) // Garder uniquement les valeurs positives
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
          .filter(c => c.value > 0) // Garder uniquement les valeurs positives
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5

        // Total Produits vs Total Charges
        const totalProduits = data
          .filter(item => item.nature === 'PRODUIT')
          .reduce((sum, item) => sum + parseFloat(item.montant_ar || 0), 0);

        const totalCharges = data
          .filter(item => item.nature === 'CHARGE')
          .reduce((sum, item) => sum + parseFloat(item.montant_ar || 0), 0);

        const comparison = [];
        if (totalProduits > 0) comparison.push({ name: 'Produits', value: totalProduits });
        if (totalCharges > 0) comparison.push({ name: 'Charges', value: totalCharges });

        setProduitsData(produits);
        setChargesData(charges);
        setComparisonData(comparison);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des répartitions", err);
        setProduitsData([]);
        setChargesData([]);
        setComparisonData([]);
      })
      .finally(() => {
        setLoading(false);
        if (onLoad) onLoad(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDateStart, globalDateEnd, projectId, onLoad]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          <p className="text-blue-600 dark:text-blue-400">{Number(value).toLocaleString('fr-FR')} Ar</p>
        </div>
      );
    }
    return null;
  };

  const renderPieChartCard = (data, colors, title, type) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ') + ' Ar';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full w-full relative overflow-hidden">
        {/* Titre et Total */}
        <div className="mb-4 text-center">
          <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm sm:text-base mb-1">{title}</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
            Total {type === 'CHARGE' ? 'Charges' : (type === 'PRODUIT' ? 'Produits' : 'Global')}
          </p>
          <p className={`text-lg font-extrabold ${type === 'PRODUIT' ? 'text-emerald-600 dark:text-emerald-500' : (type === 'CHARGE' ? 'text-red-600 dark:text-red-500' : 'text-blue-600 dark:text-blue-500')}`}>
            {formatCurrency(total)}
          </p>
        </div>

        {/* Graphique Doughnut */}
        <div className="flex-1 min-h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => {
                  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                  return percent > 3 ? `${percent}%` : ''; // Seuil baissé à 3%
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={isDarkMode ? "#1f2937" : "white"} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '10px', fontSize: '10px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                layout="horizontal"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300 dark:border-gray-700 relative h-96">
        <LoadingOverlay message="Chargement des répartitions..." fullScreen={false} />
      </div>
    );
  }

  // Déterminer quels graphiques ont des données
  const activeCharts = [
    { data: produitsData, colors: COLORS_PRODUITS_NEW, title: "Répartition des produits", type: "PRODUIT" },
    { data: chargesData, colors: COLORS_CHARGES_NEW, title: "Répartition des charges", type: "CHARGE" },
    { data: comparisonData, colors: COLORS_COMPARISON_NEW, title: "Produits vs charges", type: "COMPARISON" }
  ].filter(chart => chart.data && chart.data.length > 0);

  // Si aucun graphique n'a de données
  if (activeCharts.length === 0) {
    return null;
  }

  // Calculer la classe de grille
  let gridClass = "grid-cols-1";
  if (activeCharts.length === 2) gridClass = "grid-cols-1 md:grid-cols-2";
  if (activeCharts.length >= 3) gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md mb-4 border-t-2 border-gray-300 dark:border-gray-700">
      <div className="mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
            Répartitions financières
          </h3>
          {globalDateStart && globalDateEnd && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(globalDateStart).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - {new Date(globalDateEnd).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className={`grid ${gridClass} gap-6`}>
        {activeCharts.map((chart, index) => (
          <div key={index} className="w-full h-[400px]">
            {renderPieChartCard(chart.data, chart.colors, chart.title, chart.type)}
          </div>
        ))}
      </div>
    </div>
  );
}
