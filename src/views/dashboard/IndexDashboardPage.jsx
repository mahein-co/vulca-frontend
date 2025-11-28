import React from "react";
import ScoreCard from "../../components/card/ScoreCard";
import ChartCA from "../../components/charts/ChartCA.jsx";
import BarCharts from "../../components/charts/BarCharts.jsx";
import PieCamembert from "../../components/charts/PieChart.jsx";


export default function IndexDashboardPage() {
  const defaultData = {
    count: 0,
  };  
  return (
    <React.Fragment>
          <div className="p-8 bg-gray-800"> 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-black">
              
              {/* Journal des Ventes (avec une bordure bleue pour correspondre à l'image) */}
              <div className="rounded-xl p-0.5 shadow-xl">
                <ScoreCard 
                  title="Chiffre d'affaires" 
                  count={defaultData.count} 
 
                />
              </div>
              <ScoreCard 
                title="EBE" 
                count={defaultData.count} 
              />
              <ScoreCard 
                title="Bénéfice net" 
                count={defaultData.count} 
              />
              <ScoreCard 
                title="BFR" 
                count={defaultData.count} 
              />
            </div>
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
