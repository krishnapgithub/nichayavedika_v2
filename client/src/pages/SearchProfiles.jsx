import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Header from "../components/Header.jsx";
import ProfileCard from "../components/ProfileCard";


import { useNavigate } from "react-router-dom";

function SearchProfiles() {

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

    const [filters, setFilters] = useState({
        gender: "",
        ageFrom: "",
        ageTo: "",
        caste: "",
        city: "",
    });

    const handleSearch = async () => {
        console.log("Search button clicked");

        try {
            setLoading(true);

            console.log("API URL:", import.meta.env.VITE_API_URL);

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE_URL}/api/profiles/search`,
                {
                    params: filters,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("SEARCH RESPONSE:", res.data);

            setProfiles(res.data.profiles || []);
        } catch (error) {
            console.log("SEARCH ERROR:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    return (

        <>

         <Header />

        <div className="max-w-7xl mx-auto py-10 px-6">

            <h2 className="text-3xl font-bold text-center text-[#800020] mb-8">
                Search Profiles
            </h2>

            {/* Search Filters */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                    <select
                        value={filters.gender}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                gender: e.target.value,
                            })
                        }
                        className="border rounded-xl p-3"
                    >
                        <option value="">Bride / Groom</option>
                        <option value="Bride">Bride</option>
                        <option value="Groom">Groom</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Age From"
                        value={filters.ageFrom}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                ageFrom: e.target.value,
                            })
                        }
                        className="border rounded-xl p-3"
                    />

                    <input
                        type="number"
                        placeholder="Age To"
                        value={filters.ageTo}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                ageTo: e.target.value,
                            })
                        }
                        className="border rounded-xl p-3"
                    />

                    <input
                        type="text"
                        placeholder="Caste"
                        value={filters.caste}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                caste: e.target.value,
                            })
                        }
                        className="border rounded-xl p-3"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="bg-[#800020] text-white rounded-xl p-3"
                    >
                        Search
                    </button>

                </div>

            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {Array.isArray(profiles) &&
                    profiles.map((profile) => (
                        <ProfileCard
                            key={profile._id}
                            profile={profile}
                        />
                    ))}

            </div>

        </div>

        </>
    );
    
}

export default SearchProfiles;