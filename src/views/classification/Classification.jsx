import React, { useState, useEffect, useRef } from "react";
import { Database, Loader2, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

// --- CONFIGURATION ---
const API_BASE_URL = process.env.REACT_APP_API_URL;

const journalTypes = {
  sales: { label: "Journal des Ventes", type_journal: "VENTE" },
  purchases: { label: "Journal des Achats", type_journal: "ACHAT" },
  treasury: { label: "Journal de Trésorerie", type_journal: "BANQUE" },
  misc: { label: "Journal des Opérations Diverses", type_journal: "OD" },
};

const PAGE_SIZE = 3;

const formatAr = (amount) => {
  const value = parseFloat(amount || 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  }).format(value).replace("MGA", " Ar");
};

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

  const controllerRef = useRef(null);

  useEffect(() => {
    fetchJournals(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJournal, showAll]);

  const fetchJournals = async (pageNumber = 1) => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setMessage(null);
    setPage(pageNumber);

    try {
      const journalParam = journalTypes[selectedJournal].type_journal;
      const res = await fetch(
        `${API_BASE_URL}/journals/?type=${journalParam}&all=${showAll}&page=${pageNumber}&size=${PAGE_SIZE}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();

      setJournals(data.results || []);
      setCount(data.count || 0);

      setTotalsByType((prev) => ({
        ...prev,
        [selectedJournal]: {
          count: data.totals?.count || 0,
          debit: data.totals?.debit || 0,
          credit: data.totals?.credit || 0,
        },
      }));
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        setMessage("Erreur: impossible de récupérer les journaux.");
        setJournals([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const handlePrev = () => {
    if (page > 1) fetchJournals(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchJournals(page + 1);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-5 flex items-center">
        <BarChart3 className="mr-2 text-blue-700" size={24} />
        Classification des Écritures
      </h1>

      {message && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg shadow-md">
          <p className="font-bold">Erreur</p>
          <p>{message}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(journalTypes).map(([key, info]) => {
          const isActive = selectedJournal === key;
          const totals = totalsByType[key];
          const activeClasses = isActive
            ? "border-blue-700 bg-blue-50 shadow-xl scale-[1.01]"
            : "border-gray-200 hover:shadow-lg hover:border-gray-300";

          return (
            <div
              key={key}
              onClick={() => {
                setSelectedJournal(key);
                setPage(1);
              }}
              className={`bg-white rounded-lg p-4 shadow-md border cursor-pointer transform transition-all duration-200 ${activeClasses}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 truncate">{info.label}</h3>
                <Database size={18} className={`${isActive ? "text-blue-700" : "text-gray-400"}`} />
              </div>

              <div className="text-left">
                <div className="text-2xl font-extrabold text-gray-800">
                  {loading && isActive ? <Loader2 size={20} className="animate-spin text-blue-700" /> : totals?.count.toLocaleString("fr-FR") || 0}
                </div>
                <div className="text-xs text-gray-500 mt-0">Écritures (Total)</div>

                <div className="text-[11px] font-mono text-gray-700 mt-3 pt-2 border-t border-gray-100 flex justify-between">
                  <span className="text-green-700 font-bold">DÉBIT: {formatAr(totals?.debit)}</span>
                  <span className="text-red-700 font-bold">CRÉDIT: {formatAr(totals?.credit)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex justify-end">
        <label className="flex items-center space-x-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="h-4 w-4 text-blue-700 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-700 font-medium">Voir toutes les écritures</span>
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <h2 className="text-lg font-bold p-4 text-gray-800 border-b border-gray-200">
          {journalTypes[selectedJournal].label}
        </h2>

        <div className="overflow-x-auto relative">

          {/* --- Overlay global de chargement --- */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
              <Loader2 size={32} className="animate-spin text-blue-700" />
            </div>
          )}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Date Facture</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Compte</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Pièce</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Libellé</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">Débit</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">Crédit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && journals.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
                : journals.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={`transition duration-150 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{entry.numero_compte}</td>
                    <td className="px-4 py-2 text-sm font-mono text-blue-700 font-semibold">{entry.numero_piece}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 max-w-[250px] truncate">{entry.libelle}</td>
                    <td className="px-4 py-2 text-right text-sm text-green-700 font-bold font-mono">{entry.debit_ar > 0 ? formatAr(entry.debit_ar) : "-"}</td>
                    <td className="px-4 py-2 text-right text-sm text-red-700 font-bold font-mono">{entry.credit_ar > 0 ? formatAr(entry.credit_ar) : "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && journals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Database size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-base">
                Aucune écriture trouvée pour ce journal {showAll ? " (Total)" : " (du jour)"}.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-0 p-4 bg-gray-100 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> sur <span className="font-semibold">{totalPages}</span> ({count} écritures trouvées)
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handlePrev}
              disabled={page === 1 || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              <ChevronLeft size={16} className="mr-1" />
              Précédent
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              Suivant
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classification;