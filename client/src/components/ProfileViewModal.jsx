import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
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

const buildAdminDraft = (profile, includePendingReview = false) => {
    const pendingReviewData = includePendingReview ? profile?.pendingReviewData || {} : {};
    const source = {
        ...profile,
        ...pendingReviewData,
    };

    return {
    fullName: source?.fullName || "",
    gender: source?.gender || "",
    dateOfBirth: source?.dateOfBirth
        ? new Date(source.dateOfBirth).toISOString().slice(0, 10)
        : "",
    age: source?.age || "",
    height: source?.height || "",
    maritalStatus: source?.maritalStatus || "",
    motherTongue: source?.motherTongue || "",
    religion: source?.religion || "",
    caste: source?.caste || "",
    subCaste: source?.subCaste || "",
    gothram: source?.gothram || "",
    education: source?.education || "",
    occupation: source?.occupation || "",
    annualIncome: source?.annualIncome || "",
    city: source?.city || "",
    state: source?.state || "",
    country: source?.country || "India",
    familyDetails: source?.familyDetails || "",
    contactPreference: source?.contactPreference || "",
    aboutMe: source?.aboutMe || source?.about || "",
    preferredAgeFrom: source?.preferredAgeFrom || "",
    preferredAgeTo: source?.preferredAgeTo || "",
    preferredCaste: source?.preferredCaste || "",
    preferredLocation: source?.preferredLocation || "",
    profilePhoto: source?.profilePhoto || "",
    stylishPhotos: source?.stylishPhotos || [],
    showPhotosToMembers: source?.showPhotosToMembers !== false,
    };
};

const normalizeDraftValue = (value) => {
    if (Array.isArray(value)) return JSON.stringify(value.map((item) => item || ""));
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value === null || value === undefined) return "";

    return String(value).trim();
};

const getChangedUpdates = (draft, originalDraft) =>
    Object.keys(draft).reduce((changes, field) => {
        if (normalizeDraftValue(draft[field]) !== normalizeDraftValue(originalDraft[field])) {
            changes[field] = draft[field];
        }

        return changes;
    }, {});

const getSavedUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

const isFullAccessUser = (user, profile) => {
    const userRole = user?.role?.toLowerCase?.().trim();
    const membership = (
        user?.membershipPlan ||
        user?.membershipType ||
        user?.membership ||
        ""
    ).toString().toLowerCase();

    const isPremiumUser =
        membership === "premium" ||
        membership === "elite" ||
        userRole === "admin" ||
        userRole === "oper_admin" ||
        userRole === "super_admin";

    const isOwnProfile =
        Boolean(profile?.user) &&
        String(profile.user?._id || profile.user) === String(user?._id || user?.id);

    return Boolean(user && (isPremiumUser || isOwnProfile));
};

export default function ProfileViewModal({
    profile,
    onClose,
    onApprove,
    onReject,
    onDeactivate,
    onSave,
    guestPrompt = false,
    onRegister,
    showAdminActions = false,
}) {
    const [adminDraft, setAdminDraft] = useState({});
    const [adminPhotoFiles, setAdminPhotoFiles] = useState({});
    const [adminPhotoPreviews, setAdminPhotoPreviews] = useState({});
    const [sendingInterest, setSendingInterest] = useState(false);
    const [interestSent, setInterestSent] = useState(false);

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

    useEffect(() => {
        setAdminDraft(buildAdminDraft(profile, showAdminActions));
        setAdminPhotoFiles({});
        setAdminPhotoPreviews({});
        setInterestSent(false);
    }, [profile, showAdminActions]);

    if (!profile) return null;

    const viewer = getSavedUser();
    const effectiveGuestPrompt = guestPrompt && !viewer;
    const canViewFullDetails = showAdminActions || isFullAccessUser(viewer, profile);
    const shouldShowLimitedDetails = !effectiveGuestPrompt && !canViewFullDetails;
    const viewerRole = viewer?.role?.toLowerCase?.().trim();
    const viewerMembership = (
        viewer?.membershipPlan ||
        viewer?.membershipType ||
        viewer?.membership ||
        ""
    ).toString().toLowerCase();
    const isAdminViewer = ["admin", "oper_admin", "super_admin"].includes(viewerRole);
    const isOwnProfile =
        Boolean(profile?.user) &&
        String(profile.user?._id || profile.user) === String(viewer?._id || viewer?.id);
    const canSendInterest =
        !showAdminActions &&
        !isAdminViewer &&
        !isOwnProfile &&
        ["premium", "elite"].includes(viewerMembership);
    const canViewProfilePhotos =
        showAdminActions || isAdminViewer || isOwnProfile || profile.showPhotosToMembers !== false;
    const originalAdminDraft = buildAdminDraft(profile);
    const changedUpdates = getChangedUpdates(adminDraft, originalAdminDraft);
    const changedFields = Object.keys(changedUpdates);
    const hasPhotoFileChanges = Object.values(adminPhotoFiles).some(Boolean);
    const hasAdminChanges = changedFields.length > 0 || hasPhotoFileChanges;
    const isPendingChangeReview = showAdminActions && (profile.reviewChanges || []).length > 0;
    const photoUrl = canViewProfilePhotos
        ? adminPhotoPreviews.profilePhoto || getPhotoUrl(adminDraft.profilePhoto || profile.profilePhoto)
        : "";
    const location = [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(", ");
    const updateAdminDraft = (field, value) => {
        setAdminDraft((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const removeStylishPhoto = (index) => {
        setAdminDraft((prev) => {
            const stylishPhotos = [...(prev.stylishPhotos || [])];
            stylishPhotos[index] = "";

            return {
                ...prev,
                stylishPhotos,
            };
        });
    };
    const updateAdminPhotoFile = (field, file) => {
        const previewUrl = file ? URL.createObjectURL(file) : "";

        setAdminPhotoFiles((prev) => ({
            ...prev,
            [field]: file,
        }));
        setAdminPhotoPreviews((prev) => ({
            ...prev,
            [field]: previewUrl,
        }));
    };
    const deletePrimaryPhoto = () => {
        updateAdminDraft("profilePhoto", "");
        setAdminPhotoFiles((prev) => ({
            ...prev,
            profilePhoto: null,
        }));
        setAdminPhotoPreviews((prev) => ({
            ...prev,
            profilePhoto: "",
        }));
    };
    const handleSendInterest = async () => {
        try {
            const senderId = viewer?._id || viewer?.id;
            const token = localStorage.getItem("token");

            if (!senderId || !token) {
                toast.error("Please login to send interest");
                return;
            }

            setSendingInterest(true);

            const response = await axios.post(
                `${API_BASE_URL}/api/interests/send`,
                {
                    senderId,
                    receiverProfileId: profile._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setInterestSent(true);
            toast.success(response.data?.message || "Interest sent successfully");
        } catch (error) {
            console.error("Interest failed:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Failed to send interest");
        } finally {
            setSendingInterest(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black/55 px-4 py-6">
            <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-white px-5 py-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            {profile.profileNumber || "Profile"}
                        </p>
                        <h2 className="text-2xl font-bold text-[#800020]">
                            {profile.fullName || profile.name || "Profile"}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canSendInterest && (
                            <button
                                type="button"
                                onClick={handleSendInterest}
                                disabled={sendingInterest || interestSent}
                                className="rounded-full border border-[#800020] bg-white px-4 py-2 text-sm font-bold text-[#800020] shadow-sm hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:border-green-500 disabled:text-green-700 disabled:opacity-80"
                            >
                                {interestSent
                                    ? "Interest Sent"
                                    : sendingInterest
                                        ? "Sending..."
                                        : "Send Interest"}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {effectiveGuestPrompt && (
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
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={profile.fullName || "Profile"}
                                className="h-72 w-full rounded-2xl object-cover shadow"
                            />
                        ) : (
                            <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-center text-sm font-bold text-[#800020] shadow">
                                Photos Hidden
                            </div>
                        )}

                        <div className="mt-4 rounded-2xl bg-[#fff8f2] p-4 text-sm text-gray-700">
                            <p className="font-bold text-[#800020]">
                                {profile.age || "Age N/A"} years
                            </p>
                            <p className="mt-1">{valueOrDash(location)}</p>
                            <p className="mt-1">
                                {valueOrDash(profile.caste)}
                            </p>
                        </div>

                        {showAdminActions && (
                            <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4">
                                <h3 className="text-sm font-bold text-[#800020]">Photos</h3>
                                <label className="mt-3 block rounded-xl border border-rose-100 bg-[#fff8f2] px-3 py-2 text-sm font-bold text-[#800020]">
                                    Replace Primary Photo
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={(event) => updateAdminPhotoFile("profilePhoto", event.target.files?.[0] || null)}
                                        className="mt-2 block w-full text-xs font-medium text-gray-600"
                                    />
                                    {adminPhotoFiles.profilePhoto && (
                                        <span className="mt-1 block truncate text-xs text-gray-500">
                                            {adminPhotoFiles.profilePhoto.name}
                                        </span>
                                    )}
                                </label>
                                <button
                                    type="button"
                                    onClick={deletePrimaryPhoto}
                                    className="mt-3 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                                >
                                    Delete Primary Photo
                                </button>

                                {[0, 1].map((index) => (
                                    <label
                                        key={`stylish-upload-${index}`}
                                        className="mt-3 block rounded-xl border border-rose-100 bg-[#fff8f2] px-3 py-2 text-sm font-bold text-[#800020]"
                                    >
                                        Replace Stylish Photo {index + 1}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={(event) => updateAdminPhotoFile(`stylishPhoto${index}`, event.target.files?.[0] || null)}
                                            className="mt-2 block w-full text-xs font-medium text-gray-600"
                                        />
                                        {adminPhotoFiles[`stylishPhoto${index}`] && (
                                            <span className="mt-1 block truncate text-xs text-gray-500">
                                                {adminPhotoFiles[`stylishPhoto${index}`].name}
                                            </span>
                                        )}
                                    </label>
                                ))}

                                {(adminDraft.stylishPhotos || []).map((photo, index) => (
                                    photo ? (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => removeStylishPhoto(index)}
                                            className="mt-2 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                                        >
                                            Delete Stylish Photo {index + 1}
                                        </button>
                                    ) : null
                                ))}
                            </div>
                        )}
                    </div>

                    {showAdminActions ? (
                        <AdminProfileEditor
                            draft={adminDraft}
                            changedFields={changedFields}
                            onChange={updateAdminDraft}
                        />
                    ) : effectiveGuestPrompt ? (
                        <GuestProfilePreview profile={profile} />
                    ) : shouldShowLimitedDetails ? (
                        <FreeUserProfilePreview profile={profile} />
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
                        {hasAdminChanges && (
                            <div className="mr-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-[#800020]">
                                {changedFields.length + (hasPhotoFileChanges ? 1 : 0)} change{changedFields.length + (hasPhotoFileChanges ? 1 : 0) === 1 ? "" : "s"} ready
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (!hasAdminChanges) {
                                    toast.error("No profile changes to save");
                                    return;
                                }

                                onSave?.(profile._id, changedUpdates, adminPhotoFiles);
                            }}
                            className="rounded-xl bg-[#800020] px-5 py-2 font-semibold text-white hover:bg-[#5c0017]"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject?.(profile._id)}
                            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                        >
                            {isPendingChangeReview ? "Reject Changes" : "Reject"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onDeactivate?.(profile._id)}
                            className="rounded-xl bg-gray-700 px-5 py-2 font-semibold text-white hover:bg-gray-800"
                        >
                            Deactivate
                        </button>
                        <button
                            type="button"
                            onClick={() => onApprove?.(profile._id)}
                            className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                        >
                            {isPendingChangeReview ? "Approve Changes" : "Approve"}
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

function AdminProfileEditor({ draft, changedFields, onChange }) {
    const fields = [
        ["fullName", "Full Name"],
        ["dateOfBirth", "Date of Birth", "date"],
        ["age", "Age"],
        ["height", "Height"],
        ["maritalStatus", "Marital Status"],
        ["motherTongue", "Mother Tongue"],
        ["religion", "Religion"],
        ["caste", "Caste"],
        ["subCaste", "Sub Caste"],
        ["gothram", "Gothram"],
        ["education", "Education"],
        ["occupation", "Occupation"],
        ["annualIncome", "Annual Income"],
        ["city", "City"],
        ["state", "State"],
        ["country", "Country"],
        ["contactPreference", "Contact Preference"],
        ["preferredAgeFrom", "Preferred Age From"],
        ["preferredAgeTo", "Preferred Age To"],
        ["preferredCaste", "Preferred Caste"],
        ["preferredLocation", "Preferred Location"],
    ];
    const isChanged = (field) => changedFields.includes(field);
    const fieldClass = (field, extra = "") =>
        `rounded-xl border p-3 transition ${
            isChanged(field)
                ? "border-amber-300 bg-amber-50 shadow-[0_0_0_2px_rgba(245,158,11,0.18)]"
                : "border-rose-100 bg-white"
        } ${extra}`;
    const changedLabel = (field) =>
        isChanged(field) ? (
            <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-[#800020]">
                Changed
            </span>
        ) : null;

    return (
        <div className="space-y-5">
            <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#800020]">Admin Edit</h3>
                    {changedFields.length > 0 && (
                        <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-[#800020]">
                            Highlighted fields were edited
                        </p>
                    )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className={fieldClass("showPhotosToMembers", "sm:col-span-2")}>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                            Photo Consent {changedLabel("showPhotosToMembers")}
                        </span>
                        <span className="mt-2 flex items-start gap-3 text-sm font-semibold text-gray-800">
                            <input
                                type="checkbox"
                                checked={draft.showPhotosToMembers !== false}
                                onChange={(event) =>
                                    onChange("showPhotosToMembers", event.target.checked)
                                }
                                className="mt-1 h-5 w-5 accent-[#800020]"
                            />
                            Family agreed photos can be shown to other brides or grooms.
                        </span>
                    </label>

                    {fields.map(([field, label, type = "text"]) => (
                        <label key={field} className={fieldClass(field)}>
                            <span className="text-xs font-semibold uppercase text-gray-500">
                                {label} {changedLabel(field)}
                            </span>
                            <input
                                type={type}
                                value={draft[field] || ""}
                                onChange={(event) => onChange(field, event.target.value)}
                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-[#800020]"
                            />
                        </label>
                    ))}

                    <label className={fieldClass("gender")}>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                            Gender {changedLabel("gender")}
                        </span>
                        <select
                            value={draft.gender || ""}
                            onChange={(event) => onChange("gender", event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-[#800020]"
                        >
                            <option value="">Select Gender</option>
                            <option value="Bride">Bride</option>
                            <option value="Groom">Groom</option>
                        </select>
                    </label>

                    <label className={fieldClass("familyDetails", "sm:col-span-2")}>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                            Family Details {changedLabel("familyDetails")}
                        </span>
                        <textarea
                            value={draft.familyDetails || ""}
                            onChange={(event) => onChange("familyDetails", event.target.value)}
                            rows="3"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-[#800020]"
                        />
                    </label>

                    <label className={fieldClass("aboutMe", "sm:col-span-2")}>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                            About {changedLabel("aboutMe")}
                        </span>
                        <textarea
                            value={draft.aboutMe || ""}
                            onChange={(event) => onChange("aboutMe", event.target.value)}
                            rows="3"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-[#800020]"
                        />
                    </label>
                </div>
            </section>
        </div>
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

function FreeUserProfilePreview({ profile }) {
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
                    To view more details, please upgrade to Premium.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <LockedInfo label="Height" />
                    <LockedInfo label="Marital Status" />
                    <LockedInfo label="Gothram" />
                    <LockedInfo label="Annual Income" />
                    <LockedInfo label="Family Details" />
                    <LockedInfo label="Preferences" />
                </div>

                <Link
                    to="/membership"
                    className="mt-4 inline-flex rounded-xl bg-[#800020] px-5 py-2 text-sm font-bold text-white shadow hover:bg-[#5c0017]"
                >
                    Upgrade to Premium
                </Link>
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
