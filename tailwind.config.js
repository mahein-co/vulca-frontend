
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    // Liste des classes de couleurs utilisées pour les cartes, badges et bordures
    // Factures (Bleu / Indigo)
    'bg-blue-50', 'border-blue-500', 'text-blue-600', 'bg-blue-500', 
    // Fiches de paie (Vert)
    'bg-green-50', 'border-green-500', 'text-green-600', 'bg-green-500',
    // Relevés bancaires (Violet/Purple)
    'bg-purple-50', 'border-purple-500', 'text-purple-600', 'bg-purple-500',
    // Autres (Orange/Yellow)
    'bg-orange-50', 'border-yellow-500', 'text-yellow-600', 'bg-orange-500',
    
    // Ajoutez toute autre classe Tailwind qui est générée dynamiquement
  ],
  theme: {
    extend: {
      // ... (vos couleurs personnalisées)
      colors: {
        primary: "#dc2626",
        secondary: "#ef4444",
        dark: "#1f2937",
        grey: "#6b7280",
        rose: "#db2777",
      },
    },
  },
  plugins: [],
};