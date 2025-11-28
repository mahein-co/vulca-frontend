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
    <div className="w-full bg-slate-800 p-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Graphique */}
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Évolution du Chiffre d'Affaires</h2>
          <div className="w-full h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#4b5563" />
                <YAxis stroke="#4b5563" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="ca"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2 }}
                  name="Chiffre d'Affaires (Réel)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="8 8"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, stroke: '#059669', strokeWidth: 1 }}
                  name="Objectif"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}