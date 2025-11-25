import React from "react";

export default function ScoreCard({ title, value, variation }) {
  return (
    <div className="p-4 bg-white  rounded-2xl shadow-md w-64 flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-dark">{title}</h3>
      <p className="text-2xl font-bold text-dark">{value}</p>
      <p className={`text-sm ${variation >= 0 ? "text-green-600" : "text-red-600"}`}>
        {variation >= 0 ? "+" : ""}{variation}%
      </p>
    </div>
  );
}