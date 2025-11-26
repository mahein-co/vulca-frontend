import React, { useState, useEffect } from "react";
import { Database, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const journalTypes = {
  sales: { label: "Journal des Ventes", type_journal: "VENTE" },
  purchases: { label: "Journal des Achats", type_journal: "ACHAT" },
  treasury: { label: "Journal de Trésorerie", type_journal: "BANQUE" },
  misc: { label: "Journal des Opérations Diverses", type_journal: "OD" },
};

const PAGE_SIZE = 3;

const Classification = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState("sales");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState(null);

  
  const [totalsByType, setTotalsByType] = useState({
    sales: { count: 0, debit: 0, credit: 0 },
    purchases: { count: 0, debit: 0, credit: 0 },
    treasury: { count: 0, debit: 0, credit: 0 },
    misc: { count: 0, debit: 0, credit: 0 },
  });

  useEffect(() => {
    fetchJournals(1);
  }, [selectedJournal, showAll]);

  const fetchJournals = async (pageNumber = 1) => {
    setLoading(true);
    setMessage(null);

    try {
      const journalParam = journalTypes[selectedJournal].type_journal;

      const res = await fetch(
        `${API_BASE_URL}/journals/?type=${journalParam}&all=${showAll}&page=${pageNumber}`
      );

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();

      setJournals(data.results || []);
      setCount(data.count || 0);
      setPage(pageNumber);

      
      setTotalsByType((prev) => ({
        ...prev,
        [selectedJournal]: {
          count: data.totals?.count || 0,
          debit: data.totals?.debit || 0,
          credit: data.totals?.credit || 0,
        },
      }));
    } catch (err) {
      console.error(err);
      setMessage("Erreur: impossible de récupérer les journaux.");
    }

    setLoading(false);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg">
          <p className="font-bold">Information</p>
          <p>{message}</p>
        </div>
      )}

      {/* ✅ CARTES DES JOURNAUX */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {Object.entries(journalTypes).map(([key, info]) => {
          const isActive = selectedJournal === key;
          const totals = totalsByType[key];

          return (
            <div
              key={key}
              onClick={() => {
                setSelectedJournal(key);
                setPage(1);
              }}
              className={`bg-white rounded-xl shadow-lg p-4 border-2 cursor-pointer
                ${isActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-100 hover:shadow-xl"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{info.label}</h3>
                <Database size={20} className="text-blue-600" />
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {loading && isActive ? (
                    <Loader2 size={30} className="animate-spin mx-auto" />
                  ) : (
                    totals?.count || 0
                  )}
                </div>

                <div className="text-xs text-gray-600">écritures</div>

                <div className="text-xs text-gray-500 font-mono mt-2">
                  Débit: {totals?.debit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} Ar
                  <br />
                  Crédit: {totals?.credit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} Ar
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ SWITCH VOIR TOUT */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-gray-700 text-sm">Voir toutes les écritures</span>
        </label>
      </div>

      {/* ✅ TABLEAU */}
      <div className="bg-white rounded-xl shadow-2xl p-6">
        <h2 className="text-xl font-bold mb-6">
          {journalTypes[selectedJournal].label}
        </h2>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
          ) : journals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black">Date facture</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black">Compte</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black">Pièce</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-black">Libellé</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-black">Débit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-black">Crédit</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {journals.map((entry, idx) => (
                  <tr key={entry.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm text-black font-medium">
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-black">
                      {entry.numero_compte}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-800">
                      {entry.numero_piece}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {entry.libelle}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-black font-bold">
                      {parseFloat(entry.debit_ar).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-black font-bold">
                      {parseFloat(entry.credit_ar).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Database size={40} className="mx-auto mb-2 text-gray-300" />
              Aucune écriture dans ce journal
            </div>
          )}
        </div>

        {/* ✅ PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchJournals(p)}
                className={`px-3 py-1 rounded border ${
                  p === page ? "bg-blue-500 text-white" : "bg-white border-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classification;
