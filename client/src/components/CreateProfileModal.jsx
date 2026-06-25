import { useEffect } from "react";
import CreateProfile from "../pages/CreateProfile.jsx";
import "../styles/createProfileModal.css";
import { authHeader } from "../utils/authHeader";

export default function CreateProfileModal({ onClose }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, []);

    return (


        <div className="create-profile-overlay">
            <div className="create-profile-modal">
                <button className="create-profile-close" onClick={onClose}>
                    ✕
                </button>

                <div className="create-profile-header">
                    <h2>Create Profile</h2>
                    <p>Complete your matrimonial profile</p>
                </div>

                <div className="create-profile-body">
                    <CreateProfile onClose={onClose} />
                </div>
            </div>
        </div>
    );
}