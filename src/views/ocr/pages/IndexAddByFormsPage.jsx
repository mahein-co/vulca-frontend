import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constants/globalConstants";

<div className="p-5 pt-8 border ignore rounded-xl not-prose dark:border-slate-900 relative bg-slate-800">
  <div className="max-w-5xl mx-auto">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 not-prose">
      <Link
        to={PATHS.bilan}
        className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border dark:border-gray-800 dark:bg-slate-900 group"
      >
        <span className="absolute w-full h-full dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
        <div className="flex items-center justify-between w-full mb-4 ">
          <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
            <span>Bilan</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 translate-x-0.5 h-3"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
                // Dans votre fichier de constantes (probablement constants.js ou routes.js)
              ></path>
            </svg>
          </span>
        </div>
        <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Choisir le formulaire pour insérer
          <span className="ml-1 underline">un bilan</span>.
        </p>
      </Link>

      <Link
        to={PATHS.compteResultat}
        className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-slate-900 bg-white group"
      >
        <span className="absolute w-full h-full bg-white dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
        <div className="flex items-center justify-between w-full mb-4 ">
          <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
            <span>Compte de résultat</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 translate-x-0.5 h-3"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
        <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Choisir le formulaire pour insérer
          <span className="ml-1 underline">un compte de résultat</span>.
        </p>
      </Link>
    </div>
  </div>
    </div>

export default function IndexAddByFormsPage() {
  return (
    <React.Fragment>
      <div className="p-5 pt-8 border ignore rounded-xl not-prose dark:border-slate-900 relative bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3 sm:gap-5 not-prose">
            <Link
              to={PATHS.facture}
              className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border dark:border-gray-800 dark:bg-slate-900 group"
            >
              <span className="absolute w-full h-full dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
              <div className="flex items-center justify-between w-full mb-4 ">
                <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
                  <span>Facture</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 translate-x-0.5 h-3"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
              </div>
              <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Choisir le formulaire pour insérer
                <span className="ml-1 underline">une facture</span>.
              </p>
            </Link>

            <Link
              to={PATHS.achat}
              className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-slate-900 bg-white group"
            >
              <span className="absolute w-full h-full bg-white dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
              <div className="flex items-center justify-between w-full mb-4 ">
                <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
                  <span>Bon d'achat</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 translate-x-0.5 h-3"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
              </div>
              <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Choisir le formulaire pour insérer
                <span className="ml-1 underline">un bon d'achat</span>.
              </p>
            </Link>

            <Link
              to={PATHS.banque}
              className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-slate-900 bg-white group"
            >
              <span className="absolute w-full h-full bg-white dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
              <div className="flex items-center justify-between w-full mb-4 ">
                <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
                  <span>Relevet bancaire</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 translate-x-0.5 h-3"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
              </div>
              <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Choisir le formulaire pour insérer
                <span className="ml-1 underline">un relevé bancaire</span>.
              </p>
            </Link>
          </div>
        </div>
      </div>
    <div className="p-5 pt-8 border ignore rounded-xl not-prose dark:border-slate-900 relative bg-slate-800">
  <div className="max-w-5xl mx-auto">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 not-prose">
      <Link
        to={PATHS.bilan}
        className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border dark:border-gray-800 dark:bg-slate-900 group"
      >
        <span className="absolute w-full h-full dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
        <div className="flex items-center justify-between w-full mb-4 ">
          <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
            <span>Bilan</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 translate-x-0.5 h-3"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
        <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Choisir le formulaire pour insérer
          <span className="ml-1 underline">un bilan</span>.
        </p>
      </Link>

      <Link
        to={PATHS.compteResultat}
        className="relative flex flex-col items-start justify-between p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-slate-900 bg-white group"
      >
        <span className="absolute w-full h-full bg-white dark:bg-slate-900 inset-0 dark:group-hover:bg-slate-950 group-hover:bg-gray-50 group-hover:bg-opacity-30"></span>
        <div className="flex items-center justify-between w-full mb-4 ">
          <span className="opacity-70 -translate-x-2 flex-shrink-0 group-hover:translate-x-0 py-1 px-2.5 text-[0.6rem] group-hover:opacity-100 transition-all ease-out duration-200 rounded-full bg-blue-50 dark:bg-blue-500 dark:text-white text-blue-500 flex items-center justify-center">
            <span>Compte de résultat</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 translate-x-0.5 h-3"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
        <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Choisir le formulaire pour insérer
          <span className="ml-1 underline">un compte de résultat</span>.
        </p>
      </Link>
    </div>
  </div>
    </div>
    </React.Fragment>
  );
}
