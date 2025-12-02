import React, { useState } from 'react';
import { FileText, Activity, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const EtatFinance = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  // Données financières avec structure détaillée
  const financialData = {
    bilan: {
      actif: 1500000,
      passif: 1500000,
      capitauxPropres: 600000,
      details: [
        // ACTIF
        { numeroCompte: '201000', libelle: 'Immobilisations incorporelles', montant: 250000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif immobilisé' },
        { numeroCompte: '211000', libelle: 'Terrains', montant: 400000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif immobilisé' },
        { numeroCompte: '215000', libelle: 'Matériel et outillage', montant: 350000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif immobilisé' },
        { numeroCompte: '311000', libelle: 'Stock de marchandises', montant: 200000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif circulant' },
        { numeroCompte: '411000', libelle: 'Clients', montant: 180000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif circulant' },
        { numeroCompte: '512000', libelle: 'Banque', montant: 120000, nature: 'Actif', date: '2024-12-31', type: 'Actif', categorie: 'Actif circulant' },
        // PASSIF
        { numeroCompte: '101000', libelle: 'Capital', montant: 600000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Capitaux propres' },
        { numeroCompte: '106000', libelle: 'Réserves', montant: 150000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Capitaux propres' },
        { numeroCompte: '120000', libelle: 'Résultat de l\'exercice', montant: 250000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Capitaux propres' },
        { numeroCompte: '164000', libelle: 'Emprunts auprès des établissements de crédit', montant: 300000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Dettes' },
        { numeroCompte: '401000', libelle: 'Fournisseurs', montant: 150000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Dettes' },
        { numeroCompte: '431000', libelle: 'Sécurité sociale', montant: 50000, nature: 'Passif', date: '2024-12-31', type: 'Passif', categorie: 'Dettes' }
      ]
    },
    compteResultat: {
      produits: 2000000,
      charges: 1700000,
      resultatNet: 300000,
      details: [
        // PRODUITS
        { numeroCompte: '701000', libelle: 'Ventes de marchandises', montant: 1200000, nature: 'Produit', date: '2024-12-31' },
        { numeroCompte: '706000', libelle: 'Prestations de services', montant: 500000, nature: 'Produit', date: '2024-12-31' },
        { numeroCompte: '707000', libelle: 'Ventes de produits finis', montant: 250000, nature: 'Produit', date: '2024-12-31' },
        { numeroCompte: '768000', libelle: 'Autres produits financiers', montant: 30000, nature: 'Produit', date: '2024-12-31' },
        { numeroCompte: '781000', libelle: 'Reprises sur amortissements', montant: 20000, nature: 'Produit', date: '2024-12-31' },
        // CHARGES
        { numeroCompte: '601000', libelle: 'Achats de marchandises', montant: 600000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '604000', libelle: 'Achats de matières premières', montant: 200000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '621000', libelle: 'Personnel', montant: 450000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '635000', libelle: 'Impôts et taxes', montant: 80000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '615000', libelle: 'Entretien et réparations', montant: 120000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '622000', libelle: 'Charges sociales', montant: 150000, nature: 'Charge', date: '2024-12-31' },
        { numeroCompte: '661000', libelle: 'Charges financières', montant: 100000, nature: 'Charge', date: '2024-12-31' }
      ]
    },
    balance: {
      debit: 2500000,
      credit: 2500000,
      solde: 0,
      details: [
        { numeroCompte: '101000', intituleCompte: 'Capital', totalDebit: 0, totalCredit: 600000, soldeDebit: 0, soldeCredit: 600000, date: '2024-12-31' },
        { numeroCompte: '201000', intituleCompte: 'Immobilisations incorporelles', totalDebit: 250000, totalCredit: 0, soldeDebit: 250000, soldeCredit: 0, date: '2024-12-31' },
        { numeroCompte: '211000', intituleCompte: 'Terrains', totalDebit: 400000, totalCredit: 0, soldeDebit: 400000, soldeCredit: 0, date: '2024-12-31' },
        { numeroCompte: '401000', intituleCompte: 'Fournisseurs', totalDebit: 50000, totalCredit: 250000, soldeDebit: 0, soldeCredit: 200000, date: '2024-12-31' },
        { numeroCompte: '512000', intituleCompte: 'Banque', totalDebit: 500000, totalCredit: 200000, soldeDebit: 300000, soldeCredit: 0, date: '2024-12-31' },
        { numeroCompte: '601000', intituleCompte: 'Achats', totalDebit: 800000, totalCredit: 0, soldeDebit: 800000, soldeCredit: 0, date: '2024-12-31' },
        { numeroCompte: '701000', intituleCompte: 'Ventes', totalDebit: 0, totalCredit: 1500000, soldeDebit: 0, soldeCredit: 1500000, date: '2024-12-31' }
      ]
    }
  };

  // Fonction de formatage de devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' Ar';
  };

  // Fonction pour gérer le clic sur une section
  const handleSectionClick = (section) => {
    setSelectedSection(selectedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen p-6">
      {/* GRAND CONTAINER */}
      <div className="bg-white rounded-3xl shadow-md p-8 max-w-7xl mx-auto w-full">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h1 className="text-lg font-semibold text-gray-800">
              États Financiers PCG 2005
            </h1>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* BILAN */}
          <div 
            className="bg-blue-50 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSectionClick('bilan')}
          >
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h2 className="text-md font-bold text-blue-800">Bilan</h2>
              </div>
              {selectedSection === 'bilan' ? 
                <ChevronUp className="w-5 h-5 text-blue-500" /> : 
                <ChevronDown className="w-5 h-5 text-blue-500" />
              }
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Actif:</span>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(financialData.bilan.actif)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Passif:</span>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(financialData.bilan.passif)}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-blue-100 mt-4">
                <span className="text-gray-800 text-sm font-medium">Capitaux propres:</span>
                <span className="text-blue-600 font-bold text-sm">
                  {formatCurrency(financialData.bilan.capitauxPropres)}
                </span>
              </div>
            </div>
          </div>

          {/* COMPTE DE RÉSULTAT */}
          <div 
            className="bg-green-50 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSectionClick('compteResultat')}
          >
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h2 className="text-md font-bold text-green-800">Compte de Résultat</h2>
              </div>
              {selectedSection === 'compteResultat' ? 
                <ChevronUp className="w-5 h-5 text-green-500" /> : 
                <ChevronDown className="w-5 h-5 text-green-500" />
              }
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Produits:</span>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(financialData.compteResultat.produits)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Charges:</span>
                <span className="font-semibold text-sm text-red-600">
                  {formatCurrency(financialData.compteResultat.charges)}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-green-100 mt-4">
                <span className="text-gray-800 text-sm font-medium">Résultat net:</span>
                <span className="text-green-600 font-bold text-sm">
                  {formatCurrency(financialData.compteResultat.resultatNet)}
                </span>
              </div>
            </div>
          </div>

          {/* BALANCE */}
          <div 
            className="bg-purple-50 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSectionClick('balance')}
          >
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <h2 className="text-md font-bold text-purple-800">Balance</h2>
              </div>
              {selectedSection === 'balance' ? 
                <ChevronUp className="w-5 h-5 text-purple-500" /> : 
                <ChevronDown className="w-5 h-5 text-purple-500" />
              }
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Débit:</span>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(financialData.balance.debit)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Crédit:</span>
                <span className="font-semibold text-sm text-gray-900">
                  {formatCurrency(financialData.balance.credit)}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-purple-100 mt-4">
                <span className="text-gray-800 text-sm font-medium">Solde:</span>
                <span className="font-bold text-sm text-gray-900">
                  {formatCurrency(financialData.balance.solde)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION DÉTAILS */}
        {selectedSection && (
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Détails - {selectedSection === 'bilan' ? 'Bilan' : selectedSection === 'compteResultat' ? 'Compte de Résultat' : 'Balance'}
            </h3>

            {/* Détails Balance */}
            {selectedSection === 'balance' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Compte</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Intitulé du compte</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Débit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Crédit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Solde Débit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Solde Crédit</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.balance.details.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-white transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.numeroCompte}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{item.intituleCompte}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.totalDebit)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.totalCredit)}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right font-semibold">
                          {item.soldeDebit > 0 ? formatCurrency(item.soldeDebit) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-red-600 text-right font-semibold">
                          {item.soldeCredit > 0 ? formatCurrency(item.soldeCredit) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Détails Bilan */}
            {selectedSection === 'bilan' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Compte</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Libellé</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Montant (Ar)</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Nature</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ACTIF */}
                    <tr className="bg-blue-100">
                      <td colSpan="7" className="py-2 px-4 text-sm font-bold text-blue-800">ACTIF</td>
                    </tr>
                    {financialData.bilan.details.filter(item => item.type === 'Actif').map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.numeroCompte}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{item.libelle}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                          {formatCurrency(item.montant)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.nature}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.date}</td>
                        <td className="py-3 px-4 text-sm text-blue-700 text-center font-medium">{item.type}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{item.categorie}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-100 font-bold">
                      <td colSpan="2" className="py-2 px-4 text-sm text-blue-800">TOTAL ACTIF</td>
                      <td className="py-2 px-4 text-sm text-blue-800 text-right">
                        {formatCurrency(financialData.bilan.actif)}
                      </td>
                      <td colSpan="4"></td>
                    </tr>

                    {/* PASSIF */}
                    <tr className="bg-blue-100">
                      <td colSpan="7" className="py-2 px-4 text-sm font-bold text-blue-800">PASSIF</td>
                    </tr>
                    {financialData.bilan.details.filter(item => item.type === 'Passif').map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.numeroCompte}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{item.libelle}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                          {formatCurrency(item.montant)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.nature}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.date}</td>
                        <td className="py-3 px-4 text-sm text-purple-700 text-center font-medium">{item.type}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{item.categorie}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-100 font-bold">
                      <td colSpan="2" className="py-2 px-4 text-sm text-blue-800">TOTAL PASSIF</td>
                      <td className="py-2 px-4 text-sm text-blue-800 text-right">
                        {formatCurrency(financialData.bilan.passif)}
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Détails Compte de Résultat */}
            {selectedSection === 'compteResultat' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Compte</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Libellé</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Montant (Ar)</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Nature</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* PRODUITS */}
                      <tr className="bg-green-100">
                        <td colSpan="5" className="py-2 px-4 text-sm font-bold text-green-800">PRODUITS</td>
                      </tr>
                      {financialData.compteResultat.details.filter(item => item.nature === 'Produit').map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.numeroCompte}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.libelle}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                            {formatCurrency(item.montant)}
                          </td>
                          <td className="py-3 px-4 text-sm text-green-700 text-center font-medium">{item.nature}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.date}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 font-bold">
                        <td colSpan="2" className="py-2 px-4 text-sm text-green-800">TOTAL PRODUITS</td>
                        <td className="py-2 px-4 text-sm text-green-800 text-right">
                          {formatCurrency(financialData.compteResultat.produits)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>

                      {/* CHARGES */}
                      <tr className="bg-red-100">
                        <td colSpan="5" className="py-2 px-4 text-sm font-bold text-red-800">CHARGES</td>
                      </tr>
                      {financialData.compteResultat.details.filter(item => item.nature === 'Charge').map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.numeroCompte}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.libelle}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                            {formatCurrency(item.montant)}
                          </td>
                          <td className="py-3 px-4 text-sm text-red-700 text-center font-medium">{item.nature}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.date}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-100 font-bold">
                        <td colSpan="2" className="py-2 px-4 text-sm text-red-800">TOTAL CHARGES</td>
                        <td className="py-2 px-4 text-sm text-red-800 text-right">
                          {formatCurrency(financialData.compteResultat.charges)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* RESULTAT NET */}
                <div className="mt-6">
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">RÉSULTAT NET DE L'EXERCICE</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialData.compteResultat.resultatNet)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EtatFinance;