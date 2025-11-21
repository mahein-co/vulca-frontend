import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const verticalData = [
  { month: 'Jan', ventes: 4000 },
  { month: 'Fév', ventes: 3200 },
  { month: 'Mar', ventes: 5100 },
  { month: 'Avr', ventes: 4800 },
  { month: 'Mai', ventes: 6200 },
  { month: 'Juin', ventes: 5900 },
];

const horizontalData = [
  { category: 'Salaires', charges: 50000 },
  { category: 'Loyer', charges: 15000 },
  { category: 'Électricité', charges: 8000 },
  { category: 'Fournitures', charges: 5000 },
  { category: 'Transport', charges: 12000 },
];

export default function BarCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* --- Vertical Chart --- */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Ventes par Mois (Vertical)
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={verticalData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
              <Bar dataKey="ventes" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Ventes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Horizontal Chart --- */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comparaison des Charges (Horizontal)
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={horizontalData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="category" stroke="#6b7280" width={115} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="charges" fill="#10b981" radius={[0, 8, 8, 0]} name="Charges" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
