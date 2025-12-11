import React from 'react';

// Données fictives pour la balance (basé sur 4.jpeg)
const balanceData = [
  { compte: '641', libelle: 'Rémunérations du personnel', debit: '2,350,000.00', credit: '-', solde: '2,350,000.00', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '421', libelle: 'Personnel - Rémunérations dues', debit: '-', credit: '2,150,000.00', solde: '2,150,000.00', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
  { compte: '411', libelle: 'Clients (Créances)', debit: '105,370,800', credit: '18,048,000', solde: '87,322,800', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '401', libelle: 'Fournisseurs (Dettes)', debit: '23,733,000', credit: '59,301,000', solde: '35,568,000', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
  { compte: '512', libelle: 'Banques (Compte courant)', debit: '11,316,000', credit: '12,288,000', solde: '972,000', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
  { compte: '612', libelle: 'Achats stockés de matières premières et fournitures', debit: '16,307,500', credit: '-', solde: '16,307,500', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '645', libelle: 'Charges patronales', debit: '400,000', credit: '-', solde: '400,000', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '411', libelle: 'Clients (Créances)', debit: '105,370,800', credit: '18,048,000', solde: '87,322,800', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '401', libelle: 'Fournisseurs (Dettes)', debit: '23,733,000', credit: '59,301,000', solde: '35,568,000', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
  { compte: '512', libelle: 'Banques (Compte courant)', debit: '11,316,000', credit: '12,288,000', solde: '972,000', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
  { compte: '612', libelle: 'Achats stockés de matières premières et fournitures', debit: '16,307,500', credit: '-', solde: '16,307,500', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '645', libelle: 'Charges patronales', debit: '400,000', credit: '-', solde: '400,000', nature: 'Débiteur', natureClass: 'bg-green-100 text-green-800' },
  { compte: '701', libelle: 'Ventes de produits finis', debit: '-', credit: '79,670,000', solde: '79,670,000', nature: 'Créditeur', natureClass: 'bg-red-100 text-red-800' },
];

// Fonction utilitaire pour nettoyer et convertir les montants en nombres
const cleanAmount = (amount) => {
  if (amount === '-') return 0;
  // Retire les virgules, espaces, points (sauf le dernier pour les décimales si nécessaire), puis parse
  return parseFloat(amount.replace(/,/g, '').replace(/\s/g, '')) || 0;
};

// Fonction pour formater les montants en Ar xxx xxx xxx,xx
const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD', // Nous utilisons USD pour la séparation par virgule, puis on remplace
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount).replace('$', 'Ar').replace(/\sUSD/, '').replace('.', ','); // Ajustement du format
};

const BalanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Calcul des totaux
  const totalDebit = balanceData.reduce((sum, item) => sum + cleanAmount(item.debit), 0);
  const totalCredit = balanceData.reduce((sum, item) => sum + cleanAmount(item.credit), 0);
  const soldeFinal = totalDebit - totalCredit;
  const isBalanced = Math.abs(soldeFinal) < 0.01; // Vérification de l'équilibre

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      
      <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* En-tête de la modale */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Balance</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps du tableau */}
        <div className="p-2 sm:p-4 overflow-x-hidden overflow-y-auto max-h-[calc(90vh-80px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  COMPTE
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                  LIBELLÉ
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  TOTAL DÉBIT
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  TOTAL CRÉDIT
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  SOLDE
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  NATURE
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {balanceData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">
                    {item.compte}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                    {item.libelle}
                  </td>
                  <td className={`px-2 py-1.5 whitespace-nowrap text-xs text-right ${item.debit !== '-' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {item.debit}
                  </td>
                  <td className={`px-2 py-1.5 whitespace-nowrap text-xs text-right ${item.credit !== '-' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {item.credit}
                  </td>
                  <td className={`px-2 py-1.5 whitespace-nowrap text-xs text-right font-semibold ${item.nature === 'Débiteur' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.solde}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-center">
                    <span className={`px-1 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.natureClass}`}>
                      {item.nature}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            
            {/* Ligne des Totaux (tfoot) */}
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-indigo-200">
                {/* Cellule fusionnée pour Compte et Libellé */}
                <td colSpan="2" className="px-2 py-2 text-left text-sm font-bold text-gray-800">
                  Total Général
                </td>
                
                {/* Total Débit */}
                <td className="px-2 py-2 whitespace-nowrap text-sm text-right font-bold text-green-700">
                  {formatAmount(totalDebit)}
                </td>
                
                {/* Total Crédit */}
                <td className="px-2 py-2 whitespace-nowrap text-sm text-right font-bold text-red-700">
                  {formatAmount(totalCredit)}
                </td>
                
                {/* Solde Final */}
                <td className={`px-2 py-2 whitespace-nowrap text-sm text-right font-bold ${isBalanced ? 'text-indigo-600' : 'text-yellow-600'}`}>
                  {isBalanced ? 'Équilibrée' : formatAmount(soldeFinal)}
                </td>
                
                {/* Cellule vide pour Nature */}
                <td className="px-2 py-2 text-center"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;