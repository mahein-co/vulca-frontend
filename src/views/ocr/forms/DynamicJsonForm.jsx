import PropType from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";
import { useSaveOneFileSourceMutation } from "../../../states/ocr/ocrApiSlice";
import { actionClearUploadedFiles } from "../../../states/ocr/ocrSlice";
import { useNavigate } from "react-router-dom";

DynamicJsonForm.propTypes = {
  initialData: PropType.object,
  setIsShowVerification: PropType.any,
};

export default function DynamicJsonForm({
  initialData,
  setIsShowVerification,
}) {
  // USE-NAVIGATE =======================================
  const navigate = useNavigate();
  // USE-DISPATCH =======================================
  const dispatch = useDispatch();

  // GLOBAL-STATE: selected file =================================
  const fileToSave = useSelector((states) => states.orcFiles.selectedFile);

  // LOCAL-STATE FORM DATA ================================
  const [formData, setFormData] = useState(initialData || {});

  // HANDLE CHANGE FORM JSON ============================
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save files uploaded to backend  =======================================
  const [
    actionSaveOneFileSource,
    {
      data: saveOneFileData,
      isLoading: isSavingOneFile,
      isSuccess: isSaveOneFileSuccess,
      isError: isSaveOneFileError,
      error: saveOneFileError,
    },
  ] = useSaveOneFileSourceMutation() || [];

  // GENERATE JOURANL ===============================
  const [
    actionGenerateJournal,
    {
      data: dataJournal,
      isError: isErrorJournal,
      isSuccess: isSuccessJournal,
      isLoading: isLoadingJournal,
      error: errorJournal,
    },
  ] = useGenerateJournalMutation() || [];

  // Handle save on file  ==========================================
  const handleSaveOneFile = () => {
    const fileData = new FormData();
    fileData.append("file", fileToSave);
    fileData.append("extracted_json", JSON.stringify(formData));
    actionSaveOneFileSource(fileData);
  };

  // HANDLE SUBMIT =======================================
  const handleSubmit = () => {
    handleSaveOneFile();
  };

  const handleGenerateJournal = useCallback(() => {
    if (saveOneFileData?.file_source.id) {
      const dataToSend = {
        ...formData,
        file_source: saveOneFileData?.file_source.id,
        form_source: null,
      };
      setFormData(dataToSend);
      actionGenerateJournal(dataToSend);
    } else {
      return;
    }
  }, [formData, saveOneFileData, actionGenerateJournal]);

  // USE-EFFECT: Save one file success =====================================
  useEffect(() => {
    if (isSavingOneFile && !isSaveOneFileSuccess) {
      toast.loading("Sauvegarde du fichier en cours...");
      return;
    }

    if (isSaveOneFileSuccess && !isSavingOneFile) {
      toast.dismiss();
      toast.success("Sauvegarde du fichier avec succès");
      handleGenerateJournal(); // OK
      return;
    }

    if (isSaveOneFileError && !isSavingOneFile) {
      toast.dismiss();
      toast.error(
        saveOneFileError?.data?.error || "Erreur lors de la sauvegarde."
      );
    }
  }, [
    isSaveOneFileSuccess,
    isSavingOneFile,
    isSaveOneFileError,
    saveOneFileError,
    saveOneFileData,
  ]);

  // USE-EFFECT: Generate Journal  =====================================
  useEffect(() => {
    if (isLoadingJournal) {
      toast.dismiss();
      toast.loading("Génération du journal en cours...");
      return;
    }
    if (isSuccessJournal && !isLoadingJournal) {
      toast.dismiss();
      toast.success("Journal généré avec succès !");
      dispatch(actionClearUploadedFiles());
      navigate("/app/classification");
      return;
    }

    if (!isLoadingJournal && isErrorJournal) {
      toast.dismiss();
      toast.error("Erreur de génération du journal");
      return;
    }
  }, [dispatch, isLoadingJournal, isSuccessJournal, navigate, isErrorJournal]);

  return (
    <React.Fragment>
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
          {Object.entries(formData).map(([key, value]) => {
            const isArray = Array.isArray(value);
            const isObject =
              (typeof value === "object" && !isArray && value !== null) ||
              value === saveOneFileData?.file_source.id;
            const isPrimitive = !isArray && !isObject;

            return (
              <div key={key} className="space-y-2">
                {/* Label principal */}
                <label className="block text-sm font-medium capitalize">
                  {key.replace(/_/g, " ")}
                </label>

                {/* ---------- Valeur simple ---------- */}
                {isPrimitive && (
                  <input
                    type="text"
                    className="w-full p-2 bg-slate-700 rounded-lg"
                    value={value ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                )}

                {/* ---------- Objet ---------- */}
                {isObject && (
                  <div className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-600">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey}>
                        <label className="block text-sm capitalize">
                          {subKey.replace(/_/g, " ")}
                        </label>
                        <input
                          className="w-full p-2 bg-slate-700 rounded-lg"
                          value={subValue ?? ""}
                          onChange={(e) =>
                            handleChange(key, {
                              field: subKey,
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ---------- Liste d'objets ---------- */}
                {isArray && (
                  <div className="space-y-4">
                    {value.map((item, indexItem) => (
                      <div
                        key={indexItem}
                        className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-600"
                      >
                        <h4 className="font-medium uppercase text-end">
                          {indexItem + 1} - {key.replace(/_/g, " ")}
                        </h4>

                        {Object.entries(item).map(([subKey, subValue]) => (
                          <div key={subKey}>
                            <label className="block text-sm capitalize">
                              {subKey.replace(/_/g, " ")}
                            </label>
                            <input
                              className="w-full p-2 bg-slate-700 rounded-lg"
                              value={subValue ?? ""}
                              onChange={(e) =>
                                handleChange(key, {
                                  indexItem,
                                  field: subKey,
                                  value: e.target.value,
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          disabled={isSavingOneFile || isLoadingJournal}
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Enregistrer les modifications
        </button>
      </div>
    </React.Fragment>
  );
}
