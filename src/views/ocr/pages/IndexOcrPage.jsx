import React from "react";
import { useSelector } from "react-redux";

import InputFileCard from "../../../components/card/InputFileCard";

import ExcelIcon from "../../../assets/icons/excel2.png";
import ImageIcon from "../../../assets/icons/image.png";
import PdfIcon from "../../../assets/icons/pdf.png";
import FilesUploadedList from "./FilesUploadedList";

export default function IndexOcrPage() {
  const cards = [
    {
      imageUrl: ImageIcon,
      fileType: "image",
      appName: "Uploaded Image",
      description: "PNG, JPG, JPEG up to 10MB",
      acceptFile: ".png, .jpg, .jpeg",
      numberOfFiles: 1,
    },
    {
      imageUrl: PdfIcon,
      fileType: "pdf",
      appName: "Uploaded PDF",
      description: "With 12 pages limit",
      acceptFile: ".pdf",
      numberOfFiles: 1,
    },
    {
      imageUrl: ExcelIcon,
      fileType: "tableau",
      appName: "Uploaded Excel",
      description: "XLSX, CSV, XLS up to 5MB",
      acceptFile: ".xlsx, .csv, .xls",
      numberOfFiles: 5,
    },
  ];

  const uploadedFiles = useSelector((state) => state.orcFiles.uploadedFiles);

  return (
    <React.Fragment>
      {uploadedFiles.length > 0 ? (
        <React.Fragment>
          <FilesUploadedList
            files={uploadedFiles}
            totalFiles={uploadedFiles.length}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="flex flex-col justify-center items-center mt-7 space-y-4">
            {cards.map((card, index) => (
              <InputFileCard
                key={index}
                imageUrl={card.imageUrl}
                appName={card.appName}
                fileType={card.fileType}
                description={card.description}
                acceptFile={card.acceptFile}
                numberOfFiles={card.numberOfFiles}
              />
            ))}
            {/* <div className="mt-4 px-6 py-1 text-xs bg-gray-300 rounded-full inline-flex transition duration-300 hover:bg-gray-800 hover:text-white hover:-translate-y-1">
              <Link to="#" rel="noopener noreferrer">
                Or by formular
              </Link>
            </div> */}
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
