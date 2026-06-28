import { useNavigate } from "react-router-dom";
import nvLogo from "../images/wedding-hero.png";

export default function ProfileCard({ profile }) {
    const navigate = useNavigate();

    const imageUrl = profile.profilePhoto
        ? `${import.meta.env.VITE_API_URL}/${profile.profilePhoto}`
        : nvLogo;

    return (
        <div className="nv-profile-card">
            <div className="nv-profile-content">
                <div className="nv-profile-top">
                    <h3>{profile.fullName || profile.user?.fullName || "Profile Hidden"}</h3>
                    <span>{profile.age ? `${profile.age} yrs` : "Age N/A"}</span>
                </div>

                <div className="nv-profile-bottom">
                    <div>
                        <h2>{profile.occupation || "Occupation N/A"}</h2>
                        <p>{profile.caste || "Caste N/A"} • {profile.city || "City N/A"}</p>
                        <p>{profile.education || "Education N/A"}</p>
                    </div>

                    <button onClick={() => navigate(`/profile/${profile._id}`)}>
                        View
                    </button>
                </div>
            </div>

            <div className="nv-card-bg">
                <img src={imageUrl} alt="Profile" />
            </div>

            <div className="nv-card-overlay"></div>

            <div className="nv-card-shadow">
                <img src={imageUrl} alt="" />
            </div>
        </div>
    );
}