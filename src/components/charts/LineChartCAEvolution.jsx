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

const caEvolutionData = [
  { month: 'Jan', ca2024: 28000000, ca2023: 22000000, ca2022: 18000000 },
  { month: 'Fév', ca2024: 32000000, ca2023: 25000000, ca2022: 20000000 },
  { month: 'Mar', ca2024: 38000000, ca2023: 30000000, ca2022: 24000000 },
  { month: 'Avr', ca2024: 42000000, ca2023: 35000000, ca2022: 28000000 },
  { month: 'Mai', ca2024: 45000000, ca2023: 38000000, ca2022: 31000000 },
  { month: 'Juin', ca2024: 50000000, ca2023: 42000000, ca2022: 35000000 },
  { month: 'Juil', ca2024: 48000000, ca2023: 40000000, ca2022: 33000000 },
  { month: 'Août', ca2024: 46000000, ca2023: 38000000, ca2022: 32000000 },
  { month: 'Sep', ca2024: 52000000, ca2023: 44000000, ca2022: 36000000 },
  { month: 'Oct', ca2024: 55000000, ca2023: 47000000, ca2022: 39000000 },
  { month: 'Nov', ca2024: 58000000, ca2023: 50000000, ca2022: 41000000 },
  { month: 'Déc', ca2024: 62000000, ca2023: 53000000, ca2022: 44000000 },
];

export default function LineChartCAEvolution() {
  return (
    <div className="w-full h-80 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={caEvolutionData} margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="month" 
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
          <Line
            type="monotone"
            dataKey="ca2024"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2 }}
            name="2024"
          />
          <Line
            type="monotone"
            dataKey="ca2023"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="8 8"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 1 }}
            name="2023"
          />
          <Line
            type="monotone"
            dataKey="ca2022"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 1 }}
            name="2022"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
