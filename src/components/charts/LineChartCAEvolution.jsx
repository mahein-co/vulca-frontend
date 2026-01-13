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
import { BASE_URL_API } from '../../constants/globalConstants';

export default function LineChartCAEvolution() {
  const { isDarkMode } = useTheme();
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ ca: 0, charges: 0, resultat: 0, moyenne: 0 });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        const dateRangeResponse = await fetch(`${BASE_URL_API}/journals/date-range/`, {
          signal: abortController.signal
        });
        const dateRangeData = await dateRangeResponse.json();

        // Si on a des filtres globaux (à implémenter si props), sinon on prend max date
        const maxDate = dateRangeData.max_date
          ? new Date(dateRangeData.max_date)
          : new Date();

        const endDateObj = maxDate;
        const startDateObj = new Date(maxDate);
        startDateObj.setMonth(startDateObj.getMonth() - 5);
        startDateObj.setDate(1); // 1er jour du mois d'il y a 6 mois

        const dateStart = startDateObj.toISOString().split('T')[0];
        const dateEnd = endDateObj.toISOString().split('T')[0];

        // Fetch ONE call instead of 6
        const response = await fetch(`${BASE_URL_API}/evolution-ca-resultat/?date_start=${dateStart}&date_end=${dateEnd}`, {
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
        }
      }
    };

    fetchEvolutionData();

    return () => {
      abortController.abort();
    };
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(val).replace('MGA', 'Ar');

  return (
    <div className="w-full">
      {/* Header Style "Premium" - KPIs à droite */}
      {!loading && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-6 pl-1 sm:pl-2">
          <div>
            {/* Titre déjà affiché par le parent, on peut afficher la période ici ou rien */}
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
              Derniers 6 mois
            </p>
          </div>

          <div className="flex space-x-3 sm:space-x-6 mt-2 sm:mt-4 md:mt-0 text-right">
            <div>
              <p className="text-[9px] sm:text-xs text-blue-500 uppercase font-bold mb-0.5 sm:mb-1">CA Total</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.ca)}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-red-500 uppercase font-bold mb-0.5 sm:mb-1">Charge total</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.charges)}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-xs text-green-600 uppercase font-bold mb-0.5 sm:mb-1">Moyenne</p>
              <p className="font-bold text-[10px] sm:text-sm text-gray-800 dark:text-gray-100">{formatCurrency(totals.moyenne)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-64 sm:h-80 md:h-96 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 animate-pulse text-xs sm:text-base">Chargement de l'évolution...</div>
          </div>
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

