import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout";
import IndexLoginPage from "./views/auth/pages/IndexLoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import IndexOcrPage from "./views/ocr/pages/IndexOcrPage";

export default function Routes() {
  return useRoutes([
    { path: "/", element: <Navigate to={"/app/ocr"} /> },
    {
      path: "/app",
      element: <DashboardLayout />,
      children: [{ path: "ocr", element: <IndexOcrPage /> }],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [{ path: "login", element: <IndexLoginPage /> }],
    },
  ]);
}
