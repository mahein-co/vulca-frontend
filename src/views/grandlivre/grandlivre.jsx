import React, { useState, useEffect } from "react";
import { formatDateToFrench } from '../../utils/dateFormat';
import Swal from "sweetalert2";
import { Database, Loader2, RefreshCw, BarChart3, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const PAGE_SIZE = 3;

/**
 * Formate un montant en devise Ar (Ariary) avec 2 décimales.
 * @param {number|string} amount
 * @returns {string}
 */
const formatAr = (amount) => {
  const value = parseFloat(amount || 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  }).format(value).replace("MGA", " Ar");
};

/**
 * Détermine les classes CSS pour le style du solde (Vert/Rouge/Gris).
 * @param {number} balance
 * @returns {string}
 */
const getSoldeStyle = (balance) =>
  balance > 0 ? "text-green-700" : (balance < 0 ? "text-red-700" : "text-gray-500");

/**
 * Renvoie l'étiquette et le montant formaté du solde (Débiteur/Créditeur).
 * @param {number} balance
 * @returns {string}
 */
const getSoldeLabel = (balance) => {
  const absBalance = Math.abs(balance);
  if (balance > 0) return `Solde Débiteur: ${formatAr(absBalance)}`;
  if (balance < 0) return `Solde Créditeur: ${formatAr(absBalance)}`;
  return formatAr(0);
};

// --- Composants Réutilisables (Mis à jour pour le design moderne) ---

const Card = ({ title, value, style, icon: Icon, color }) => {
  // Classes pour l'icône dans un cercle gris/neutre, sauf pour la couleur du mouvement
  const iconColor = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    gray: "text-gray-600",
  }[color] || "text-gray-600";

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase">{title}</h3>
        {/* L'icône utilise une couleur d'accent discrète ou la couleur du mouvement */}
        <div className={`p-1 rounded-full bg-gray-100`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      {/* La valeur principale utilise la couleur du solde (style) */}
      <div className={`text-xl font-extrabold ${style} font-mono`}>
        {value}
      </div>
    </div>
  );
};

const TableHeader = ({ children, align = 'left' }) => (
  <th
    className={`px-4 py-2 text-${align} text-xs font-semibold uppercase tracking-wider`}
  >
    {children}
  </th>
);

const TableCell = ({ children, align = 'left', className = '' }) => (
  <td className={`px-4 py-2 whitespace-nowrap text-${align} text-sm text-gray-800 ${className}`}>
    {children}
  </td>
);

const PaginationButton = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 rounded-lg text-sm font-medium transition bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
  >
    {children}
  </button>
);


// Composant GrandLivre
export default function GrandLivre() {
  // --- ÉTATS (Inchangé) ---
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [accountCategory, setAccountCategory] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);

  const [totals, setTotals] = useState({
    openingBalance: 0,
    closingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
  });

  const [firstDate, setFirstDate] = useState("");
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- LOGIQUE DE FETCHING (Inchangé) ---

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comptes/`);
      const data = await res.json();
      setAccounts(data);

      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].numero_compte);
      }
    } catch (error) {
      console.error("Erreur fetchAccounts:", error);
      Swal.fire("Erreur", "Erreur lors du chargement des comptes.", "error");
    }
  };

  const fetchGrandLivre = async (account, start, end) => {
    if (!account) return;
    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams({
        account,
        start_date: start || "",
        end_date: end || "",
      });

      const res = await fetch(`${API_BASE_URL}/grand-livre/?${params.toString()}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Erreur API: ${res.status}`);
      }

      const data = await res.json();

      setAccountLabel(data.accountLabel || "");
      setAccountCategory(data.category);
      setEntries(data.entries || []);
      setPage(1);

      setTotals({
        openingBalance: data.openingBalance,
        closingBalance: data.closingBalance,
        totalDebit: data.movements.totalDebit,
        totalCredit: data.movements.totalCredit,
      });

      if (data.firstDate) {
        setFirstDate(data.firstDate);
        setStartDate(data.firstDate);
      }

      if (data.today) {
        setToday(data.today);
        setEndDate(data.today);
      }

    } catch (error) {
      console.error("Erreur fetchGrandLivre:", error);
      setMessage("Erreur lors du chargement du Grand Livre.");
    } finally {
      setLoading(false);
    }
  };

  // --- EFFETS (Inchangé) ---

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchGrandLivre(selectedAccount);
    }
  }, [selectedAccount]);

  // --- LOGIQUE DE RENDU (Inchangé) ---

  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedEntries = entries.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);

  const handleFilterSubmit = () => {
    fetchGrandLivre(selectedAccount, startDate, endDate);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-extrabold text-gray-800 mb-5 flex items-center">
        <BarChart3 className="mr-2 text-blue-700" size={24} /> {/* Couleur principale */}
        Grand Livre Analytique
      </h1>

      {/* --- Message d'Alerte --- */}
      {message && (
        <div className="border-l-4 p-3 mb-6 rounded-lg shadow-md bg-red-50 border-red-500 text-red-700">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* --- FILTRES COMPACTS ET ALIGNÉS (Design Moderne) --- */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-100">
        <h2 className="text-base font-bold text-gray-700 mb-3">Critères de Recherche</h2>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">

          {/* Sélecteur de Compte */}
          <div className="flex-1 w-full lg:w-2/5">
            <label htmlFor="account-select" className="block mb-1 text-xs font-medium text-gray-600">Compte Général</label>
            <div className="relative">
              <select
                id="account-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                // Style épuré, accent bleu au focus
                className="w-full border border-gray-300 rounded-lg p-2 pr-8 text-sm appearance-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition duration-150 bg-gray-50 hover:bg-white text-gray-800 font-medium h-[40px]"
                disabled={loading || accounts.length === 0}
              >
                {accounts.length === 0 ? (
                  <option>Chargement des comptes...</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.numero_compte} value={acc.numero_compte}>
                      {acc.numero_compte} - {acc.libelle}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Sélecteurs de Date */}
          <div className="flex gap-4 w-full lg:w-2/5">
            <div className="flex-1">
              <label htmlFor="start-date" className="block mb-1 text-xs font-medium text-gray-600">Période du</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                min={firstDate}
                max={endDate || today}
                onChange={(e) => setStartDate(e.target.value)}
                // Style épuré, accent bleu au focus
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition duration-150 bg-gray-50 text-gray-800 h-[40px]"
                disabled={loading}
              />
            </div>

            <div className="flex-1">
              <label htmlFor="end-date" className="block mb-1 text-xs font-medium text-gray-600">Au</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value)}
                // Style épuré, accent bleu au focus
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition duration-150 bg-gray-50 text-gray-800 h-[40px]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Bouton de Génération */}
          <div className="w-full lg:w-1/5 pt-4 lg:pt-0">
            <button
              onClick={handleFilterSubmit}
              // Bouton avec couleur d'accent forte
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm h-[40px]"
              disabled={loading || !selectedAccount || !startDate || !endDate}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw className="mr-2" size={16} />}
              Générer
            </button>
          </div>
        </div>
      </div>

      {/* --- CARTE D'INFORMATION DU COMPTE (Design Épuré) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border-l-4 border-blue-600">
        <h2 className="text-base font-bold text-gray-800 mb-0.5">
          Compte Analysé : <span className="text-blue-700">{selectedAccount} - {accountLabel || "..."}</span>
        </h2>
        <p className="text-xs text-gray-500">
          Période : du **{formatDateToFrench(startDate)}** au **{formatDateToFrench(endDate)}**
        </p>
      </div>

      {/* --- TOTAUX ET MOUVEMENTS (Cards Modernes) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {/* Solde d'Ouverture */}
        <Card
          title="Solde d'Ouverture"
          value={getSoldeLabel(totals.openingBalance)}
          style={getSoldeStyle(totals.openingBalance)}
          icon={totals.openingBalance >= 0 ? TrendingUp : TrendingDown}
          color={totals.openingBalance >= 0 ? "green" : "red"}
        />

        {/* Mouvements Débit */}
        <Card
          title="Mouvements Débit"
          value={formatAr(totals.totalDebit)}
          style="text-gray-800" // Couleur neutre pour les montants bruts
          icon={TrendingUp}
          color="blue"
        />

        {/* Mouvements Crédit */}
        <Card
          title="Mouvements Crédit"
          value={formatAr(totals.totalCredit)}
          style="text-gray-800" // Couleur neutre pour les montants bruts
          icon={TrendingDown}
          color="red"
        />

        {/* Solde de Fermeture */}
        <Card
          title="Solde de Fermeture"
          value={getSoldeLabel(totals.closingBalance)}
          style={getSoldeStyle(totals.closingBalance)}
          icon={totals.closingBalance >= 0 ? TrendingUp : TrendingDown}
          color={totals.closingBalance >= 0 ? "green" : "red"}
        />
      </div>

      {/* --- TABLEAU DU GRAND LIVRE (Style Formel Monochromatique) --- */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

        <h2 className="text-lg font-bold p-4 border-b border-gray-200 text-gray-800">
          Détail des Écritures
        </h2>

        {loading ? (
          <div className="text-center py-10 text-blue-700">
            <Loader2 className="animate-spin mx-auto mb-3" size={30} />
            <p className="text-base font-medium">Chargement des écritures...</p>
          </div>
        ) : entries.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* En-tête gris foncé pour le contraste et la formalité */}
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Journal</TableHeader>
                    <TableHeader>Pièce</TableHeader>
                    <TableHeader>Libellé</TableHeader>
                    <TableHeader align="right">Débit</TableHeader>
                    <TableHeader align="right">Crédit</TableHeader>
                    <TableHeader align="right">Solde Cumulé</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedEntries.map((e, i) => (
                    <tr
                      key={startIndex + i}
                      // Lignes zébrées très subtiles, hover gris clair
                      className={`transition duration-150 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                    >
                      <TableCell className="text-sm">{formatDateToFrench(e.date)}</TableCell>
                      <TableCell className="text-sm">{e.journal_source || "OD"}</TableCell>
                      {/* Numéro de pièce accentué avec le bleu pour l'importance */}
                      <TableCell className="text-sm font-semibold text-blue-700">{e.numero_piece}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{e.libelle}</TableCell>
                      {/* Débit/Crédit avec couleurs comptables et police monospace */}
                      <TableCell align="right" className="font-mono text-green-700 font-medium text-sm">
                        {e.debit > 0 ? formatAr(e.debit) : "-"}
                      </TableCell>
                      <TableCell align="right" className="font-mono text-red-700 font-medium text-sm">
                        {e.credit > 0 ? formatAr(e.credit) : "-"}
                      </TableCell>
                      {/* Solde cumulé en Gras avec couleur conventionnelle */}
                      <TableCell align="right" className={`font-bold text-sm ${getSoldeStyle(e.solde_cumule)} font-mono`}>
                        {formatAr(Math.abs(e.solde_cumule))} <span className="font-normal text-xs ml-1 text-gray-500">{e.solde_cumule >= 0 ? "D" : "C"}</span>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t bg-gray-100 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 mb-2 md:mb-0">
                Page <span className="font-semibold">{page}</span> sur <span className="font-semibold">{totalPages}</span> ({entries.length} écritures au total)
              </p>
              <div className="flex gap-3">
                <PaginationButton
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  &larr; Précédent
                </PaginationButton>
                <PaginationButton
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Suivant &rarr;
                </PaginationButton>
              </div>
            </div>

          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Database size={40} className="mx-auto mb-3 text-gray-400" />
            <p className="text-base">Aucune écriture trouvée pour cette période.</p>
            <p className="text-sm">Veuillez ajuster le compte ou la période de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}