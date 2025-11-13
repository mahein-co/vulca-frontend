import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import InputFileCard from "../../../components/card/InputFileCard";
import UploadedFiles from "./UploadedFiles";

import ExcelIcon from "../../../assets/icons/excel2.png";
import ImageIcon from "../../../assets/icons/image.png";
import PdfIcon from "../../../assets/icons/pdf.png";

export default function IndexOcrPage() {
  const cards = [
    {
      imageUrl: ImageIcon,
      fileType: "image",
      appName: "Uploaded Image OCR",
      description: "PNG, JPG, JPEG up to 10MB",
      acceptFile: ".png, .jpg, .jpeg",
    },
    {
      imageUrl: PdfIcon,
      fileType: "pdf",
      appName: "Uploaded PDF OCR",
      description: "With 12 pages limit",
      acceptFile: ".pdf",
    },
    {
      imageUrl: ExcelIcon,
      fileType: "tableau",
      appName: "Uploaded Excel OCR",
      description: "XLSX, CSV, XLS up to 5MB",
      acceptFile: ".xlsx, .csv, .xls",
    },
  ];

  const uploadedFiles = useSelector((state) => state.orcFiles.uploadedFiles);

  return (
    <React.Fragment>
      {uploadedFiles.length > 0 ? (
        <React.Fragment>
          <UploadedFiles
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
              />
            ))}
            <div className="mt-4 px-6 py-1 text-xs bg-gray-300 rounded-full inline-flex transition duration-300 hover:bg-gray-800 hover:text-white hover:-translate-y-1">
              <Link to="#" rel="noopener noreferrer">
                Or by formular
              </Link>
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
