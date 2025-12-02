import React from "react";
// import Journal from "../../components/cloture/journal.jsx";
// import GrandLivre from "../../components/cloture/GrandLivre.jsx";
// import Bilan from "../../components/cloture/Bilan.jsx";
// import CompteDeResultatCard from "../../components/cloture/CompteDeResultatCard.jsx";
import EtatFinance from "../../components/cloture/EtatFinance.jsx";

export default function IndexFinancePage() {
  return (
    <React.Fragment>
      {/* <div className="p-8">
        <Journal />
      </div> */}
      {/* <div className="p-8 text-black">
        <GrandLivre />
      </div>
      <div className="p-8 text-black">
        <Balance />
      </div> */}
      <div>
          <EtatFinance />
      </div>
    </React.Fragment>
  );
}
