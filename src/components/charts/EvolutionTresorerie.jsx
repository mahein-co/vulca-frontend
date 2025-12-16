import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL_API } from "../../constants/globalConstants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function EvolutionTresorerie() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL_API}/evolution-tresorerie/`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <p className="text-gray-500">Chargement de la trésorerie...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Évolution de la trésorerie
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periode" />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("fr-FR").format(value) + " Ar"
            }
          />
          <Line
            type="monotone"
            dataKey="tresorerie"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
