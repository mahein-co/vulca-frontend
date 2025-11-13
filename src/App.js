import "@fontsource/roboto";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              duration: 5000,
              fontSize: "0.85rem",
              borderRadius: "8px",
              padding: "12px 16px",
              background: "#fff",
            },
            success: {
              style: {
                color: "#1f2937",
              },
            },
            error: {
              duration: 6000,
              style: {
                color: "#1f2937",
              },
            },
          }}
        />
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
