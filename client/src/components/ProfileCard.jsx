import { useNavigate } from "react-router-dom";
import nvLogo from "../images/nvlogo-v1.png";

export default function ProfileCard({ profile }) {

    const navigate = useNavigate();

    const imageUrl = profile.profilePhoto
        ? `${import.meta.env.VITE_API_URL}/${profile.profilePhoto}`
        : nvLogo;

    return (
        <div
            className="
                relative overflow-hidden
                bg-gradient-to-br from-rose-50 via-white to-amber-50
                rounded-[28px]
                p-5
                border border-rose-100
                shadow-md
                hover:shadow-2xl
                hover:-translate-y-2
                transition-all duration-500
                h-[220px]
            "
        >

            {/* Top Row */}
            <div className="flex gap-4 items-start">

                {/* Photo */}
                <img
                    src={imageUrl}
                    alt="Profile"
                    className="
                        w-20 h-20
                        rounded-[18px]
                        object-cover
                        shadow-md
                        border border-rose-100
                        flex-shrink-0
                    "
                />

                {/* Profile Info */}
                <div className="flex-1 min-w-0">

                    <h3
                        className="
                            text-lg
                            font-bold
                            text-[#800020]
                            leading-tight
                        "
                    >
                        {profile.fullName || "Profile Hidden"}
                    </h3>

                    <p className="text-[15px] text-gray-700 mt-2 leading-5">
                        <span className="font-medium">Age:</span>{" "}
                        {profile.age || "N/A"}
                    </p>

                    <p className="text-[15px] text-gray-700 leading-5">
                        {profile.occupation || "Occupation N/A"}
                    </p>

                    <p className="text-sm text-amber-700 mt-1">
                        {profile.city || "City"}, {profile.caste || "Caste"}
                    </p>

                </div>

            </div>

            {/* About Section */}
            <p
                className="
                    mt-4
                    pr-32
                    text-[14px]
                    text-gray-600
                    leading-6
                "
            >
                <strong>About:</strong>{" "}
                {(profile.aboutMe ||
                    "Traditional family with good values.")
                    .substring(0, 80)}

                {(profile.aboutMe?.length || 0) > 80 && "..."}
            </p>

            {/* View Button */}
            <button
                onClick={() => navigate(`/profile/${profile._id}`)}
                className="
                    absolute
                    bottom-4
                    right-4
                    bg-[#800020]
                    text-white
                    px-5
                    py-2
                    rounded-2xl
                    text-sm
                    font-semibold
                    shadow-md
                    hover:bg-[#650018]
                    transition
                "
            >
                View Profile
            </button>

        </div>
    );
}