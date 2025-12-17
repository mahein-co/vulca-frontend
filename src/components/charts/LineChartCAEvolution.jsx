import React, { useState, useMemo } from 'react';
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
import { useGetChiffreAffaireMensuelQuery, useGetChiffreAffaireAnnuelQuery } from '../../states/compta/comptaApiSlice';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function LineChartCAEvolution() {
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'
  const currentYear = new Date().getFullYear();

  // Fetch data for the last 3 years for monthly comparison
  const { data: dataCurrent } = useGetChiffreAffaireMensuelQuery(currentYear.toString());
  const { data: dataYearMinus1 } = useGetChiffreAffaireMensuelQuery((currentYear - 1).toString());

  // Fetch annual data
  const { data: dataAnnual } = useGetChiffreAffaireAnnuelQuery();

  const processedData = useMemo(() => {
    if (viewMode === 'annual') {
        if (!dataAnnual) return [];
        return dataAnnual.map(item => ({
            name: item.periode, // Year like "2024"
            ca: parseFloat(item.chiffre_affaire)
        }));
    }

    // Monthly view: merge 2 years (Current and N-1)
    const merged = MONTHS.map((monthName, index) => {
        const monthNum = (index + 1).toString().padStart(2, '0');
        
        const findVal = (data, year) => {
            if (!data) return 0;
            const found = data.find(d => d.periode === `${year}-${monthNum}`);
            return found ? parseFloat(found.chiffre_affaire) : 0;
        };

        return {
            name: monthName,
            [`ca${currentYear}`]: findVal(dataCurrent, currentYear),
            [`ca${currentYear - 1}`]: findVal(dataYearMinus1, currentYear - 1),
        };
    });

    return merged;
  }, [viewMode, dataAnnual, dataCurrent, dataYearMinus1, currentYear]);

  return (
    <div className="w-full h-80 md:h-96 relative">
      <div className="absolute top-0 right-0 z-10 flex gap-2">
          <button 
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Mensuel
          </button>
          <button 
            onClick={() => setViewMode('annual')}
            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'annual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Annuel
          </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 30, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            stroke="#4b5563"
          />
          <YAxis 
            stroke="#4b5563" 
            width={60}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
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
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {viewMode === 'monthly' ? (
            <>
                <Line
                    type="monotone"
                    dataKey={`ca${currentYear}`}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2 }}
                    name={`Année actuelle (${currentYear})`}
                />
                <Line
                    type="monotone"
                    dataKey={`ca${currentYear - 1}`}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="8 8"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 1 }}
                    name={`Année N-1 (${currentYear - 1})`}
                />
            </>
          ) : (
            <Line
                type="monotone"
                dataKey="ca"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2 }}
                name="Chiffre d'Affaires"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
