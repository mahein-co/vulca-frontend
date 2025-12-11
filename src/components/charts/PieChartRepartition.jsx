import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const detailedData = [
  { name: 'Ventes de produits', value: 450000000, category: 'Produits' },
  { name: 'Ventes de services', value: 250000000, category: 'Produits' },
  { name: 'Achats de matières', value: 180000000, category: 'Charges' },
  { name: 'Charges de personnel', value: 220000000, category: 'Charges' },
  { name: 'Charges externes', value: 95000000, category: 'Charges' },
  { name: 'Amortissements', value: 50000000, category: 'Charges' },
];

// Agrégation par catégorie
const repartitionData = [
  {
    name: 'Produits',
    value: detailedData
      .filter(item => item.category === 'Produits')
      .reduce((sum, item) => sum + item.value, 0),
  },
  {
    name: 'Charges',
    value: detailedData
      .filter(item => item.category === 'Charges')
      .reduce((sum, item) => sum + item.value, 0),
  },
];

const COLORS = ['#3b82f6', '#ef4444'];

export default function PieChartRepartition() {
  const total = repartitionData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = ((value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-blue-600">{value.toLocaleString('fr-FR')} Ar</p>
          <p className="text-gray-600 text-sm">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={repartitionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {repartitionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
