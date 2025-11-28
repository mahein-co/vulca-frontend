import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BackToFormsPage from "../../../components/button/BackToFormsPage";
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import toast from "react-hot-toast";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";
import { useNavigate } from "react-router-dom";

export default function BankForm() {
  // USE-NAVIGATE =======================================
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([
    { date: "", description: "", debit: 0, credit: 0 },
  ]);

  // STATE DATA TO GENERATE JOURNAL
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState({});
  // DATES STATES =======================================
  const [today, setToday] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // SAVE PIECE RELEVE BANCAIRE =========================================
  const [
    actionSaveReleveBancaire,
    {
      isError: isErrorSaveReleveBancaire,
      isLoading: isLoadingSaveReleveBancaire,
      isSuccess: isSuccessSaveReleveBancaire,
      data: dataSaveReleveBancaire,
    },
  ] = useSavePieceByFormularMutation() || [];

  // GENERATE JOURNAL ============================
  const [
    actionGenerateJournal,
    {
      isError: isErrorGenerateJournal,
      isLoading: isLoadingGenerateJournal,
      isSuccess: isSuccessGenerateJournal,
      error: errorGenerateJournal,
    },
  ] = useGenerateJournalMutation() || [];

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      { date: "", description: "", debit: 0, credit: 0 },
    ]);
  };

  const removeTransaction = (index) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const handleChange = (index, key, value) => {
    const updated = [...transactions];
    updated[index][key] = value;
    setTransactions(updated);
  };

  const totalDebit = transactions.reduce(
    (sum, t) => sum + Number(t.debit || 0),
    0
  );

  const totalCredit = transactions.reduce(
    (sum, t) => sum + Number(t.credit || 0),
    0
  );

  const soldeFinal = totalCredit - totalDebit;

  // HANDLE SUBMIT BON ACHAT ==========================================
  const handleSubmitBank = (e) => {
    e.preventDefault();
    const data = {
      piece_type: "Type Revelé Bancaire",
      description_json: {
        name_titulaire: e.target.fullName.value,
        account_number: e.target.accountNumber.value,
        bank_name: e.target.bankName.value,
        periode_date_start: e.target.startDate.value,
        periode_date_end: e.target.endDate.value,
        initial_sold: e.target.soldInitial.value,
        transactions_details: transactions,
        totalDebit,
        totalCredit,
        soldeFinal,
      },
    };
    setDataToGenerateJournal(data);
    actionSaveReleveBancaire(data);
  };

  // USE-EFFECT Generate Journal =============================
  useEffect(() => {
    if (isLoadingGenerateJournal && !isSuccessGenerateJournal) {
      toast.dismiss();
      toast.loading("Génération du journal en cours...");
      return;
    }

    if (!isLoadingGenerateJournal && isSuccessGenerateJournal) {
      toast.dismiss();
      toast.success("Génération du journal avec succès!");
      navigate("/app/classification");
      return;
    }

    if (!isLoadingGenerateJournal && isErrorGenerateJournal) {
      toast.dismiss();
      toast.error(errorGenerateJournal?.data.error || "Error de génération!");
      return;
    }
  }, [
    isLoadingGenerateJournal,
    isSuccessGenerateJournal,
    isErrorGenerateJournal,
    navigate,
    errorGenerateJournal,
  ]);

  // USE-EFFECT Save Form =============================
  useEffect(() => {
    if (isLoadingSaveReleveBancaire && !isSuccessSaveReleveBancaire) {
      toast.loading("Enregistrement en cours...");
      return;
    }

    if (!isLoadingSaveReleveBancaire && isSuccessSaveReleveBancaire) {
      toast.dismiss();
      toast.success("Enregistrement avec succès!");
      const data = {
        ...dataToGenerateJournal,
        file_source: null,
        form_source: dataSaveReleveBancaire?.form_source.id,
      };
      actionGenerateJournal(data);
      return;
    }

    if (!isLoadingSaveReleveBancaire && isErrorSaveReleveBancaire) {
      toast.dismiss();
      toast.error("Error d'enregistrement!");
      return;
    }
  }, [
    isLoadingSaveReleveBancaire,
    isSuccessSaveReleveBancaire,
    isErrorSaveReleveBancaire,
    dataToGenerateJournal,
    dataSaveReleveBancaire,
    actionGenerateJournal,
  ]);

  // USE-EFFECT Date Today =============================
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-900 text-slate-200 shadow-lg rounded-xl">
      <div className="flex items-center justify-between mb-7">
        <BackToFormsPage />
        <h3 className="text-2xl text-center">Relevé Bancaire</h3>
      </div>

      <form onSubmit={handleSubmitBank} className="space-y-6">
        {/* Informations Compte */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="fullName" className="font-semibold">
              Nom du titulaire :
            </label>
            <input
              required
              id="fullName"
              name="fullName"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Nom et prénom"
            />
          </div>

          <div>
            <label className="font-semibold">Numéro du compte (RIB) :</label>
            <input
              required
              name="accountNumber"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Ex : 00001 00002 00003 00004"
            />
          </div>

          <div>
            <label className="font-semibold">Banque :</label>
            <input
              required
              name="bankName"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Ex : BNI, BMOI, BOA"
            />
          </div>

          <div>
            <label className="font-semibold">Période - Du :</label>
            <input
              type="date"
              required
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || today}
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold">Au :</label>
            <input
              type="date"
              name="endDate"
              required
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
              max={today}
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold">Solde initial (Ar) :</label>
            <input
              required
              type="number"
              name="soldInitial"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Ex : 1500000"
            />
          </div>
        </div>

        {/* Tableau Transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Transactions</h2>

          <table className="w-full border">
            <thead className="text-gray-100">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border w-32">Débit (Ar)</th>
                <th className="p-2 border w-32">Crédit (Ar)</th>
                <th className="p-2 border w-12"></th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border">
                    <input
                      required
                      type="date"
                      max={today}
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.date}
                      onChange={(e) =>
                        handleChange(index, "date", e.target.value)
                      }
                    />
                  </td>

                  <td className="p-2 border">
                    <input
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      placeholder="Ex : Paiement, Virement, Retrait…"
                    />
                  </td>

                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.debit}
                      onChange={(e) =>
                        handleChange(index, "debit", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.credit}
                      onChange={(e) =>
                        handleChange(index, "credit", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="p-2 border text-center">
                    {transactions.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeTransaction(index)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Ajouter une transaction */}
          <button
            type="button"
            onClick={addTransaction}
            className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            Ajouter une transaction
          </button>
        </div>

        {/* Totaux */}
        <div className="text-right text-lg space-y-1 mt-4">
          <div>
            Total Débit :{" "}
            <span className="font-bold">
              {totalDebit.toLocaleString("fr-FR")} Ar
            </span>
          </div>
          <div>
            Total Crédit :{" "}
            <span className="font-bold">
              {totalCredit.toLocaleString("fr-FR")} Ar
            </span>
          </div>
          <div>
            Solde Final :{" "}
            <span
              className={`font-bold ${
                soldeFinal < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {soldeFinal.toLocaleString("fr-FR")} Ar
            </span>
          </div>
        </div>

        {/* Bouton Soumettre */}
        <button
          type="submit"
          className="mx-auto w-1/3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
        >
          Générer le relevé bancaire
        </button>
      </form>
    </div>
  );
}
