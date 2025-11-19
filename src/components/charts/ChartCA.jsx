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

const chartData = [
  { month: 'Jan', ca: 45000, target: 50000 },
  { month: 'Fév', ca: 52000, target: 50000 },
  { month: 'Mar', ca: 48000, target: 55000 },
  { month: 'Avr', ca: 61000, target: 55000 },
  { month: 'Mai', ca: 55000, target: 60000 },
  { month: 'Juin', ca: 67000, target: 60000 },
  { month: 'Juil', ca: 72000, target: 65000 },
  { month: 'Août', ca: 68000, target: 65000 },
  { month: 'Sep', ca: 75000, target: 70000 },
  { month: 'Oct', ca: 78000, target: 70000 },
  { month: 'Nov', ca: 82000, target: 75000 },
  { month: 'Déc', ca: 89000, target: 80000 },
];

export default function ChartCA() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Évolution du Chiffre d'Affaires</h2>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ca"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
              name="Chiffre d'Affaires"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              name="Objectif"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
