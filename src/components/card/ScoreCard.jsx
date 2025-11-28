import React from "react";
// Importez une icône de base de données si vous utilisez une librairie d'icônes
// Pour l'exemple, nous allons utiliser un SVG inline simple.


export default function ScoreCard({ title, count}) {
  return (
    // Réduction du padding global de p-4 à p-3, et arrondi maintenu à rounded-md
    <div className="p-3 bg-white rounded-md shadow-md flex flex-col gap-1 border border-gray-200">
      
      {/* Réduction de la hauteur du conteneur de titre de h-12 à h-10, et ajustement de la taille du texte pour qu'il reste centré si besoin */}
      <div className="flex justify-center text-center items-center h-10">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3> {/* Titre un peu plus petit si nécessaire pour l'espace */}
      </div>

      {/* Réduction du padding vertical autour du count de py-4 à py-2 */}
      <div className="flex flex-col items-center justify-center py-2">
        <p className="text-3xl font-bold text-blue-600">{count}</p> {/* Taille du nombre légèrement réduite pour un meilleur ajustement */}
      </div>
    </div>
  );
}