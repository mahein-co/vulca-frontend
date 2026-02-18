import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../states/context/ThemeContext';

const COLORS = ['#3b82f6', '#ef4444']; // Blue for Produits, Red for Charges

export default function PieChartRepartition({ data }) {
  const { isDarkMode } = useTheme();
  // If no data or empty, show a fallback or empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 md:h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  // Map backend data (label, montant) to Recharts format (name, value)
  const chartData = data.map(item => ({
    name: item.label,
    value: parseFloat(item.montant),
    percentage: parseFloat(item.pourcentage)
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-700 rounded shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          <p className="text-blue-600 dark:text-blue-400">{Number(value).toLocaleString('fr-FR').replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ')} Ar</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{percent}%</p>
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
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            stroke={isDarkMode ? "#1f2937" : "#fff"}
          >
            {chartData.map((entry, index) => (
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
