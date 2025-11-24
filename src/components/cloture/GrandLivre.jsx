import React from "react";

const GrandLivre = () => {
  return (
    <div className="p-6 rounded-xl shadow-lg bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Grand Livre</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Numéro Pièce</th>
            <th className="p-2 border">Libellé</th>
            <th className="p-2 border">Débit</th>
            <th className="p-2 border">Crédit</th>
            <th className="p-2 border">Solde</th>
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
            </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GrandLivre;
