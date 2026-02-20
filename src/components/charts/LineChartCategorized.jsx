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
import { getApiHeaders, fetchWithReauth } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';
import LoadingOverlay from '../../components/layout/LoadingOverlay';

// Configuration des catégories et métriques
const METRICS_CONFIG = {
  'Rentabilité': [
    { key: 'roe', name: 'ROE', endpoint: '/evolution-roe/', color: '#3b82f6', dataKey: 'roe', unit: '%', useGlobalDates: true },
    { key: 'roa', name: 'ROA', endpoint: '/evolution-roa/', color: '#10b981', dataKey: 'roa', unit: '%', useGlobalDates: true },
    { key: 'marge_op', name: 'Marge Opérationnelle', endpoint: '/evolution-marge-operationnelle/', color: '#ec4899', dataKey: 'marge_op', unit: '%', useGlobalDates: true },
  ],
  'Trésorerie': [
    { key: 'tresorerie', name: 'Trésorerie', endpoint: '/evolution-tresorerie/', color: '#06b6d4', dataKey: 'montant', unit: 'Ar', useGlobalDates: true },
    { key: 'caf', name: 'CAF', endpoint: '/evolution-caf/', color: '#10b981', dataKey: 'montant', unit: 'Ar', useGlobalDates: true },
  ],
  'Marges': [
    { key: 'marge_brute', name: 'Marge Brute', endpoint: '/evolution-marges/', color: '#f97316', dataKey: 'marge_brute', unit: '%', useGlobalDates: true },
    { key: 'marge_nette', name: 'Marge Nette', endpoint: '/evolution-marges/', color: '#a855f7', dataKey: 'marge_nette', unit: '%', useGlobalDates: true },
  ],
  'Activité': [
    { key: 'delais_clients', name: 'Délais Clients', endpoint: '/evolution-delais-clients/', color: '#3b82f6', dataKey: 'delais_jours', unit: 'j', useGlobalDates: true },
    { key: 'delais_fournisseurs', name: 'Délais Fournisseurs', endpoint: '/evolution-delais-fournisseurs/', color: '#10b981', dataKey: 'delais_jours', unit: 'j', useGlobalDates: true },
  ],
  'Financière': [
    { key: 'leverage', name: 'Leverage Brut', endpoint: '/evolution-leverage-brut/', color: '#f59e0b', dataKey: 'leverage', unit: '', useGlobalDates: true },
    { key: 'bfr', name: 'BFR', endpoint: '/evolution-bfr/', color: '#ec4899', dataKey: 'bfr', unit: 'Ar', useGlobalDates: true },
    { key: 'ebe', name: 'EBE', endpoint: '/evolution-ebe/', color: '#8b5cf6', dataKey: 'ebe', unit: 'Ar', useGlobalDates: true },
  ]
};

export default function LineChartCategorized({ globalDateStart, globalDateEnd }) {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Rentabilité');
  const [selectedMetrics, setSelectedMetrics] = useState(['roe', 'roa', 'marge_op']);
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRangeDisplay, setDateRangeDisplay] = useState('');
  const projectId = useProjectId();

  // Récupérer les métriques de la catégorie sélectionnée
  const availableMetrics = METRICS_CONFIG[selectedCategory] || [];

  // Charger les données quand la catégorie ou les métriques changent
  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        // Récupérer les métriques sélectionnées
        const metricsToFetch = availableMetrics.filter(m => selectedMetrics.includes(m.key));

        if (metricsToFetch.length === 0) {
          setEvolutionData([]);
          setLoading(false);
          return;
        }

        // Récupérer les données pour chaque métrique en parallèle
        const promises = metricsToFetch.map(metric => {
          let url = metric.endpoint;

          // Si la métrique utilise les dates globales, les ajouter à l'URL
          if (metric.useGlobalDates && globalDateStart && globalDateEnd) {
            url += `?date_start=${globalDateStart}&date_end=${globalDateEnd}`;
          }

          // Nettoyer l'URL si elle contient BASE_URL_API (fetchWithReauth ajoute automatiquement BASE_URL sauf si http)
          // Mais ici metric.endpoint est juste le path (ex: /evolution-roe/)
          // Sauf qu'on a ajouté BASE_URL_API ligne 72. 

          // Correction: remove BASE_URL_API pre-pend logic manually or let fetchWithReauth handle full url?
          // fetchWithReauth checks "if (!url.startsWith('http'))"
          // So if we pass full url, it uses it.

          return fetchWithReauth(url, {
            signal: abortController.signal
          })
            .then(res => res.json())
            .then(data => ({ metric, data: data.evolution || [] }));
        });

        const results = await Promise.all(promises);

        if (!abortController.signal.aborted) {
          // Combiner les datasets
          const combined = results[0].data.map((item, index) => {
            const dataPoint = {
              mois: item.mois,
              date: item.date
            };

            // Ajouter les valeurs de chaque métrique
            results.forEach(result => {
              const metricValue = result.data[index]?.[result.metric.dataKey];
              dataPoint[result.metric.key] = metricValue;
            });

            return dataPoint;
          });

          setEvolutionData(combined);

          // Formater la plage de dates pour l'affichage
          if (globalDateStart && globalDateEnd) {
            const sObj = new Date(globalDateStart);
            const eObj = new Date(globalDateEnd);
            const startDateStr = sObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            const endDateStr = eObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            setDateRangeDisplay(`${startDateStr} - ${endDateStr}`);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur chargement évolution métriques:', error);
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
  }, [selectedCategory, selectedMetrics, globalDateStart, globalDateEnd, projectId]);

  // Gérer le changement de catégorie
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Sélectionner toutes les métriques de la nouvelle catégorie par défaut
    const newMetrics = METRICS_CONFIG[category].map(m => m.key);
    setSelectedMetrics(newMetrics);
  };

  // Gérer le changement de sélection de métrique
  const handleMetricToggle = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.filter(k => k !== metricKey);
      } else {
        return [...prev, metricKey];
      }
    });
  };

  // Formater les valeurs pour le tooltip
  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '--';
    if (unit === '%') return `${value.toFixed(2)}%`;
    if (unit === 'Ar') return `${value.toLocaleString('fr-FR')} Ar`;
    if (unit === 'j') return `${value.toFixed(0)} jours`;
    if (unit === '') return value.toFixed(2);
    return value.toString();
  };

  return (
    <div className="w-full">
      {/* Date Range Display */}
      {!loading && dateRangeDisplay && (
        <div className="mb-3 pl-1 sm:pl-2">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
            {dateRangeDisplay}
          </p>
        </div>
      )}

      {/* Sélection de catégorie */}
      {/* Sélection de catégorie */}
      <div className="mb-2 sm:mb-4 flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
        {Object.keys(METRICS_CONFIG).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all ${selectedCategory === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sélection de métriques */}
      <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="text-[10px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Métriques :</p>
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          {availableMetrics.map(metric => (
            <label key={metric.key} className="flex items-center gap-1 sm:gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.key)}
                onChange={() => handleMetricToggle(metric.key)}
                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <span className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <span
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                ></span>
                {metric.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="w-full h-64 sm:h-80 md:h-96 relative">
        {loading ? (
          <LoadingOverlay message="Chargement des métriques..." fullScreen={false} />
        ) : selectedMetrics.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-base text-center px-4">Sélectionnez une métrique</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f3f4f6"} />
              <XAxis
                dataKey="mois"
                stroke={isDarkMode ? "#4b5563" : "#4b5563"}
                tick={{ fontSize: 9, fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
                angle={-15}
                textAnchor="end"
                height={40}
                interval={0}
              />
              <YAxis
                stroke={isDarkMode ? "#4b5563" : "#4b5563"}
                tick={{ fontSize: 9, fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
                width={35}
                tickFormatter={(value) => {
                  const firstMetric = availableMetrics.find(m => selectedMetrics.includes(m.key));
                  if (firstMetric?.unit === '%') return `${value.toFixed(0)}%`;
                  if (firstMetric?.unit === 'Ar') return `${(value / 1000).toFixed(0)}k`;
                  return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value);
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  padding: '8px',
                  fontSize: '11px',
                  color: isDarkMode ? '#f3f4f6' : '#374151'
                }}
                itemStyle={{ color: isDarkMode ? '#f3f4f6' : '#374151' }}
                labelStyle={{ fontWeight: 'bold', color: isDarkMode ? '#f3f4f6' : '#1f2937', marginBottom: '2px' }}
                formatter={(value, name) => {
                  const metric = availableMetrics.find(m => m.key === name);
                  return [formatValue(value, metric?.unit), metric?.name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '10px' }} iconSize={8} />

              {/* Lignes pour chaque métrique sélectionnée */}
              {availableMetrics
                .filter(metric => selectedMetrics.includes(metric.key))
                .map(metric => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ fill: metric.color, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    name={metric.name}
                    connectNulls={true}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
