import { PieChart as RechartsPie, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const productData = [
  { name: 'Produit A', value: 35, color: '#3b82f6' },
  { name: 'Produit B', value: 25, color: '#10b981' },
  { name: 'Produit C', value: 20, color: '#f59e0b' },
  { name: 'Produit D', value: 15, color: '#ef4444' },
  { name: 'Produit E', value: 5, color: '#8b5cf6' },
];

export default function PieCamembert() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition des Produits</h2>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie data={productData}>
            <Pie
              data={productData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} (${value}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {productData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
