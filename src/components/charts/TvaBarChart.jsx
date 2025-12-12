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

const tvaData = [
  {
    name: 'TVA',
    collected: 10537080,
    deductible: 5234500,
    net: 5292580,
  },
];

export default function TvaBarChart() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">TVA - Collectée / Déductible / Nette</h3>
      </div>
      <div className="w-full h-96 lg:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={tvaData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" stroke="#4b5563" />
            <YAxis stroke="#4b5563" width={80} tickFormatter={(v) => v.toLocaleString('fr-FR') + ' Ar'} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px' }}
              formatter={(value) => value.toLocaleString('fr-FR') + ' Ar'}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="collected" fill="#3b82f6" name="TVA collectée" radius={[6, 6, 0, 0]} />
            <Bar dataKey="deductible" fill="#10b981" name="TVA déductible" radius={[6, 6, 0, 0]} />
            <Bar dataKey="net" fill="#f59e0b" name="TVA nette" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
