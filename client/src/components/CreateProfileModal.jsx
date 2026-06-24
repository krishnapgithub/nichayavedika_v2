import { useEffect } from "react";
import CreateProfile from "../pages/CreateProfile";
import "../styles/createProfileModal.css";

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

                <button
                    type="button"
                    className="create-profile-close"
                    onClick={onClose}
                >
                    ✕
                </button>

                <CreateProfile isModal={true} onClose={onClose} />

            </div>
        </div>
    );
}