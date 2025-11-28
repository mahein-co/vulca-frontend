import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BackToFormsPage from "../../../components/button/BackToFormsPage";
import toast from "react-hot-toast";
import { useSavePieceByFormularMutation } from "../../../states/ocr/ocrApiSlice";
import { useNavigate } from "react-router-dom";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";

export default function BonAchatForm() {
  // USE-NAVIGATE =======================================
  const navigate = useNavigate();

  // STATE DATA TO GENERATE JOURNAL
  const [dataToGenerateJournal, setDataToGenerateJournal] = useState({});

  const [items, setItems] = useState([
    { designation: "", quantite: 1, prix: 0 },
  ]);

  // DATE TODAY: LIMIT DATE INPUT =================================
  const [today, setToday] = useState("");

  // SAVE PIECE BON ACHAT =========================================
  const [
    actionSaveBonAchat,
    {
      isError: isErrorSaveBonAchat,
      isLoading: isLoadingSaveBonAchat,
      isSuccess: isSuccessSaveBonAchat,
      data: dataSaveBonAchat,
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

  const addItem = () => {
    setItems([...items, { designation: "", quantite: 1, prix: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };

  const totalGeneral = items.reduce(
    (sum, item) => sum + item.quantite * item.prix,
    0
  );

  // HANDLE SUBMIT BON ACHAT ==========================================
  const handleSubmitBonAchat = (e) => {
    e.preventDefault();
    const data = {
      piece_type: "Type bon d'achat",
      description_json: {
        fournisseur: e.target.fourinsseurAchat.value,
        client: e.target.clientAchat.value,
        reference_bon_achat: e.target.referenceAchat.value,
        rcs: e.target.rcsBonAchat.value,
        nif: e.target.nifBonAchat.value,
        stat: e.target.statBonAchat.value,
        num_bon_achat: e.target.bonAchatNum.value,
        date: e.target.dateBonAchat.value,
        address: e.target.address.value,
        details: items,
        totalGeneral,
      },
    };
    setDataToGenerateJournal(data);
    actionSaveBonAchat(data);
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

  // USE-EFFECT Save form =============================
  useEffect(() => {
    if (isLoadingSaveBonAchat && !isSuccessSaveBonAchat) {
      toast.loading("Enregistrement en cours...");
      return;
    }

    if (!isLoadingSaveBonAchat && isSuccessSaveBonAchat) {
      toast.dismiss();
      toast.success("Enregistrement avec succès!");
      const data = {
        ...dataToGenerateJournal,
        file_source: null,
        form_source: dataSaveBonAchat?.form_source.id,
      };
      actionGenerateJournal(data);
      return;
    }

    if (!isLoadingSaveBonAchat && isErrorSaveBonAchat) {
      toast.dismiss();
      toast.error("Error d'enregistrement!");
      return;
    }
  }, [
    isLoadingSaveBonAchat,
    isSuccessSaveBonAchat,
    dataToGenerateJournal,
    dataSaveBonAchat,
    isErrorSaveBonAchat,
    actionGenerateJournal,
  ]);

  // USE-EFFECT Date Today =============================
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-slate-200 shadow-xl rounded-xl">
      <div className="flex items-center justify-between mb-7">
        <BackToFormsPage />
        <h3 className="text-2xl text-center">Bon d'Achat</h3>
      </div>

      <form onSubmit={handleSubmitBonAchat} className="space-y-6">
        {/* --- Informations générales --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Fournisseur :</label>
            <input
              type="text"
              required
              name="fourinsseurAchat"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Ex : Société XXX"
            />
          </div>

          <div>
            <label className="font-semibold">Client :</label>
            <input
              type="text"
              name="clientAchat"
              required
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Nom du client"
            />
          </div>

          <div>
            <label className="font-semibold">Référence du bon :</label>
            <input
              type="text"
              name="referenceAchat"
              required
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="BA-2025-001"
            />
          </div>

          <div>
            <label htmlFor="rcsBonAchat" className="font-semibold">
              RCS :
            </label>
            <input
              type="text"
              required
              id="rcsBonAchat"
              name="rcsBonAchat"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Registre Commerce des Sociétés"
            />
          </div>

          <div>
            <label htmlFor="nifBonAchat" className="font-semibold">
              NIF :
            </label>
            <input
              type="text"
              required
              id="nifBonAchat"
              name="nifBonAchat"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="NIF"
            />
          </div>

          <div>
            <label htmlFor="statBonAchat" className="font-semibold">
              Stat :
            </label>
            <input
              type="text"
              required
              id="statBonAchat"
              name="statBonAchat"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Stat"
            />
          </div>

          <div>
            <label htmlFor="bonAchatNum" className="font-semibold">
              Numéro de BonAchat :
            </label>
            <input
              required
              type="text"
              name="bonAchatNum"
              id="bonAchatNum"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="FAC-2025-001"
            />
          </div>

          <div>
            <label htmlFor="dateBonAchat" className="font-semibold">
              Date :
            </label>
            <input
              id="dateBonAchat"
              required
              max={today}
              type="date"
              name="dateBonAchat"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold">Lieu :</label>
            <input
              type="text"
              required
              name="address"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Adresse..."
            />
          </div>
        </div>

        {/* --- Tableau dynamique des articles --- */}
        <div>
          <h3 className="text-lg font-normal mb-3">Détails du Bon d'Achat</h3>

          <table className="w-full border">
            <thead className="text-gray-100 text-left">
              <tr>
                <th className="p-2 border">Désignation</th>
                <th className="p-2 border">Quantité</th>
                <th className="p-2 border">Prix Unitaire (Ar)</th>
                <th className="p-2 border">Total (Ar)</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">
                    <input
                      type="text"
                      required
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.designation}
                      onChange={(e) =>
                        handleItemChange(index, "designation", e.target.value)
                      }
                      placeholder="Produit ou service"
                    />
                  </td>

                  <td className="p-2 border w-24">
                    <input
                      type="number"
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

                  <td className="p-2 border w-32">
                    <input
                      type="number"
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.prix}
                      onChange={(e) =>
                        handleItemChange(index, "prix", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="p-2 border w-32">
                    {item.quantite * item.prix} Ar
                  </td>

                  <td className="p-2 border w-12 text-center">
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
              ))}
            </tbody>
          </table>

          {/* Bouton ajouter une ligne */}
          <button
            type="button"
            disabled={isLoadingSaveBonAchat}
            onClick={addItem}
            className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            Ajouter un article
          </button>
        </div>

        {/* --- Total général --- */}
        <div className="text-right text-lg font-bold">
          Total Général : {totalGeneral.toLocaleString("fr-FR")} Ar
        </div>

        {/* Bouton soumettre */}
        <button
          type="submit"
          disabled={isLoadingSaveBonAchat}
          className="mx-auto w-1/3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
        >
          Enregistrer le Bon d'Achat
        </button>
      </form>
    </div>
  );
}
