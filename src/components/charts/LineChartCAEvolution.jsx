import { useState, useEffect } from 'react';
import { useTheme } from '../../states/context/ThemeContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchWithReauth } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';
import LoadingOverlay from '../layout/LoadingOverlay';

export default function LineChartCAEvolution({ globalDateStart, globalDateEnd, onLoad }) {
  const { isDarkMode } = useTheme();
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ ca: 0, charges: 0, resultat: 0, moyenne: 0 });
  const [dateRangeDisplay, setDateRangeDisplay] = useState('');
  const [groupBy, setGroupBy] = useState('month'); // New state for toggling view
  const projectId = useProjectId();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        let dateStart, dateEnd;

        if (globalDateStart && globalDateEnd) {
          dateStart = globalDateStart;
          dateEnd = globalDateEnd;
        } else {
          // Fallback au cas où (ne devrait plus arriver avec Dashboard mis à jour)
          const dateRangeResponse = await fetchWithReauth(`/journals/date-range/`, {
            signal: abortController.signal
          });
          const dateRangeData = await dateRangeResponse.json();

          const maxDate = dateRangeData.max_date
            ? new Date(dateRangeData.max_date)
            : new Date();

          const endDateObj = maxDate;
          const startDateObj = new Date(maxDate);
          startDateObj.setMonth(startDateObj.getMonth() - 5);
          startDateObj.setDate(1);

          dateStart = startDateObj.toISOString().split('T')[0];
          dateEnd = endDateObj.toISOString().split('T')[0];
        }

        // Format date range for display
        const sObj = new Date(dateStart);
        const eObj = new Date(dateEnd);
        let dateRangeStr = '';
        if (groupBy === 'year') {
          dateRangeStr = `${sObj.getFullYear()} - ${eObj.getFullYear()}`;
        } else {
          const startDateStr = sObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          const endDateStr = eObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          dateRangeStr = `${startDateStr} - ${endDateStr}`;
        }
        setDateRangeDisplay(dateRangeStr);

        // Fetch evolution data
        const response = await fetchWithReauth(`/evolution-ca-resultat/?date_start=${dateStart}&date_end=${dateEnd}&group_by=${groupBy}`, {
          signal: abortController.signal
        });

        if (!response.ok) throw new Error('Erreur API');

        const monthsData = await response.json();

        if (!abortController.signal.aborted) {
          setEvolutionData(monthsData);

          // Calculer les totaux pour le header
          const totalCA = monthsData.reduce((acc, curr) => acc + curr.ca, 0);
          const totalCharges = monthsData.reduce((acc, curr) => acc + curr.charges, 0);
          const totalResultat = monthsData.reduce((acc, curr) => acc + curr.resultatNet, 0);

          setTotals({
            ca: totalCA,
            charges: totalCharges,
            resultat: totalResultat,
            moyenne: totalCA / (monthsData.length || 1)
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur chargement évolution CA:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          if (onLoad) onLoad(false);
        }
      }
    };

    fetchEvolutionData();

    return () => {
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, globalDateStart, globalDateEnd, groupBy]);

  const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(val).replace('MGA', 'Ar');

  return (
    <div className="w-full">
      {/* Header Style "Premium" - KPIs à droite */}
      {!loading && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-6 pl-1 sm:pl-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                {dateRangeDisplay}
              </p>
            </div>
            {/* Toggle GroupBy */}
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
              <button
                onClick={() => setGroupBy('month')}
                className={`px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${
                  groupBy === 'month' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setGroupBy('year')}
                className={`px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${
                  groupBy === 'year' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Année
              </button>
            </div>
          </div>

          <div className="flex space-x-3 sm:space-x-6 mt-2 sm:mt-4 md:mt-0 text-right">
            <div>
              <p className="text-[9px] sm:text-xs text-blue-500 uppercase font-bold mb-0.5 sm:mb-1">CA Total</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.ca)}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-red-500 uppercase font-bold mb-0.5 sm:mb-1">Charges totales</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.charges)}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-green-600 uppercase font-bold mb-0.5 sm:mb-1">Résultat net</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.resultat)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-64 sm:h-80 md:h-96 relative">
        {loading ? (
          <LoadingOverlay message="Chargement de l'évolution..." fullScreen={false} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f3f4f6"} vertical={false} />
              <XAxis
                dataKey="name"
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
                tick={{ fontSize: 9, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: isDarkMode ? "#4b5563" : '#9ca3af', strokeWidth: 1 }}
                height={50}
                dy={10}
              />
              <YAxis
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={-5} textAnchor="end" fill={isDarkMode ? '#9ca3af' : '#666'} fontSize={9}>
                      {new Intl.NumberFormat('fr-FR', { notation: "compact", compactDisplay: "short" }).format(payload.value)}
                    </text>
                  </g>
                )}
                tickLine={false}
                axisLine={{ stroke: isDarkMode ? "#4b5563" : '#9ca3af', strokeWidth: 1 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '8px',
                  fontSize: '11px',
                  color: isDarkMode ? '#f3f4f6' : '#374151'
                }}
                itemStyle={{ color: isDarkMode ? '#f3f4f6' : '#374151' }}
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ top: -10, right: 0, fontSize: '10px' }}
              />

              <Line
                type="monotone"
                dataKey="charges"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Charges"
              />
              <Line
                type="monotone"
                dataKey="ca"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Chiffre d'Affaires"
              />
              <Line
                type="monotone"
                dataKey="resultatNet"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Résultat"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
