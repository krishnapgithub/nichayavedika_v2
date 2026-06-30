import nvLogo from "../images/nvlogo-v1.png";
import { API_BASE_URL } from "../config/api";

const getImageUrl = (profilePhoto) => {
    if (!profilePhoto) return nvLogo;
    if (profilePhoto.startsWith("http")) return profilePhoto;

    const photoPath = profilePhoto.replace(/\\/g, "/");

    if (photoPath.startsWith("uploads/")) {
        return `${API_BASE_URL}/${photoPath}`;
    }

    return `${API_BASE_URL}/uploads/${photoPath}`;
};

export default function ProfileCard({ profile, onView }) {
    const canShowPhoto = profile.showPhotosToMembers !== false && profile.profilePhoto;
    const imageUrl = canShowPhoto ? getImageUrl(profile.profilePhoto) : "";
    const aboutText = profile.aboutMe || "Traditional family with good values.";
    const aboutPreview = aboutText.substring(0, 120);
    const hasMoreAbout = aboutText.length > 120;
    const rawDisplayName = profile.fullName || "Premium Match";
    const isStarMaskedName = rawDisplayName.includes("***");
    const displayName = isStarMaskedName
        ? `${rawDisplayName.charAt(0).toUpperCase()} • Premium Match`
        : rawDisplayName;
    const isPremiumMaskedName = displayName.includes("Premium Match");

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
                h-[240px]
            "
        >

            {/* Top Row */}
            <div className="flex gap-4 items-start">

                {/* Photo */}
                {imageUrl ? (
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
                ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[18px] border border-amber-200 bg-amber-50 px-2 text-center text-[11px] font-bold leading-tight text-[#800020] shadow-md">
                        Photos Hidden
                    </div>
                )}

                {/* Profile Info */}
                <div className="flex-1 min-w-0">

                    {isPremiumMaskedName ? (
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-3 py-1 text-sm font-bold text-[#800020] shadow-sm">
                            <span className="text-amber-500">♥</span>
                            <span className="truncate">{displayName}</span>
                        </div>
                    ) : (
                        <h3
                            className="
                                text-lg
                                font-bold
                                text-[#800020]
                                leading-tight
                            "
                        >
                            {displayName}
                        </h3>
                    )}

                    {profile.profileNumber && (
                        <p className="mt-1 inline-flex rounded-full bg-[#fff8f2] px-3 py-1 text-xs font-bold text-[#800020] ring-1 ring-[#800020]/15">
                            {profile.profileNumber}
                        </p>
                    )}

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
                    pr-20
                    text-[14px]
                    text-gray-600
                    leading-6
                "
            >
                <strong>About:</strong>{" "}
                {aboutPreview}
                {hasMoreAbout && (
                    <button
                        type="button"
                        onClick={() => onView?.(profile)}
                        className="ml-1 font-semibold text-[#800020] hover:underline"
                    >
                        more
                    </button>
                )}
            </p>

            {/* View Button */}
            <button
                type="button"
                onClick={() => onView?.(profile)}
                className="
                    absolute
                    bottom-4
                    right-4
                    bg-[#800020]
                    text-white
                    px-4
                    py-2
                    rounded-2xl
                    text-xs
                    font-semibold
                    shadow-md
                    hover:bg-[#650018]
                    transition
                "
            >
                View
            </button>

        </div>
    );
}

