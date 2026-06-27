import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function SearchProfiles() {

    const navigate = useNavigate();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleViewProfile = async (profileId) => {
        try {
            const token = localStorage.getItem("token");
            const savedUser = JSON.parse(localStorage.getItem("user"));

            if (!token || !savedUser) {
                toast.error("Please login to view profile");
                return;
            }

            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/profiles/users/${savedUser._id}/profile-view`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate(`/profile/${profileId}`);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to view profile"
            );
        }
    };

    return (
        <div>
            {/* your search profile JSX goes here */}
        </div>
    );
}

export default SearchProfiles;