import React from "react";
import ScoreCard from "../../components/card/ScoreCard";
import ChartCA from "../../components/charts/ChartCA.jsx";
import BarCharts from "../../components/charts/BarCharts.jsx";
import PieCamembert from "../../components/charts/PieChart.jsx";

export default function IndexDashboardPage() { 
  
  return (
    <React.Fragment>
          <div className="p-8 grid grid-cols-4 gap-6 text-black">
            <ScoreCard title="Chiffre d'affaires (MGA)" value="4 500 000" variation={12} />
            <ScoreCard title="EBE (MGA)" value="120 000" variation={5} />
            <ScoreCard title="Bénéfice net (MGA)" value="750 000" variation={8} />
            <ScoreCard title="Trésorerie (MGA)" value="950 000" variation={-3} />
            <ScoreCard title="BFR (MGA)" value="400 000" variation={-6} />
            <ScoreCard title="Ratio D/C (MGA)" value="400 000" variation={-6} />
            <ScoreCard title="Total Actif (MGA)" value="400 000" variation={-6} />
            <ScoreCard title="Total Passif (MGA)" value="400 000" variation={-6} />
          </div>
          <div className="mb-8">
                <ChartCA />
          </div>
          <div>
                <BarCharts />
          </div>
          <div className="mt-10 grid grid-cols-1 grid-cols-2 gap-6 mb-8">
                <PieCamembert />
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques Rapides</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Revenu Total YTD</span>
                      <span className="text-2xl font-bold text-blue-600">745K€</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Dépenses YTD</span>
                      <span className="text-2xl font-bold text-red-600">320K€</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Profit Net YTD</span>
                      <span className="text-2xl font-bold text-green-600">425K€</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Marge Brute</span>
                      <span className="text-2xl font-bold text-orange-600">57%</span>
                    </div>
                  </div>
                </div>
              </div>
    </React.Fragment>
  );
}
