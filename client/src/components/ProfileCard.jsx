

import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";




const handleViewProfile = async (profileId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        toast.success("Please login to view profile");
        return;
    }

    const response = await axios.put(
        `${API_BASE_URL}/users/${user._id}/profile-view`
    );

    if (!response.data.allowed) {
        toast.success(response.data.message);
        return;
    }

    navigate('/profile/${profileId}');
};

export default function ProfileCard({ profile }) {

    const navigate = useNavigate();

    const handleViewProfile = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            toast.success("Please login to view profile");
            return;
        }

        const response = await axios.put(
            `${API_BASE_URL}/profiles/users/${user._id}/profile-view`
        );

        if (!response.data.allowed) {
            toast.success(response.data.message);
            return;
        }

        toast.success(response.data.message);
        navigate(`/profile/${profile._id}`);
    };

    return (
        <div className="group bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-rose-100 hover:-translate-y-2">

            {/* Profile Image */}
            <div className="relative bg-gradient-to-br from-rose-50 via-white to-amber-50 pt-5 pb-4 flex justify-center">
                <div className="absolute top-0 left-0 w-full h-14 bg-[#800020]/10"></div>

                <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#800020] to-amber-500 shadow-lg">
                    <img
                        src={profile.profilePhoto || "/default-profile.png"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover bg-white transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
            </div>

            {/* Profile Details */}
            <div className="px-5 pb-5 text-center">

                <div className="inline-block bg-amber-50 text-[#800020] px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    Verified
                </div>

                <h3 className="text-xl font-bold text-[#800020]">
                    {profile.age ? `${profile.age} Years` : "Age N/A"}
                </h3>

                <p className="text-gray-700 text-sm font-medium mt-1">
                    {profile.occupation || "Occupation N/A"}
                </p>

                <div className="mt-3 space-y-1 text-gray-600 text-xs">
                    <p>
                        {profile.city || "City"}, {profile.state || ""}
                    </p>
                    <p>{profile.caste || "Caste N/A"}</p>
                    <p>{profile.education || "Education N/A"}</p>
                </div>

                <button
                    onClick={handleViewProfile}
                    className="block w-full mt-4 bg-[#800020] text-white py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#5c0017] hover:shadow-lg transition-all duration-300"
                >
                    View Profile
                </button>

                {/* <Link
                    to={`/profile/${profile._id}`}
                    className="block mt-4 bg-[#800020] text-white py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#5c0017] hover:shadow-lg transition-all duration-300"
                >
                    View Profile
                </Link>*/}
            </div>
        </div>
    );
}