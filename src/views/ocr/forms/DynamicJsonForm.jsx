import React, { useEffect, useState } from "react";
import PropType from "prop-types";
import { useSaveOneFileSourceMutation } from "../../../states/ocr/ocrApiSlice";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { actionSelectFile } from "../../../states/ocr/ocrSlice";
import { useGenerateJournalMutation } from "../../../states/journal/journalApiSlice";

DynamicJsonForm.propTypes = {
  initialData: PropType.object,
  setIsShowVerification: PropType.any,
};

export default function DynamicJsonForm({
  initialData,
  setIsShowVerification,
}) {
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

  const handleGenerateJournal = () => {
    const dataToSend = {
      ...formData,
      file_source: saveOneFileData?.file_source?.id,
    };
    setFormData(dataToSend);

    actionGenerateJournal(dataToSend);
  };

  // USE-EFFECT: Save one file success =====================================
  useEffect(() => {
    if (isSavingOneFile && !isSaveOneFileSuccess) {
      toast.loading("Sauvegarde du fichier en cours...");
      return;
    }

    if (isSaveOneFileSuccess && !isSavingOneFile) {
      toast.dismiss();
      toast.success("Sauvegarde du fichier avec succès");
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

  // USE-EFFECT: Save one file success =====================================
  useEffect(() => {
    if (isLoadingJournal) {
      toast.dismiss();
      toast.loading("Génération du journal en cours...");
      return;
    }
    if (isSuccessJournal && !isLoadingJournal) {
      toast.dismiss();
      toast.success("Journal généré avec succès !");
      return;
    }

    if (!isLoadingJournal && isErrorJournal) {
      toast.dismiss();
      toast.error("Erreur de génération du journal");
      return;
    }
  }, [isLoadingJournal, isSuccessJournal, isErrorJournal]);

  return (
    <React.Fragment>
      {isSaveOneFileSuccess ? (
        <React.Fragment>
          <button
            disabled={isLoadingJournal}
            onClick={handleGenerateJournal}
            className="bg-blue-600 rounded-lg text-slate-200 px-3 py-2"
          >
            Générer un journal
          </button>
        </React.Fragment>
      ) : (
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
            disabled={isSavingOneFile || isLoadingJournal}
            onClick={handleSubmit}
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </div>
      )}
    </React.Fragment>
  );
}
