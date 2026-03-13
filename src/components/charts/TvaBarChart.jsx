import { useState, useEffect } from 'react';
import { useTheme } from '../../states/context/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchWithReauth } from '../../utils/apiUtils';
import { useProjectId } from '../../hooks/useProjectId';
import LoadingOverlay from '../layout/LoadingOverlay';

export default function TvaBarChart({ globalDateStart, globalDateEnd, onLoad }) {
  const { isDarkMode } = useTheme();
  const [tvaData, setTvaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const projectId = useProjectId();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTvaData = async () => {
      setLoading(true);
      try {
        let dateStart, dateEnd;

        if (globalDateStart && globalDateEnd) {
          dateStart = globalDateStart;
          dateEnd = globalDateEnd;
        } else {
          // Fallback
          const dateRangeResponse = await fetchWithReauth(`/journals/date-range/`, {
            signal: abortController.signal
          });
          const dateRangeData = await dateRangeResponse.json();
          const maxDate = dateRangeData.max_date ? new Date(dateRangeData.max_date) : new Date();
          const startDateObj = new Date(maxDate);
          startDateObj.setMonth(startDateObj.getMonth() - 5);
          startDateObj.setDate(1);
          dateStart = startDateObj.toISOString().split('T')[0];
          dateEnd = maxDate.toISOString().split('T')[0];
        }

        const startObj = new Date(dateStart);
        const endObj = new Date(dateEnd);

        // Générer dynamiquement la liste des mois entre start et end
        const monthPromises = [];
        let current = new Date(startObj.getFullYear(), startObj.getMonth(), 1);

        while (current <= endObj) {
          const mStart = new Date(current.getFullYear(), current.getMonth(), 1);
          const mEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0); // Dernier jour du mois

          const ds = mStart.toISOString().split('T')[0];
          const de = mEnd.toISOString().split('T')[0];
          const monthLabel = mStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

          monthPromises.push(
            fetchWithReauth(`/tva/?date_start=${ds}&date_end=${de}`, {
              signal: abortController.signal
            })
              .then(res => res.json())
              .then(data => ({
                name: monthLabel,
                collected: Number(data.tva_collectee || 0),
                deductible: Number(data.tva_deductible || 0),
                net: Number(data.tva_nette || 0),
              }))
          );

          // Passer au mois suivant
          current.setMonth(current.getMonth() + 1);
        }

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
          if (onLoad) onLoad(false);
        }
      }
    };

    fetchTvaData();

    // Cleanup: annuler les requêtes si le composant est démonté
    return () => {
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDateStart, globalDateEnd, projectId]);

  // Calculer les données du dernier mois pour le résumé
  const latestData = tvaData.length > 0 ? tvaData[tvaData.length - 1] : { net: 0 };
  const netTva = latestData.net;
  const isToPay = netTva >= 0;

  // Formater la période globale pour l'affichage
  const startDateStr = tvaData.length > 0 ? tvaData[0].name : '';
  const endDateStr = tvaData.length > 0 ? tvaData[tvaData.length - 1].name : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 h-full border-t-2 border-gray-300 dark:border-gray-700 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
        {/* Partie Gauche: Titre, Date */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
            TVA collectée vs TVA déductible
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {startDateStr} - {endDateStr}
          </p>
        </div>

        {/* Partie Centrale: Légende Custom (responsive) */}
        {!loading && tvaData.length > 0 && (
          <div className="flex flex-wrap items-center justify-start lg:justify-center gap-3 sm:gap-4 order-last lg:order-none w-full lg:w-auto mt-2 lg:mt-0">
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">TVA collectée</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mr-2"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">TVA déductible</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] mr-2"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">TVA nette</span>
            </div>
          </div>
        )}

        {/* Partie Droite: Résumé Financier */}
        {!loading && tvaData.length > 0 && (
          <div className="flex items-center gap-4 border-l border-gray-100 dark:border-gray-700 pl-4 lg:border-none lg:pl-0">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">TVA nette</p>
              <p className={`text-base sm:text-lg font-bold text-emerald-500`}>
                {netTva.toLocaleString('fr-FR').replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ')} Ar
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Solde</p>
              <p className={`text-sm font-bold ${isToPay ? 'text-red-500' : 'text-emerald-500'}`}>
                {isToPay ? 'à décaisser' : 'Crédit TVA'}
              </p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full h-80 sm:h-96 relative">
          <LoadingOverlay message="Chargement des données TVA..." fullScreen={false} />
        </div>
      ) : (
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tvaData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#f3f4f6"} />
              <XAxis
                dataKey="name"
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
                tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke={isDarkMode ? "#4b5563" : "#9ca3af"}
                width={60}
                tickFormatter={(v) => (v / 1000).toLocaleString('fr-FR') + ' k'}
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
                formatter={(value) => [value.toLocaleString('fr-FR').replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ') + ' Ar', '']}
              />
              <Bar dataKey="collected" fill="#3b82f6" name="TVA collectée" radius={[2, 2, 0, 0]} maxBarSize={40} />
              <Bar dataKey="deductible" fill="#ef4444" name="TVA déductible" radius={[2, 2, 0, 0]} maxBarSize={40} />
              <Bar dataKey="net" fill="#10b981" name="TVA nette" radius={[2, 2, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
