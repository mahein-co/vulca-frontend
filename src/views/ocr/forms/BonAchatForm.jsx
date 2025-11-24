import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BackToFormsPage from "../../../components/button/BackToFormsPage";

export default function BonAchatForm() {
  const [items, setItems] = useState([
    { designation: "", quantite: 1, prix: 0 },
  ]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bon d'achat soumis : ", {
      items,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-slate-200 shadow-xl rounded-xl">
      <div className="flex items-center justify-between mb-7">
        <BackToFormsPage />
        <h3 className="text-2xl text-center">Formulaire d'un Bon d'Achat</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Informations générales --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Fournisseur :</label>
            <input
              type="text"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Ex : Société XXX"
            />
          </div>

          <div>
            <label className="font-semibold">Client :</label>
            <input
              type="text"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="Nom du client"
            />
          </div>

          <div>
            <label className="font-semibold">Référence du bon :</label>
            <input
              type="text"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
              placeholder="BA-2025-001"
            />
          </div>

          <div>
            <label className="font-semibold">Date :</label>
            <input
              type="date"
              className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold">Lieu :</label>
            <input
              type="text"
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
                      className="w-full rounded-md text-white py-2 px-3 text-base font-normal bg-slate-700 outline-none"
                      value={item.designation}
                      onChange={(e) =>
                        handleItemChange(index, "designation", e.target.value)
                      }
                      placeholder="Ex : Riz, Huile..."
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
          className="mx-auto w-1/3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
        >
          Enregistrer le Bon d'Achat
        </button>
      </form>
    </div>
  );
}
