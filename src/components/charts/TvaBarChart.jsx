import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BASE_URL_API } from '../../constants/globalConstants';

export default function TvaBarChart({ globalDateStart, globalDateEnd }) {
  const [tvaData, setTvaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Utiliser AbortController pour éviter les double-fetches en dev mode
    const abortController = new AbortController();
    
    // Calculer les 6 derniers mois à partir de la date MAX des factures
    const fetchTvaData = async () => {
      setLoading(true);
      try {
        // 1. Récupérer la date max des factures depuis l'API
        const dateRangeResponse = await fetch(`${BASE_URL_API}/journals/date-range/`, {
          signal: abortController.signal
        });
        const dateRangeData = await dateRangeResponse.json();
        
        // Utiliser la date max des factures, sinon la date de fin globale, sinon aujourd'hui
        const maxDate = dateRangeData.max_date 
          ? new Date(dateRangeData.max_date) 
          : (globalDateEnd ? new Date(globalDateEnd) : new Date());
        
        // 2. Préparer toutes les requêtes pour les 6 derniers mois
        const monthPromises = [];
        
        for (let i = 5; i >= 0; i--) {
          const monthEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() - i + 1, 0);
          const monthStart = new Date(maxDate.getFullYear(), maxDate.getMonth() - i, 1);
          
          const dateStart = monthStart.toISOString().split('T')[0];
          const dateEnd = monthEnd.toISOString().split('T')[0];
          const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

          // Ajouter la promesse au tableau (exécution parallèle)
          monthPromises.push(
            fetch(`${BASE_URL_API}/tva/?date_start=${dateStart}&date_end=${dateEnd}`, {
              signal: abortController.signal
            })
              .then(res => res.json())
              .then(data => ({
                name: monthName,
                collected: Number(data.tva_collectee || 0),
                deductible: Number(data.tva_deductible || 0),
                net: Number(data.tva_nette || 0),
              }))
          );
        }

        // 3. Exécuter toutes les requêtes en parallèle
        const monthsData = await Promise.all(monthPromises);
        
        if (!abortController.signal.aborted) {
          setTvaData(monthsData);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur chargement données TVA:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTvaData();

    // Cleanup: annuler les requêtes si le composant est démonté
    return () => {
      abortController.abort();
    };
  }, [globalDateStart, globalDateEnd]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full border-t-2 border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3 text-gray-400">📊</span>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            TVA - Évolution sur 6 mois (Collectée / Déductible / Nette)
          </h3>
        </div>
      </div>
      
      {loading ? (
        <div className="w-full h-96 lg:h-[450px] flex items-center justify-center">
          <div className="text-gray-500">Chargement des données TVA...</div>
        </div>
      ) : (
        <div className="w-full h-96 lg:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tvaData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
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
                width={100} 
                tickFormatter={(v) => (v / 1000).toFixed(0) + 'K Ar'} 
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                formatter={(value) => value.toLocaleString('fr-FR') + ' Ar'}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="collected" fill="#3b82f6" name="TVA collectée" radius={[6, 6, 0, 0]} />
              <Bar dataKey="deductible" fill="#10b981" name="TVA déductible" radius={[6, 6, 0, 0]} />
              <Bar dataKey="net" fill="#f59e0b" name="TVA nette" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
