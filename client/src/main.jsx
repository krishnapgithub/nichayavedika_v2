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
        <Toaster position="bottom-center" toastOptions={{
            duration: 3000,
            style: {
                background: "#800020",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
            },
        }} />
    </BrowserRouter>

);