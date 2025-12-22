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

  useEffect(() => {
    // Utiliser AbortController pour éviter les double-fetches
    const abortController = new AbortController();
    
    const fetchEvolutionData = async () => {
      setLoading(true);
      try {
        // 1. Récupérer la date max des factures
        const dateRangeResponse = await fetch(`${BASE_URL_API}/journals/date-range/`, {
          signal: abortController.signal
        });
        const dateRangeData = await dateRangeResponse.json();
        
        const maxDate = dateRangeData.max_date 
          ? new Date(dateRangeData.max_date) 
          : new Date();
        
        // 2. Préparer toutes les requêtes pour les 6 derniers mois
        const monthPromises = [];
        
        for (let i = 5; i >= 0; i--) {
          const monthEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() - i + 1, 0);
          const monthStart = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
          
          const dateStart = monthStart.toISOString().split('T')[0];
          const dateEnd = monthEnd.toISOString().split('T')[0];
          const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

          // Récupérer CA et Charges en parallèle pour chaque mois
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

        // 3. Exécuter toutes les requêtes en parallèle
        const monthsData = await Promise.all(monthPromises);
        
        if (!abortController.signal.aborted) {
          setEvolutionData(monthsData);
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

    // Cleanup
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="w-full h-80 md:h-96 relative">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Chargement de l'évolution...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#4b5563" 
              width={80}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K Ar`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              formatter={(value) => value.toLocaleString('fr-FR') + ' Ar'}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            {/* Chiffre d'Affaires - Bleu */}
            <Line
              type="monotone"
              dataKey="ca"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2 }}
              name="Chiffre d'Affaires"
            />
            
            {/* Charges - Rouge */}
            <Line
              type="monotone"
              dataKey="charges"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 5 }}
              activeDot={{ r: 7, stroke: '#dc2626', strokeWidth: 2 }}
              name="Charges"
            />
            
            {/* Résultat Net - Vert */}
            <Line
              type="monotone"
              dataKey="resultatNet"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2 }}
              name="Résultat Net"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
