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

const top10AccountsData = [
  { account: '411000', label: 'Clients', movement: 450000000, pcg: 'PCG 2005' },
  { account: '401000', label: 'Fournisseurs', movement: 320000000, pcg: 'PCG 2005' },
  { account: '512000', label: 'Banques', movement: 280000000, pcg: 'PCG 2005' },
  { account: '411100', label: 'Clients - Ventes', movement: 245000000, pcg: 'PCG 2005' },
  { account: '401100', label: 'Fournisseurs - Achats', movement: 195000000, pcg: 'PCG 2005' },
  { account: '701000', label: 'Ventes de marchandises', movement: 180000000, pcg: 'PCG 2005' },
  { account: '601000', label: 'Achats de marchandises', movement: 165000000, pcg: 'PCG 2005' },
  { account: '411200', label: 'Clients - Services', movement: 145000000, pcg: 'PCG 2005' },
  { account: '521000', label: 'Caisse', movement: 128000000, pcg: 'PCG 2005' },
  { account: '401200', label: 'Fournisseurs - Services', movement: 112000000, pcg: 'PCG 2005' },
];

export default function BarCharts() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Top 10 des comptes les plus mouvementés</h3>
        <span className="text-xs sm:text-sm font-medium text-gray-500 mt-2 sm:mt-0">Référence : PCG 2005</span>
      </div>

      <div className="w-full h-96 lg:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10AccountsData} margin={{ top: 10, right: 30, left: 60, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
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
              formatter={(value, name) => {
                if (name === 'movement') {
                  return [value.toLocaleString('fr-FR') + ' Ar', 'Montant'];
                }
                return value;
              }}
              labelFormatter={(label) => {
                const data = top10AccountsData.find(d => d.account === label);
                return data ? `${data.account} - ${data.label}` : label;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="movement"
              fill="#3b82f6"
              name="Montant Mouvementé"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
