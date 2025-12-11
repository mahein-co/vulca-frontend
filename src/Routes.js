import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import IndexLoginPage from "./views/auth/pages/IndexLoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import IndexOcrPage from "./views/ocr/pages/IndexOcrPage";
import IndexDashboardPage from "./views/dashboard/IndexDashboardPage";
import IndexFinancePage from "./views/finance/IndexFinancePage";
import IndexAddByFormsPage from "./views/ocr/pages/IndexAddByFormsPage";
import FactureForm from "./views/ocr/forms/FactureForm";
import BilanForm from "./views/ocr/forms/BilanForm";
import CompteResultatForm from "./views/ocr/forms/CompteResultatForm";
import BonAchatForm from "./views/ocr/forms/BonAchatForm";
import BankForm from "./views/ocr/forms/BankForm";
import Classification from "./views/classification/Classification";
import GrandLivre from "./views/grandlivre/grandlivre";

export default function Routes() {
  return useRoutes([
    { path: "/", element: <Navigate to={"/app"} /> },
    {
      path: "/app",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <IndexDashboardPage /> },
        { path: "ocr", element: <IndexOcrPage /> },
        { path: "finance", element: <IndexFinancePage /> },
        { path: "forms", element: <IndexAddByFormsPage /> },
        { path: "forms/facture", element: <FactureForm /> },
        { path: "forms/achat", element: <BonAchatForm /> },
        { path: "forms/bank", element: <BankForm /> },
        { path: "classification", element: <Classification /> },
        { path: "grandlivre", element: <GrandLivre /> },
        { path: "forms/bilan", element: <BilanForm /> },
        { path: "forms/CompteResultat", element: <CompteResultatForm /> },

      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [{ path: "login", element: <IndexLoginPage /> }],
    },
  ]);
}
