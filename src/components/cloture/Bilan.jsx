import React, { useMemo } from "react";
import { formatNumberWithSpaces } from "../../utils/numberFormat";

export default function BilanCard() {
  const journal = [
    { compte: "20", libelle: "Immobilisations incorporelles", type: "actif", montant: 120000 },
    { compte: "21", libelle: "Immobilisations corporelles", type: "actif", montant: 250000 },
    { compte: "31", libelle: "Stocks", type: "actif", montant: 45000 },
    { compte: "41", libelle: "Clients", type: "actif", montant: 60000 },
    { compte: "512", libelle: "Banque", type: "actif", montant: 35000 },

    { compte: "101", libelle: "Capital social", type: "passif", montant: 200000 },
    { compte: "106", libelle: "Réserves", type: "passif", montant: 50000 },
    { compte: "12", libelle: "Résultat", type: "passif", montant: 30000 },
    { compte: "401", libelle: "Fournisseurs", type: "passif", montant: 45000 },
    { compte: "164", libelle: "Emprunts", type: "passif", montant: 150000 },
  ];

  const { actif, passif } = useMemo(() => {
    return {
      actif: journal.filter(i => i.type === "actif"),
      passif: journal.filter(i => i.type === "passif"),
    };
  }, [journal]);

  const totalActif = useMemo(() => actif.reduce((sum, i) => sum + i.montant, 0), [actif]);
  const totalPassif = useMemo(() => passif.reduce((sum, i) => sum + i.montant, 0), [passif]);

  return (
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      width: "95%",
      maxWidth: "1300px",
      margin: "30px auto",
      color: "#222",  // texte plus lisible
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h2 style={{
        marginBottom: "25px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "26px",
        color: "#333"
      }}>
        Bilan Comptable
      </h2>

      <div style={{ display: "flex", gap: "40px", justifyContent: "space-between" }}>
        {/* ACTIF */}
        <table cellPadding="8" style={{
          flex: 1,
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "15px"
        }}>
          <thead>
            <tr style={{ background: "#d9edf7", fontWeight: 600 }}>
              <th colSpan="3" style={{ textAlign: "center" }}>ACTIF</th>
            </tr>
            <tr style={{ background: "#f7f7f7" }}>
              <th>Compte</th>
              <th>Libellé</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {actif.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td>{row.compte}</td>
                <td>{row.libelle}</td>
                <td>{formatNumberWithSpaces(row.montant)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#eee" }}>
              <td colSpan="2">Total Actif</td>
              <td>{formatNumberWithSpaces(totalActif)}</td>
            </tr>
          </tbody>
        </table>

        {/* PASSIF */}
        <table cellPadding="8" style={{
          flex: 1,
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "15px"
        }}>
          <thead>
            <tr style={{ background: "#f2dede", fontWeight: 600 }}>
              <th colSpan="3" style={{ textAlign: "center" }}>PASSIF</th>
            </tr>
            <tr style={{ background: "#f7f7f7" }}>
              <th>Compte</th>
              <th>Libellé</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {passif.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td>{row.compte}</td>
                <td>{row.libelle}</td>
                <td>{formatNumberWithSpaces(row.montant)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#eee" }}>
              <td colSpan="2">Total Passif</td>
              <td>{formatNumberWithSpaces(totalPassif)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{
        marginTop: "25px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "18px",
        color: totalActif === totalPassif ? "green" : "red"
      }}>
        Équilibre : {formatNumberWithSpaces(totalActif)} = {formatNumberWithSpaces(totalPassif)}
      </h3>
    </div>
  );
}
