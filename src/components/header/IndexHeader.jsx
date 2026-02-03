import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaFolderOpen } from "react-icons/fa";

export default function IndexHeader() {
  const navigate = useNavigate();
  const activePageTitle = useSelector(
    (state) => state.navigations.activePageTitle
  );

  // Liste des mois
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  // Liste d'années
  const years = [2023, 2024, 2025];

  return (
    <React.Fragment>
      <header className="sticky -top-1 lg:top-0 w-full bg-slate-900 dark:bg-gray-900 shadow-sm p-4 flex justify-between items-center z-50">

        {/* Titre à gauche */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">{activePageTitle}</h1>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-sm bg-slate-700 dark:bg-gray-700 hover:bg-slate-600 dark:hover:bg-gray-600 text-slate-300 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors shadow-sm"
            title="Changer de projet"
          >
            <FaFolderOpen className="text-blue-400" />
            <span className="hidden sm:inline">Gestion Projet</span>
          </button>
        </div>

        {/* Zone de droite : Filtres + Search + Avatar */}
        <div className="flex items-center gap-4">

          {/* Filtres */}
          <div className="flex items-center gap-3">
            {/* Filtre Mois */}
            <select
              defaultValue="Tous"
              className="px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="Tous">Tous</option>
              {months.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>

            {/* Filtre Année */}
            <select
              defaultValue="Tous"
              className="px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="Tous">Tous</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="px-4 hidden py-2 border rounded-lg"
          />
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-dark text-xs">
            SR
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}


