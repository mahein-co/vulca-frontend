import React, { useState, useEffect } from 'react';
import { useTheme } from '../../states/context/ThemeContext';
import axios from 'axios';
import { BASE_URL_API } from '../../constants/globalConstants';
import { getApiHeaders } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';
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
import LoadingOverlay from '../layout/LoadingOverlay';

export default function BarCharts({ globalDateStart, globalDateEnd }) {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '', display: '' });
  const projectId = useProjectId();

  // Couleur de la barre : un bleu plus vif ou un dégradé (ici un bleu standard pour simplifier)
  const barColor = '#10b981'; // Un vert émeraude frais au lieu du bleu standard

  useEffect(() => {
    let dateStart, dateEnd;

    if (globalDateStart && globalDateEnd) {
      dateStart = globalDateStart;
      dateEnd = globalDateEnd;
    } else {
      // Fallback
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      dateStart = startDate.toISOString().split('T')[0];
      dateEnd = endDate.toISOString().split('T')[0];
    }

    // Format for display
    const sObj = new Date(dateStart);
    const eObj = new Date(dateEnd);
    const startDateStr = sObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    const endDateStr = eObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    const dateRangeStr = `${startDateStr} - ${endDateStr}`;

    setDateRange({ start: dateStart, end: dateEnd, display: dateRangeStr });

    // Fetch top 10 accounts data with active range
    let url = `${BASE_URL_API}/top-comptes-mouvementes/?date_start=${dateStart}&date_end=${dateEnd}`;

    setLoading(true);
    axios.get(url, { headers: getApiHeaders(), withCredentials: true })
      .then(res => {
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
  }, [projectId, globalDateStart, globalDateEnd]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 h-full border-t-2 border-gray-300 dark:border-gray-700 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
            Top 10 des comptes les plus mouvementés
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {dateRange.display}
          </p>
        </div>
      </div>

      <div className="w-full h-80 sm:h-96 relative">
        {loading ? (
          <LoadingOverlay message="Chargement des comptes..." fullScreen={false} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#f3f4f6"} />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                axisLine={false}
                tickLine={false}
                dy={10}
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
              />
              <YAxis
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
                width={60}
                tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />

              <Tooltip
                cursor={{ fill: isDarkMode ? '#374151' : '#f9fafb' }}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '12px',
                  color: isDarkMode ? '#f3f4f6' : '#374151'
                }}
                itemStyle={{ color: isDarkMode ? '#f3f4f6' : '#374151' }}
                formatter={(value, name) => {
                  const amount = Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 0 }).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ');
                  return [amount + ' Ar', 'Mouvement'];
                }}
                labelFormatter={(label) => {
                  const item = data.find(d => d.label === label);
                  return item ? `Compte ${item.account} : ${item.label}` : label;
                }}
              />

              <Legend
                wrapperStyle={{ paddingTop: '0px', top: -30 }}
                verticalAlign="top"
                align="center"
                iconType="circle"
                iconSize={8}
              />

              <Bar
                dataKey="movement"
                fill={barColor}
                name="Montant Mouvementé"
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// export default BarCharts; // Retirer cette ligne si vous utilisez l'export par défaut ci-dessus
