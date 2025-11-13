import PropType from "prop-types";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { actionAddUploadedFiles } from "../../states/ocr/ocrSlice";

InputFileCard.propTypes = {
  imageUrl: PropType.string.isRequired,
  appName: PropType.string.isRequired,
  fileType: PropType.string.isRequired,
  description: PropType.string.isRequired,
  acceptFile: PropType.string.isRequired,
  numberOfFiles: PropType.number,
};

export default function InputFileCard({
  imageUrl,
  appName,
  fileType,
  description,
  acceptFile,
  numberOfFiles = 5,
}) {
  // USE-DISPATCH ==============================
  const dispatch = useDispatch();
  // GLOBAL STATE FOR SELECTED FILES ==============

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    else if (selectedFiles.length > numberOfFiles) {
      dispatch(
        actionAddUploadedFiles({
          uploadedFiles: selectedFiles.slice(0, numberOfFiles),
          fileType: fileType,
        })
      );
      toast.error(
        `You can only upload up to ${numberOfFiles} files at a time.`
      );
      return;
    }
    // Dispatch action to update Redux store
    dispatch(
      actionAddUploadedFiles({
        uploadedFiles: selectedFiles,
        fileType: fileType,
      })
    );
  };

  return (
    <React.Fragment>
      <div
        className="relative p-3 bg-slate-800 rounded-3xl flex overflow-hidden items-center min-w-[300px] cursor-pointer group"
        style={{ backgroundSize: "600px", backgroundImage: `url(${imageUrl})` }}
      >
        <input
          type="file"
          accept={acceptFile}
          multiple
          onChange={handleFileChange}
          className="absolute cursor-pointer inset-0 w-full h-full opacity-0 z-50"
        />
        <img
          className="z-50 h-5 w-5 absolute top-3 right-3 rounded-full outline outline-slate-800/15 transition duration-1000 group-hover:scale-[2] group-hover:rotate-[410deg] group-hover:-translate-y-3 group-hover:translate-x-3"
          height="20"
          width="20"
          src={imageUrl}
          alt="Icon"
        />
        <div className="absolute inset-0 ring-1 ring-slate-900/30 ring-inset bg-gradient-to-l from-slate-950/90 via-slate-900/50 to-black/20 rounded-2xl overflow-hidden"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <img
            className="h-16 w-16 rounded-2xl object-contain shadow-md border border-slate-900/20 transition duration-300 group-hover:scale-95"
            height="64"
            width="64"
            src={imageUrl}
            alt="Icon"
          />
          <div className="flex flex-col transition duration-300 group-hover:-translate-x-2">
            <div className="relative text-md font-semibold text-gray-100 cursor-pointer after:transition-[width] after:ease-in-out after:duration-700 after:absolute after:bg-gradient-to-r after:from-gray-100/30 after:via-gray-100/10 after:to-transparent after:origin-left after:h-[2px] after:w-0 group-hover:after:w-full after:bottom-0 after:left-0">
              {appName}
            </div>
            <p className="text-xs text-gray-50/70 text-balance">
              {description}
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
