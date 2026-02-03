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
import { fetchWithReauth } from '../../utils/apiUtils';

export default function LineChartROEROA({ globalDateStart, globalDateEnd }) {
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        // Récupérer les données ROE et ROA en parallèle
        const [roeResponse, roaResponse] = await Promise.all([
          fetchWithReauth(`/evolution-roe/`, { signal: abortController.signal }),
          fetchWithReauth(`/evolution-roa/`, { signal: abortController.signal })
        ]);

        const roeData = await roeResponse.json();
        const roaData = await roaResponse.json();

        if (!abortController.signal.aborted) {
          // Combiner les deux datasets
          const combined = roeData.evolution.map((roeItem, index) => ({
            mois: roeItem.mois,
            date: roeItem.date,
            roe: roeItem.roe,
            roa: roaData.evolution[index]?.roa || null
          }));

          setEvolutionData(combined);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur chargement évolution ROE/ROA:', error);
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
  }, []); // Removed dependencies on globalDateStart and globalDateEnd

  return (
    <div className="w-full h-80 md:h-96 relative">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Chargement de l'évolution ROE/ROA...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
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
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              formatter={(value) => (value !== null ? value.toFixed(2) + ' %' : '--')}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            {/* ROE - Bleu */}
            <Line
              type="monotone"
              dataKey="roe"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7, stroke: '#2563eb', strokeWidth: 2 }}
              name="ROE (Return on Equity)"
            />

            {/* ROA - Vert */}
            <Line
              type="monotone"
              dataKey="roa"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2 }}
              name="ROA (Return on Assets)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
