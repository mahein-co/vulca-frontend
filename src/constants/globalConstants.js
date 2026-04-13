import IconDashboarb from "../assets/icons/dashboard.png";
import IconOcr from "../assets/icons/pdf.png";
import IconFinance from "../assets/icons/finance.png";
import IconAdd from "../assets/icons/add.png";

// Dynamically determine API URL based on current hostname to ensure Same-Site cookies work
const hostname = window.location.hostname;
let apiHost;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  apiHost = `http://127.0.0.1:8000/api`;
} else if (hostname.includes('lexaiq.com')) {
  // Force production API URL for any lexaiq.com subdomain
  apiHost = "https://api.lexaiq.com/api";
} else {
  // Fallback to env var or default
  apiHost = process.env.REACT_APP_API_URL || "https://api.lexaiq.com/api";
}

export const BASE_URL_API = apiHost;


export const PATHS = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  dashboard: "/app",
  ocr: "/app/ocr",
  forms: "/app/forms",
  facture: "/app/forms/facture",
  achat: "/app/forms/achat",
  banque: "/app/forms/bank",
  bilan: '/app/forms/Bilan', // ou le chemin que vous souhaitez
  compteResultat: '/app/forms/CompteResultat',
};

export const SIDEBAR_NAVIGATIONS = [
  { title: "Dashboard", path: "/app", icon: IconDashboarb },
  { title: "classification", path: "/app/classification", icon: IconAdd },
  { title: "grandlivre", path: "/app/grandlivre", icon: IconAdd },
  { title: "Finance", path: "/app/finance", icon: IconFinance },
  { title: "Formulaire", path: "/app/forms", icon: IconAdd },
  { title: "Import file", path: "/app/ocr", icon: IconOcr },
];
