import React from "react";

export default function Balance (){
  return (
    <div className="p-6 rounded-xl shadow-lg bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Balance Comptable</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">N° Compte</th>
            <th className="p-2 border">Intitulé du compte</th>
            <th className="p-2 border">Total Débit</th>
            <th className="p-2 border">Total Crédit</th>
            <th className="p-2 border">Solde Débit</th>
            <th className="p-2 border">Solde Crédit</th>
          </tr>
        </thead>

        <tbody>
            <tr>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
            </tr>
        </tbody>
      </table>
    </div>
  );
};

