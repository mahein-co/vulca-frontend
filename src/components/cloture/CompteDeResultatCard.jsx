import React, { useMemo } from "react";
import { formatNumberWithSpaces } from "../../utils/numberFormat";

export default function CompteDeResultatCard() {
  // ------------------------------
  // Données exemple du Compte de Résultat
  // ------------------------------
  const resultat = [
    // PRODUITS
    { libelle: "Chiffre d'affaires", type: "produit", montant: 520000 },
    { libelle: "Production stockée", type: "produit", montant: 40000 },
    { libelle: "Autres produits", type: "produit", montant: 15000 },

    // CHARGES
    { libelle: "Achats consommés", type: "charge", montant: 260000 },
    { libelle: "Charges de personnel", type: "charge", montant: 120000 },
    { libelle: "Impôts et taxes", type: "charge", montant: 20000 },
    { libelle: "Dotations aux amortissements", type: "charge", montant: 30000 },
    { libelle: "Autres charges", type: "charge", montant: 15000 },
  ];

  // ------------------------------
  // Séparation Produits / Charges
  // ------------------------------
  const { produits, charges } = useMemo(() => ({
    produits: resultat.filter(i => i.type === "produit"),
    charges: resultat.filter(i => i.type === "charge"),
  }), [resultat]);

  // Totaux
  const totalProduits = useMemo(() => produits.reduce((s, i) => s + i.montant, 0), [produits]);
  const totalCharges = useMemo(() => charges.reduce((s, i) => s + i.montant, 0), [charges]);

  // Résultat net
  const resultatNet = totalProduits - totalCharges;

  // Couleur selon bénéfice ou perte
  const resultColor = resultatNet >= 0 ? "green" : "red";

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      width: "95%",
      maxWidth: "1100px",
      margin: "30px auto",
      color: "#222",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h2 style={{
        marginBottom: "25px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "26px",
        color: "#333"
      }}>
        Compte de Résultat
      </h2>

      {/* PRODUITS */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead>
          <tr style={{ background: "#d9f7d9", fontWeight: "bold" }}>
            <th colSpan="2" style={{ padding: "10px", textAlign: "center" }}>PRODUITS</th>
          </tr>
          <tr style={{ background: "#f7f7f7" }}>
            <th style={{ padding: "8px" }}>Libellé</th>
            <th style={{ padding: "8px" }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{p.libelle}</td>
              <td style={{ padding: "8px" }}>{formatNumberWithSpaces(p.montant)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", background: "#eee" }}>
            <td>Total Produits</td>
            <td>{formatNumberWithSpaces(totalProduits)}</td>
          </tr>
        </tbody>
      </table>

      {/* CHARGES */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2dede", fontWeight: "bold" }}>
            <th colSpan="2" style={{ padding: "10px", textAlign: "center" }}>CHARGES</th>
          </tr>
          <tr style={{ background: "#f7f7f7" }}>
            <th style={{ padding: "8px" }}>Libellé</th>
            <th style={{ padding: "8px" }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {charges.map((c, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{c.libelle}</td>
              <td style={{ padding: "8px" }}>{formatNumberWithSpaces(c.montant)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold", background: "#eee" }}>
            <td>Total Charges</td>
            <td>{formatNumberWithSpaces(totalCharges)}</td>
          </tr>
        </tbody>
      </table>

      {/* RÉSULTAT NET */}
      <h3 style={{
        marginTop: "30px",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "20px",
        color: resultColor
      }}>
        Résultat Net : {formatNumberWithSpaces(resultatNet)} {resultatNet >= 0 ? "(Bénéfice)" : "(Perte)"}
      </h3>
    </div>
  );
}
