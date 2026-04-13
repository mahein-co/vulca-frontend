# REKAPY - Frontend (React)

L'interface utilisateur de REKAPY est une application React moderne construite avec Vite, offrant un tableau de bord financier intuitif et des outils de gestion de documents.

## 🚀 Fonctionnalités Principales

- **Tableau de Bord Dynamique** : Visualisation en temps réel des KPIs financiers (CA, EBE, ROE, etc.) avec Recharts.
- **Gestion des Documents** : Interface d'upload pour les factures, relevés bancaires et fiches de paie.
- **Explorateur Comptable** : Consultation paginée des journaux, du grand livre et de la balance.
- **États Financiers** : Génération visuelle du Bilan et du Compte de Résultat.

## 🛠 Technologies

- **Framework** : React 19
- **Build Tool** : Vite / react-scripts
- **State Management** : Redux Toolkit
- **Styling** : Tailwind CSS, Lucide React (icônes)
- **Charts** : Recharts
- **API Client** : Axios

## ⚙️ Installation

### Prérequis

- Node.js 18+
- npm ou yarn

### Étapes d'installation

1.  **Naviguer vers le module frontend** :

    ```bash
    cd vulca-frontend
    ```

2.  **Installer les dépendances** :

    ```bash
    npm install
    ```

3.  **Configurer l'environnement** :
    Créer un fichier `.env` dans `vulca-frontend/` :

    ```env
    REACT_APP_API_URL=http://127.0.0.1:8000
    ```

4.  **Lancer l'application en mode développement** :

    ```bash
    npm start
    ```

5.  **Build pour la production** :
    ```bash
    npm run build
    ```

---

© 2026 Rekapy Project
