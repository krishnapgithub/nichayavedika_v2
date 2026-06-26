import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/searchProfiles.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import logo from "../assets/hero.png";

const handleSendInterest = async (profileId) => {
    try {
        const savedUser = JSON.parse(localStorage.getItem("user"));

        if (!savedUser) {
            toast.success("Please login to send interest");
            return;
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/interests/send`, {
            senderId: savedUser._id,
            receiverProfileId: profileId,
        });

        toast.success(response.data.message || "Interest sent successfully");
    } catch (error) {
        console.error("Interest failed:", error);
        toast.success(error.response?.data?.message || "Failed to send interest");
    }
};
export default function SearchProfiles() {
    const [filters, setFilters] = useState({
        gender: "",
        ageFrom: "",
        ageTo: "",
        caste: "",
        city: "",
    });

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/profiles/search`,
                {
                    params: filters,
                    page: 1,
                    limit: 20,
                }
            );

            setProfiles(response.data.profiles || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    return (

         <>
            <Header />
   
        <div className="search-page">
            <div className="search-container">

                <div className="search-header">
                    <h1>Find Your Life Partner</h1>
                    <p>Search verified Telugu matrimony profiles</p>
                </div>

                <div className="search-filters">
                    <select name="gender" value={filters.gender} onChange={handleChange}>
                        <option value="">Looking For</option>
                        <option value="Bride">Bride</option>
                        <option value="Groom">Groom</option>
                    </select>

                    <select name="ageFrom" value={filters.ageFrom} onChange={handleChange}>
                        <option value="">Age From</option>
                        <option value="21">21</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                    </select>

                    <select name="ageTo" value={filters.ageTo} onChange={handleChange}>
                        <option value="">Age To</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="35">35</option>
                    </select>

                    <input
                        type="text"
                        name="caste"
                        placeholder="Caste"
                        value={filters.caste}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={filters.city}
                        onChange={handleChange}
                    />

                    <button onClick={fetchProfiles}>
                        Search
                    </button>
                </div>

                <div className="results-title">
                    <h2>Search Results</h2>
                    <p>{profiles.length} profiles found</p>
                </div>

                {loading && <p className="loading-text">Loading profiles...</p>}

                {!loading && profiles.length === 0 && (
                    <div className="no-results">
                        <h3>No profiles found</h3>
                        <p>Try changing your search filters.</p>
                    </div>
                )}

                <div className="profile-results-grid">
                    {!loading && profiles.map((profile) => (
                        <div className="search-profile-card" key={profile._id}>
                            <div className="profile-photo-placeholder">
                                <img
                                    src={
                                        profile.profilePhoto
                                            ? `${import.meta.env.VITE_API_URL} /api/profiles/${profile.profilePhoto}`
                                            : logo
                                    }
                                    alt="Profile"
                                    onError={(e) => {
                                        e.currentTarget.src = logo;
                                    }}
                                />
                            </div>

                            <div className="profile-card-info">
                                <h3>{profile.fullName || "Profile Name Hidden"}</h3>

                                <p>
                                    {profile.age || "Age not added"} yrs • {profile.height || "Height not added"}
                                </p>

                                <p>{profile.education || "Education not added"}</p>
                                <p>{profile.occupation || "Occupation not added"}</p>
                                <p>{profile.city || "City not added"}</p>

                                <span>{profile.caste || "Caste not added"}</span>
                            </div>

                            <div className="profile-card-actions">
                                <button
                                    className="view-btn"
                                    onClick={() => navigate(`/profile/${profile._id}`)}
                                >
                                    View Profile
                                </button>
                                <button
                                    className="interest-btn"
                                    onClick={() => handleSendInterest(profile._id)}
                                >
                                    ❤️ Interest
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            </div>
        </>
    );
}