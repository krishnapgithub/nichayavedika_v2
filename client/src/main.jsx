import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./index.css";
import SearchProfiles from "./pages/SearchProfiles.jsx";



ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#fff",
                    color: "#800020",
                    border: "1px solid #f3e8e8",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    fontSize: "14px",
                    fontWeight: "500",
                },
            }}
        />
    </BrowserRouter>

);