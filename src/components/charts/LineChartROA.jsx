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

export default function LineChartROA({ globalDateStart, globalDateEnd }) {
  const [evolutionData, setEvolutionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        // Ne pas envoyer de paramètres de dates pour utiliser les 6 derniers mois par défaut
        let url = `/evolution-roa/`;

        const response = await fetchWithReauth(url, {
          signal: abortController.signal
        });
        const data = await response.json();

        if (!abortController.signal.aborted) {
          setEvolutionData(data.evolution || []);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur chargement évolution ROA:', error);
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
          <div className="text-gray-500">Chargement de l'évolution du ROA...</div>
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
