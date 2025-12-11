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

const topAccountsData = [
  { account: '411000', movement: 125000, debit: 75000, credit: 50000 },
  { account: '401000', movement: 98000, debit: 58000, credit: 40000 },
  { account: '512000', movement: 87000, debit: 52000, credit: 35000 },
  { account: '411100', movement: 76000, debit: 45000, credit: 31000 },
  { account: '401100', movement: 65000, debit: 38000, credit: 27000 },
];

export default function BarChartTopAccounts() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 Comptes Mouvementés</h2>
      <div className="w-full h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topAccountsData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="account" stroke="#4b5563" />
            <YAxis stroke="#4b5563" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              formatter={(value) => value.toLocaleString('fr-FR') + ' €'}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="debit"
              fill="#ef4444"
              name="Débit"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="credit"
              fill="#3b82f6"
              name="Crédit"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
