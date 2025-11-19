import { BsFillCloudDownloadFill } from "react-icons/bs";
import PropType from "prop-types";
import React, { useEffect, useState } from "react";
import { BsTrash3Fill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";

import ExcelIcon from "../../../assets/icons/excel2.png";
import ImageIcon from "../../../assets/icons/image.png";
import PdfIcon from "../../../assets/icons/pdf.png";
import {
  actionClearUploadedFiles,
  actionRemoveFileByIndex,
} from "../../../states/ocr/ocrSlice";
import { calculateFileSizeInMB } from "../../../utils/utilsFunctions";
import {
  useSaveFileSourceMutation,
  useSaveOneFileSourceMutation,
} from "../../../states/ocr/ocrApiSlice";
import toast from "react-hot-toast";

const FileTypeUploaded = ({ fileType }) => {
  switch (fileType) {
    case "image":
      return (
        <img
          alt="File type selected"
          src={ImageIcon}
          className="size-16 rounded-full object-cover"
        />
      );
    case "pdf":
      return (
        <img
          alt="File type selected"
          src={PdfIcon}
          className="size-16 rounded-full object-cover"
        />
      );
    case "tableau":
      return (
        <img
          alt="File type selected"
          src={ExcelIcon}
          className="size-16 rounded-full object-cover"
        />
      );
    default:
      return;
  }
};

FilesUploadedList.propTypes = {
  files: PropType.array,
  totalFiles: PropType.number,
};

export default function FilesUploadedList({ files, totalFiles }) {
  // USE-DISPATCH =====================================
  const dispatch = useDispatch();
  // GLOBAL-STATES =====================================
  const fileType = useSelector((state) => state.orcFiles.fileType);
  // RTK-QUERY: Upload file with progress =====================================
  const [saveFileSource] = useSaveFileSourceMutation();
  // LOCAL-STATES: Progress map for each file =====================================
  const [progressMap, setProgressMap] = useState({});

  // GLOBAL-FUNCTIONS: Clear files list =====================================
  const cancelUploadFile = () => {
    dispatch(actionClearUploadedFiles());
  };

  // GLOBAL-FUNCTION: Delete file =====================================
  const deleteFileSelected = (index) => {
    dispatch(actionRemoveFileByIndex(index));
  };

  // Save files uploaded to backend  =====================================
  const [
    actionSaveOneFileSource,
    {
      isLoading: isSavingOneFile,
      isSuccess: isSaveOneFileSuccess,
      isError: isSaveOneFileError,
      error: saveOneFileError,
    },
  ] = useSaveOneFileSourceMutation() || [];

  // UPLOAD FILE ======================================
  const handleUpload = async () => {
    if (files.length === 0) return toast.error("Aucun fichier à uploader.");

    // On réinitialise la progression
    const initialProgress = {};
    files.forEach((f, idx) => (initialProgress[idx] = 0));
    setProgressMap(initialProgress);

    try {
      await saveFileSource({
        files,
        onProgress: (percent) => {
          // Appliquer la progression à tous les fichiers (si upload groupé)
          const newProgress = { ...progressMap };
          files.forEach((_, idx) => {
            newProgress[idx] = percent;
          });
          setProgressMap(newProgress);
        },
      }).unwrap();

      toast.success("Upload terminé avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur pendant l'upload");
    }
  };

  // Handle save on file  =====================================
  const handleSaveOneFile = (file) => {
    const fileData = new FormData();
    fileData.append("file", file);
    actionSaveOneFileSource(fileData);
  };

  // USE-EFFECT: Save one file success =====================================
  useEffect(() => {
    if (isSavingOneFile && !isSaveOneFileSuccess) {
      toast.loading("Sauvegarde du fichier en cours...");
    } else if (isSaveOneFileSuccess && !isSavingOneFile) {
      toast.dismiss();
      toast.success("Fichier sauvegardé avec succès !");
    } else if (isSaveOneFileError && !isSavingOneFile) {
      toast.dismiss();
      console.log(saveOneFileError);
      toast.error(
        `${saveOneFileError?.data?.error || "Erreur lors de la sauvegarde."}`
      );
    }
  }, [
    isSaveOneFileSuccess,
    isSavingOneFile,
    saveOneFileError,
    isSaveOneFileError,
  ]);

  return (
    <React.Fragment>
      <article className="rounded-3xl max-w-2xl w-full transition-all duration-1000 mx-auto border border-grey bg-slate-800 p-4">
        <div className="flex items-center gap-4 shadow-xl px-3 py-2 bg-slate-900 rounded-2xl justify-between">
          <div className="flex items-center">
            <FileTypeUploaded fileType={fileType} />

            <div className="flex items-center gap-x-3">
              <h3 className="text-lg font-normal text-white">
                Total files uploaded
                <span className="ml-1 py-2 px-3 text-sm rounded-xl bg-gray-700">
                  {totalFiles}
                </span>
              </h3>
              <button
                onClick={handleUpload}
                className="underline text-blue-600"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="flow-root">
            <div className="relative group inline-block">
              <button
                onClick={cancelUploadFile}
                className="text-sm font-medium text-gray-300 px-1"
              >
                <span class="sr-only">Close</span>
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div class="opacity-0 invisible group-hover:opacity-70 group-hover:visible absolute mt-1 bg-gray-800 text-slate-300 border border-gray-300 rounded-lg shadow-lg py-1 z-10">
                <p class="px-2 text-xs">Close</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 mx-auto rounded-2xl bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
          <ul className="space-y-2">
            {files.map((file, index) => {
              return (
                <React.Fragment>
                  <li key={index}>
                    <div className="p-4 sm:p-6 flex rounded-xl transition shadow-xl overflow-hidden bg-slate-900 border border-gray-700">
                      <div className="sm:flex sm:justify-between sm:gap-4 lg:gap-6">
                        <div className="relative group inline-block">
                          <div className="sm:shrink-0">
                            <button
                              onClick={() => deleteFileSelected(index)}
                              className="rounded-xl block bg-primary p-2 text-center text-xs font-bold text-white transition hover:bg-secondary"
                            >
                              <BsTrash3Fill />
                            </button>
                          </div>
                          <div class="opacity-0 invisible group-hover:opacity-70 group-hover:visible absolute mt-1 bg-gray-800 text-slate-300 border border-gray-300 rounded-lg shadow-lg py-1 z-10">
                            <p class="px-2 text-xs">Delete</p>
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                          <div className="flex w-full items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-pretty text-slate-200">
                                {file?.name}
                              </h3>

                              <p className="mt-1 text-sm text-grey">
                                {calculateFileSizeInMB(file?.size)}
                              </p>
                              {progressMap[index] > 0 && (
                                <React.Fragment>
                                  <div class="relative mt-1 w-64">
                                    <div class="flex mb-2 items-center justify-between">
                                      <div>
                                        <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                                          {progressMap[index] < 100
                                            ? "In Progress"
                                            : " Completed"}
                                        </span>
                                      </div>
                                      <div class="text-right">
                                        <span class="text-xs font-semibold inline-block text-teal-600">
                                          {progressMap[index]}%
                                        </span>
                                      </div>
                                    </div>
                                    <div class="flex rounded-full h-2 bg-gray-200">
                                      <div
                                        style={{
                                          width: `${progressMap[index]}%`,
                                        }}
                                        class="rounded-full bg-teal-500"
                                      ></div>
                                    </div>
                                  </div>
                                </React.Fragment>
                              )}
                            </div>

                            <div className="mt-2">
                              <button onClick={() => handleSaveOneFile(file)}>
                                <BsFillCloudDownloadFill />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </article>
    </React.Fragment>
  );
}
