import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/searchProfiles.css";

function SearchProfiles() {
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        gender: "",
        ageFrom: "",
        ageTo: "",
        caste: "",
        city: "",
    });

    const token = localStorage.getItem("token");

    const fetchProfiles = async () => {
        try {
            setLoading(true);

            if (!token) {
                toast.error("Please login to search profiles");
                return;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/profiles/search`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: filters,
                }
            );

            setProfiles(res.data.profiles || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to load profiles"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProfiles();
    };

    const handleViewProfile = async (profileId) => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));

            if (!token || !savedUser) {
                toast.error("Please login to view profile");
                return;
            }

            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/profiles/profile-view`,
                { profileId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate(`/profile/${profileId}`);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to view profile"
            );
        }
    };

    return (
        <div className="search-page">
            <div className="search-container">
                <h1 className="search-title">Search Profiles</h1>
                <p className="search-subtitle">
                    Find suitable Telugu bride and groom profiles
                </p>

                <form className="search-filter-card" onSubmit={handleSearch}>
                    <select name="gender" value={filters.gender} onChange={handleChange}>
                        <option value="">Looking For</option>
                        <option value="Bride">Bride</option>
                        <option value="Groom">Groom</option>
                    </select>

                    <input
                        type="number"
                        name="ageFrom"
                        placeholder="Age From"
                        value={filters.ageFrom}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="ageTo"
                        placeholder="Age To"
                        value={filters.ageTo}
                        onChange={handleChange}
                    />

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

                    <button type="submit">
                        Search
                    </button>
                </form>

                {loading && (
                    <p className="search-loading">Loading profiles...</p>
                )}

                {!loading && profiles.length === 0 && (
                    <p className="no-results">No profiles found</p>
                )}

                <div className="profile-grid">
                    {profiles.map((profile) => (
                        <div className="search-profile-card" key={profile._id}>
                            <div className="profile-photo-box">
                                {profile.profilePhoto ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/${profile.profilePhoto}`}
                                        alt={profile.user?.fullName || "Profile"}
                                    />
                                ) : (
                                    <div className="profile-placeholder">
                                        {profile.gender === "Bride" ? "👰" : "🤵"}
                                    </div>
                                )}
                            </div>

                            <div className="profile-card-body">
                                <h3>{profile.user?.fullName || "Profile"}</h3>
                                <p>{profile.age} years • {profile.gender}</p>
                                <p>{profile.caste || "Caste not added"}</p>
                                <p>{profile.city || "City not added"}</p>
                                <p>{profile.occupation || "Occupation not added"}</p>

                                <button
                                    onClick={() => handleViewProfile(profile._id)}
                                    className="view-profile-btn"
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchProfiles;