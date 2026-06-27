import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API_BASE_URL from "../config/api";
import logo from "../assets/hero.png";

export default function ProfileCard({ profile }) {

    const navigate = useNavigate();

    // ==========================================
    // Current logged-in user
    // ==========================================
    const savedUser = JSON.parse(localStorage.getItem("user"));

    // ==========================================
    // Admins & Premium users can see everything
    // ==========================================
    const canViewFullDetails =
        savedUser?.role === "admin" ||
        savedUser?.role === "super_admin" ||
        savedUser?.membershipPlan !== "free";

    // ==========================================
    // Mask name for free users
    // ==========================================
    const getDisplayName = (fullName) => {

        if (!fullName) {
            return "Profile Name Hidden";
        }

        if (canViewFullDetails) {
            return fullName;
        }

        return `${fullName.split(" ")[0]} ***`;
    };

    // ==========================================
    // View Profile Access Check
    // Free users -> 5 profiles only
    // Premium/Admin -> unlimited
    // ==========================================
    const handleViewProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const currentUser = JSON.parse(localStorage.getItem("user"));

            console.log("Current User:", currentUser);
            console.log("Token:", token);

            if (!currentUser) {
                toast.error("Please login to view profile");
                return;
            }

            if (!token) {
                toast.error("Login token missing. Please login again.");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/profiles/profile-view`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data.canView) {
                toast.error(response.data.message);
                return;
            }

            navigate(`/profile/${profile._id}`);

        } catch (error) {
            console.log("VIEW PROFILE ERROR:", error.response?.data || error.message);

            toast.error(
                error.response?.data?.message ||
                "Unable to view profile"
            );
        }
    };
    return (

        <div className="group bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-rose-100 hover:-translate-y-2">

            {/* ==========================================
                Profile Image
            ========================================== */}
            <div className="relative bg-gradient-to-br from-rose-50 via-white to-amber-50 pt-5 pb-4 flex justify-center">

                <div className="absolute top-0 left-0 w-full h-14 bg-[#800020]/10"></div>

                <div className="relative">

                    <img
                        src={
                            profile.profilePhoto
                                ? `${import.meta.env.VITE_API_URL}/api/profiles/${profile.profilePhoto}`
                                : logo
                        }
                        alt="Profile"
                        className={`w-56 h-64 rounded-2xl object-cover shadow-lg transition-all duration-300 ${!canViewFullDetails ? "blur-sm" : ""
                            }`}
                        onError={(e) => {
                            e.currentTarget.src = logo;
                        }}
                    />

                    {/* Premium lock */}
                    {!canViewFullDetails && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                            <span className="bg-white text-[#800020] px-4 py-2 rounded-full text-sm font-bold shadow">
                                🔒 Premium Only
                            </span>
                        </div>
                    )}

                </div>

            </div>

            {/* ==========================================
                Profile Details
            ========================================== */}
            <div className="px-5 pb-5 text-center">

                <div className="inline-block bg-amber-50 text-[#800020] px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    Verified
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-[#800020] mb-1">
                    {getDisplayName(profile.fullName)}
                </h3>

                {/* Age */}
                <h4 className="text-lg font-semibold text-gray-700">
                    {profile.age
                        ? `${profile.age} Years`
                        : "Age N/A"}
                </h4>

                {/* Occupation */}
                <p className="text-gray-700 text-sm font-medium mt-1">
                    {profile.occupation || "Occupation N/A"}
                </p>

                {/* Other details */}
                <div className="mt-3 space-y-1 text-gray-600 text-xs">

                    <p>
                        {profile.city || "City"}, {profile.state || ""}
                    </p>

                    <p>
                        {profile.caste || "Caste N/A"}
                    </p>

                    <p>
                        {profile.education || "Education N/A"}
                    </p>

                </div>

                {/* View Profile */}
                <button
                    onClick={handleViewProfile}
                    className="block w-full mt-4 bg-[#800020] text-white py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#5c0017] hover:shadow-lg transition-all duration-300"
                >
                    View Profile
                </button>

            </div>

        </div>
    );
}