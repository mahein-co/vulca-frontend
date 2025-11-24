import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackToFormsPage() {
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <button onClick={() => navigate("/app/forms")} className="text-blue-600">
        Retour
      </button>
    </React.Fragment>
  );
}
