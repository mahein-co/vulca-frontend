import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BackToFormsPage from "../../../components/button/BackToFormsPage";
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";

export default function FactureForm() {
  // USE-NAVIGATE =======================================
  const navigate = useNavigate();
  // ITEMS DETAILS ===============================================
  const [items, setItems] = useState([
    { designation: "", quantite: 1, prix: 0, tva: 20 },
  ]);
  // STATE DATA TO GENERATE JOURNAL
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState({});

  // DATE TODAY: LIMIT DATE INPUT =================================
  const [today, setToday] = useState("");

  // ADD ITEM ====================================================
  const addItem = () => {
    setItems([...items, { designation: "", quantite: 1, prix: 0, tva: 20 }]);
  };

  // SAVE PIECE FACTURE =========================================
  const [
    actionSaveFacture,
    {
      isError: isErrorSaveFacture,
      isLoading: isLoadingSaveFacture,
      isSuccess: isSuccessSaveFacture,
      data: dataSaveFacture,
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

  // REMOVE ITEM =================================================
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // HANDLE ITEM CHANGE ==========================================
  const handleItemChange = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };

  // Calculs automatiques
  const totalHT = items.reduce(
    (sum, item) => sum + item.quantite * item.prix,
    0
  );

  // TOTAL TVA ======================================================
  const totalTVA = items.reduce(
    (sum, item) => sum + (item.quantite * item.prix * item.tva) / 100,
    0
  );

  // TOTAL TTC ======================================================
  const totalTTC = totalHT + totalTVA;

  // HANDLE SUBMIT FACTURE ==========================================
  const handleSubmitFacture = (e) => {
    e.preventDefault();
    const data = {
      piece_type: "Type facture",
      description_json: {
        address: e.target.address.value,
        date: e.target.dateFacture.value,
        details: items,
        totalHT,
        totalTVA,
        totalTTC,
        entreprise: e.target.entrepriseName.value,
        client: e.target.clientName.value,
        facture: e.target.factureNum.value,
        nif: e.target.nifFacture.value,
        rcs: e.target.rcsFacture.value,
        stat: e.target.statFacture.value,
      },
    };
    setDataToGenerateJournal(data);
    actionSaveFacture(data);
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

  // USE-EFFECT Save Facture ========================
  useEffect(() => {
    if (isLoadingSaveFacture && !isSuccessSaveFacture) {
      toast.loading("Enregistrement en cours...");
      return;
    }

    if (!isLoadingSaveFacture && isSuccessSaveFacture) {
      toast.dismiss();
      toast.success("Enregistrement avec succès!");
      const data = {
        ...dataToGenerateJournal,
        file_source: null,
        form_source: dataSaveFacture?.form_source.id,
      };
      actionGenerateJournal(data);
      return;
    }

    if (!isLoadingSaveFacture && isErrorSaveFacture) {
      toast.dismiss();
      toast.error("Error d'enregistrement!");
      return;
    }
  }, [
    isLoadingSaveFacture,
    isSuccessSaveFacture,
    isErrorSaveFacture,
    dataSaveFacture,
    actionGenerateJournal,
    dataToGenerateJournal,
  ]);

  // USE-EFFECT Date Today ==========================
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-900 text-slate-200 shadow-xl rounded-xl">
      <div className="flex items-center justify-between mb-7">
        <BackToFormsPage />
        <h3 className="text-2xl text-center">Facture</h3>
      </div>
      <form onSubmit={handleSubmitFacture} className="space-y-6">
        {/* --- Informations générales --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="entrepriseName" className="font-semibold">
              Entreprise :
            </label>
            <input
              type="text"
              required
              name="entrepriseName"
              id="entrepriseName"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Nom de l'entreprise"
            />
          </div>

          <div>
            <label htmlFor="clientName" className="font-semibold">
              Client :
            </label>
            <input
              required
              id="clientName"
              name="clientName"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Nom du client"
            />
          </div>

          <div>
            <label htmlFor="nifFacture" className="font-semibold">
              NIF :
            </label>
            <input
              type="text"
              required
              id="nifFacture"
              name="nifFacture"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="NIF"
            />
          </div>

          <div>
            <label htmlFor="rcsFacture" className="font-semibold">
              RCS :
            </label>
            <input
              type="text"
              required
              id="rcsFacture"
              name="rcsFacture"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Registre Commerce des Sociétés"
            />
          </div>

          <div>
            <label htmlFor="statFacture" className="font-semibold">
              Stat :
            </label>
            <input
              type="text"
              required
              id="statFacture"
              name="statFacture"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Stat"
            />
          </div>

          <div>
            <label htmlFor="factureNum" className="font-semibold">
              Numéro de facture :
            </label>
            <input
              required
              type="text"
              name="factureNum"
              id="factureNum"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="FAC-2025-001"
            />
          </div>

          <div>
            <label htmlFor="dateFacture" className="font-semibold">
              Date :
            </label>
            <input
              id="dateFacture"
              required
              max={today}
              type="date"
              name="dateFacture"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
            />
          </div>

          <div>
            <label htmlFor="address" className="font-semibold">
              Lieu :
            </label>
            <input
              id="address"
              required
              name="address"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Adresse ..."
            />
          </div>
        </div>

        {/* --- Tableau dynamique --- */}
        <div>
          <h3 className="text-xl font-normal mb-3">Détails de la facture</h3>

          <table className="w-full border">
            <thead className="text-gray-100 text-left">
              <tr>
                <th className="p-2 w-72 border">Désignation</th>
                <th className="p-2 border w-24">Qté</th>
                <th className="p-2 border w-32">Prix (Ar)</th>
                <th className="p-2 border w-28">TVA %</th>
                <th className="p-2 border w-32">Total HT (Ar)</th>
                <th className="p-2 border w-32">Total TTC (Ar)</th>
                <th className="p-2 border w-12"></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const totalHTLigne = item.quantite * item.prix;
                const totalTTCLigne =
                  totalHTLigne + (totalHTLigne * item.tva) / 100;

                return (
                  <tr key={index}>
                    <td className="p-2 border">
                      <input
                        required
                        className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                        value={item.designation}
                        onChange={(e) =>
                          handleItemChange(index, "designation", e.target.value)
                        }
                        placeholder="Produit ou service"
                      />
                    </td>

                    <td className="p-2 border">
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                        value={item.quantite}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantite",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td className="p-2 border">
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                        value={item.prix}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "prix",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td className="p-2 border">
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                        value={item.tva}
                        onChange={(e) =>
                          handleItemChange(index, "tva", Number(e.target.value))
                        }
                      />
                    </td>

                    <td className="p-2 border">
                      {totalHTLigne.toLocaleString("fr-FR")} Ar
                    </td>

                    <td className="p-2 border">
                      {totalTTCLigne.toLocaleString("fr-FR")} Ar
                    </td>

                    <td className="p-2 border text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Ajouter une ligne */}
          <button
            type="button"
            disabled={isLoadingSaveFacture}
            onClick={addItem}
            className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            <Plus size={18} />
            Ajouter une ligne
          </button>
        </div>

        {/* --- Totaux --- */}
        <div className="text-right text-lg space-y-1">
          <div>
            Total HT :{" "}
            <span className="font-bold">
              {totalHT.toLocaleString("fr-FR")} Ar
            </span>
          </div>
          <div>
            TVA totale :{" "}
            <span className="font-bold">
              {totalTVA.toLocaleString("fr-FR")} Ar
            </span>
          </div>
          <div>
            Total TTC :{" "}
            <span className="font-bold">
              {totalTTC.toLocaleString("fr-FR")} Ar
            </span>
          </div>
        </div>

        {/* --- Bouton enregistrer --- */}
        <button
          type="submit"
          disabled={isLoadingSaveFacture}
          className="mx-auto w-full lg:w-1/3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
        >
          Enregistrer la Facture
        </button>
      </form>
    </div>
  );
}
