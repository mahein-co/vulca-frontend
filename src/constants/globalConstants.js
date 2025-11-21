import IconDashboarb from "../assets/icons/dashboard.png";
import IconOcr from "../assets/icons/pdf.png";
import IconFinance from "../assets/icons/finance.png";

export const BASE_URL_API = process.env.REACT_APP_API_URL;

export const PATHS = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  dashboard: "/app",
  ocr: "/app/ocr",
};

export const SIDEBAR_NAVIGATIONS = [
  { title: "Dashboard", path: "/app", icon: IconDashboarb },
  { title: "Import file", path: "/app/ocr", icon: IconOcr },
  { title: "Finance", path: "/app/finance", icon: IconFinance },
];
