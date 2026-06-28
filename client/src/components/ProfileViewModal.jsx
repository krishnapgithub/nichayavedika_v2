import { useEffect } from "react";
import nvLogo from "../images/nvlogo-v1.png";
import { API_BASE_URL } from "../config/api";

const getPhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return nvLogo;
    if (profilePhoto.startsWith("http")) return profilePhoto;

    const photoPath = profilePhoto.replace(/\\/g, "/");

    return photoPath.startsWith("uploads/")
        ? `${API_BASE_URL}/${photoPath}`
        : `${API_BASE_URL}/uploads/${photoPath}`;
};

const valueOrDash = (value) => value || "Not provided";

export default function ProfileViewModal({
    profile,
    onClose,
    onApprove,
    onReject,
    guestPrompt = false,
    onRegister,
    showAdminActions = false,
}) {
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEscape);
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [onClose]);

    if (!profile) return null;

    const photoUrl = getPhotoUrl(profile.profilePhoto);
    const location = [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black/55 px-4 py-6">
            <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rose-100 bg-white px-5 py-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            {profile.profileNumber || "Profile"}
                        </p>
                        <h2 className="text-2xl font-bold text-[#800020]">
                            {profile.fullName || profile.name || "Profile"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>

                {guestPrompt && (
                    <div className="border-b border-amber-200 bg-gradient-to-r from-[#800020] via-[#9b1235] to-amber-600 px-5 py-4 text-white">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-lg font-bold">
                                    Register free to view full profile details
                                </p>
                                <p className="text-sm text-white/90">
                                    Create your profile to unlock more details and connect with families.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onRegister}
                                className="rounded-xl bg-white px-5 py-2 font-bold text-[#800020] shadow hover:bg-amber-100"
                            >
                                Register Free
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 p-5 lg:grid-cols-[260px_1fr]">
                    <div>
                        <img
                            src={photoUrl}
                            alt={profile.fullName || "Profile"}
                            className="h-72 w-full rounded-2xl object-cover shadow"
                        />

                        <div className="mt-4 rounded-2xl bg-[#fff8f2] p-4 text-sm text-gray-700">
                            <p className="font-bold text-[#800020]">
                                {profile.age || "Age N/A"} years
                            </p>
                            <p className="mt-1">{valueOrDash(location)}</p>
                            <p className="mt-1">
                                {valueOrDash(profile.caste)}
                            </p>
                        </div>
                    </div>

                    {guestPrompt ? (
                        <GuestProfilePreview profile={profile} />
                    ) : (
                        <div className="space-y-5">
                            <ProfileSection title="Basic Details">
                                <Info label="Height" value={profile.height} />
                                <Info label="Marital Status" value={profile.maritalStatus} />
                                <Info label="Mother Tongue" value={profile.motherTongue} />
                                <Info label="Religion" value={profile.religion} />
                                <Info label="Gothram" value={profile.gothram} />
                                <Info label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                            </ProfileSection>

                            <ProfileSection title="Education & Career">
                                <Info label="Education" value={profile.education} />
                                <Info label="Occupation" value={profile.occupation} />
                                <Info label="Annual Income" value={profile.annualIncome} />
                            </ProfileSection>

                            <ProfileSection title="Preferences">
                                <Info label="Age From" value={profile.preferredAgeFrom} />
                                <Info label="Age To" value={profile.preferredAgeTo} />
                                <Info label="Preferred Caste" value={profile.preferredCaste} />
                                <Info label="Preferred Location" value={profile.preferredLocation} />
                            </ProfileSection>

                            <ProfileSection title="Family & About">
                                <Info label="Family Details" value={profile.familyDetails} wide />
                                <Info label="About" value={profile.aboutMe || profile.about} wide />
                            </ProfileSection>
                        </div>
                    )}
                </div>

                {showAdminActions && (
                    <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-rose-100 bg-white px-5 py-4">
                        <button
                            type="button"
                            onClick={() => onReject?.(profile._id)}
                            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                        >
                            Reject
                        </button>
                        <button
                            type="button"
                            onClick={() => onApprove?.(profile._id)}
                            className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                        >
                            Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileSection({ title, children }) {
    return (
        <section>
            <h3 className="mb-3 text-lg font-bold text-[#800020]">{title}</h3>
            <div className="grid gap-3 sm:grid-cols-2">{children}</div>
        </section>
    );
}

function GuestProfilePreview({ profile }) {
    return (
        <div className="space-y-5">
            <ProfileSection title="Profile Preview">
                <Info label="Age" value={profile.age} />
                <Info label="Education" value={profile.education} />
                <Info label="Occupation" value={profile.occupation} />
                <Info label="City" value={profile.city} />
                <Info label="Caste" value={profile.caste} />
                <Info label="About" value={profile.aboutMe || profile.about} wide />
            </ProfileSection>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-lg font-bold text-[#800020]">
                    Locked Details
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                    Register free to view complete profile information.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <LockedInfo label="Height" />
                    <LockedInfo label="Marital Status" />
                    <LockedInfo label="Gothram" />
                    <LockedInfo label="Annual Income" />
                    <LockedInfo label="Family Details" />
                    <LockedInfo label="Preferences" />
                </div>
            </section>
        </div>
    );
}

function LockedInfo({ label }) {
    return (
        <div className="rounded-xl border border-amber-200 bg-white/80 p-3">
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-[#800020]">Locked</p>
        </div>
    );
}

function Info({ label, value, wide = false }) {
    return (
        <div className={`rounded-xl border border-rose-100 bg-white p-3 ${wide ? "sm:col-span-2" : ""}`}>
            <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
                {valueOrDash(value)}
            </p>
        </div>
    );
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString();
}
