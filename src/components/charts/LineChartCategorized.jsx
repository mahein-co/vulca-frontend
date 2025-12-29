import { useState, useEffect } from 'react';
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

// Configuration des catégories et métriques
const METRICS_CONFIG = {
  'Rentabilité': [
    { key: 'roe', name: 'ROE', endpoint: '/evolution-roe/', color: '#3b82f6', dataKey: 'roe', unit: '%', useGlobalDates: false },
    { key: 'roa', name: 'ROA', endpoint: '/evolution-roa/', color: '#10b981', dataKey: 'roa', unit: '%', useGlobalDates: false },
    { key: 'marge_op', name: 'Marge Opérationnelle', endpoint: '/evolution-marge-operationnelle/', color: '#ec4899', dataKey: 'marge_op', unit: '%', useGlobalDates: false },
  ],
  'Trésorerie': [
    { key: 'tresorerie', name: 'Trésorerie', endpoint: '/evolution-tresorerie/', color: '#06b6d4', dataKey: 'montant', unit: 'Ar', useGlobalDates: false },
    { key: 'caf', name: 'CAF', endpoint: '/evolution-caf/', color: '#10b981', dataKey: 'montant', unit: 'Ar', useGlobalDates: false },
  ],
  'Marges': [
    { key: 'marge_brute', name: 'Marge Brute', endpoint: '/evolution-marges/', color: '#f97316', dataKey: 'marge_brute', unit: '%', useGlobalDates: false },
    { key: 'marge_nette', name: 'Marge Nette', endpoint: '/evolution-marges/', color: '#a855f7', dataKey: 'marge_nette', unit: '%', useGlobalDates: false },
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
  const [selectedCategory, setSelectedCategory] = useState('Rentabilité');
  const [selectedMetrics, setSelectedMetrics] = useState(['roe', 'roa', 'marge_op']);
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          let url = `${BASE_URL_API}${metric.endpoint}`;
          
          // Si la métrique utilise les dates globales, les ajouter à l'URL
          if (metric.useGlobalDates && globalDateStart && globalDateEnd) {
            url += `?date_start=${globalDateStart}&date_end=${globalDateEnd}`;
          }
          
          return fetch(url, { signal: abortController.signal })
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
  }, [selectedCategory, selectedMetrics, globalDateStart, globalDateEnd]);

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
      {/* Sélection de catégorie */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {Object.keys(METRICS_CONFIG).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sélection de métriques */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Métriques à afficher :</p>
        <div className="flex gap-4 flex-wrap">
          {availableMetrics.map(metric => (
            <label key={metric.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.key)}
                onChange={() => handleMetricToggle(metric.key)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                ></span>
                {metric.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div className="w-full h-80 md:h-96 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500">Chargement des données...</div>
          </div>
        ) : selectedMetrics.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500">Sélectionnez au moins une métrique à afficher</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="mois" 
                stroke="#4b5563"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#4b5563"
                tickFormatter={(value) => {
                  const firstMetric = availableMetrics.find(m => selectedMetrics.includes(m.key));
                  if (firstMetric?.unit === '%') return `${value.toFixed(1)}%`;
                  if (firstMetric?.unit === 'Ar') return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                formatter={(value, name) => {
                  const metric = availableMetrics.find(m => m.key === name);
                  return [formatValue(value, metric?.unit), metric?.name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              {/* Lignes pour chaque métrique sélectionnée */}
              {availableMetrics
                .filter(metric => selectedMetrics.includes(metric.key))
                .map(metric => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={3}
                    dot={{ fill: metric.color, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    name={metric.name}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
