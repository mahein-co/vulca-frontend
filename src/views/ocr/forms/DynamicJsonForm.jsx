import React, { useState } from "react";
import PropType from "prop-types";

DynamicJsonForm.propTypes = {
  initialData: PropType.object,
  setIsShowVerification: PropType.any,
};

export default function DynamicJsonForm({
  initialData,
  setIsShowVerification,
}) {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Données modifiées :", formData);
  };

  return (
    <div className="p-6 mx-auto bg-slate-900 shadow-lg rounded-xl max-w-lg space-y-4">
      <div className="flex items-center justify-between gap-x-2">
        <button
          onClick={() => setIsShowVerification(false)}
          className="text-blue-600 text-sm"
        >
          Retour
        </button>
        <h3 className="text-lg font-semibold">
          Vérification des données extraites
        </h3>
      </div>

      <div className="space-y-3">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium capitalize">
              {key.replace(/_/g, " ")}
            </label>

            <input
              type="text"
              className="w-full p-2 bg-slate-700 rounded-lg"
              value={value ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Enregistrer les modifications
      </button>
    </div>
  );
}
