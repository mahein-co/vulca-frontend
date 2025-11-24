import React from "react";

const Journal = () => {
  // Données fictives du journal comptable
  return (
    <div className="p-6 rounded-xl shadow-lg bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Journal Comptable</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Numero piéce</th>
            <th className="p-2 border">Libellé</th>
            <th className="p-2 border">Compte</th>
            <th className="p-2 border">Débit</th>
            <th className="p-2 border">Crédit</th>
            <th className="p-2 border">Types journal</th>
          </tr>
        </thead>

        <tbody>
            <tr>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border"></td>
              <td className="p-2 border text-black-700"></td>
              <td className="p-2 border text-black-700"></td>
              <td className="p-2 border"></td>
            </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Journal;
