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

export default function LineChartCAEvolution() {
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

        const maxDate = dateRangeData.max_date
          ? new Date(dateRangeData.max_date)
          : new Date();

        const monthPromises = [];

        for (let i = 5; i >= 0; i--) {
          const monthEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() - i + 1, 0);
          const monthStart = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);

          const dateStart = monthStart.toISOString().split('T')[0];
          const dateEnd = monthEnd.toISOString().split('T')[0];
          const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

          monthPromises.push(
            Promise.all([
              fetch(`${BASE_URL_API}/chiffre-affaire/?date_start=${dateStart}&date_end=${dateEnd}`, {
                signal: abortController.signal
              }).then(res => res.json()),
              fetch(`${BASE_URL_API}/repartition-resultat/?date_start=${dateStart}&date_end=${dateEnd}`, {
                signal: abortController.signal
              }).then(res => res.json())
            ])
              .then(([caData, repartitionData]) => {
                const ca = Number(caData.chiffre_affaire || 0);
                const totalCharges = repartitionData.comparison?.find(item => item.label === 'Charges')?.montant || 0;
                const resultatNet = ca - totalCharges;

                return {
                  name: monthName,
                  ca: ca,
                  charges: totalCharges,
                  resultatNet: resultatNet
                };
              })
          );
        }

        const monthsData = await Promise.all(monthPromises);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-2">
          <div>
            {/* Titre déjà affiché par le parent, on peut afficher la période ici ou rien */}
            <p className="text-xs text-gray-400 mt-1">
              Derniers 6 mois
            </p>
          </div>

          <div className="flex space-x-6 mt-4 md:mt-0 text-right">
            <div>
              <p className="text-xs text-blue-500 uppercase font-bold mb-1">CA Total</p>
              <p className="font-bold text-sm text-gray-800">{formatCurrency(totals.ca)}</p>
            </div>
            <div>
              <p className="text-xs text-red-500 uppercase font-bold mb-1">Charge total</p>
              <p className="font-bold text-sm text-gray-800">{formatCurrency(totals.charges)}</p>
            </div>
            <div>
              <p className="text-xs text-green-600 uppercase font-bold mb-1">Moyenne</p>
              <p className="font-bold text-sm text-gray-800">{formatCurrency(totals.moyenne)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-80 md:h-96 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 animate-pulse">Chargement de l'évolution...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                height={50}
                dy={10}
              />
              <YAxis
                stroke="#9ca3af"
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={-5} textAnchor="end" fill="#666" fontSize={10}>
                      {new Intl.NumberFormat('fr-FR').format(payload.value)}
                    </text>
                    <text x={0} y={0} dy={10} textAnchor="end" fill="#999" fontSize={8}>
                      Ar
                    </text>
                  </g>
                )}
                tickLine={false}
                axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ top: -10, right: 0, fontSize: '12px' }}
              />

              <Line
                type="monotone"
                dataKey="charges"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Charges"
              />
              <Line
                type="monotone"
                dataKey="ca"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Chiffre d'Affaires"
              />
              <Line
                type="monotone"
                dataKey="resultatNet"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Résultat"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

