import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileViewModal from "../components/ProfileViewModal.jsx";
import toast from "react-hot-toast";
import nvLogo from "../images/nvlogo-v1.png";

const PAGE_SIZE = 20;
const PROFILE_STATUS_OPTIONS = [
    ["all", "All Profiles"],
    ["approved", "Approved"],
    ["pending", "Pending Approval"],
    ["rejected", "Rejected"],
    ["deactivated", "Deactivated"],
];
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const ASSISTED_INITIAL_FORM = {
    accountFullName: "",
    mobile: "",
    email: "",
    password: "",
    registeringFor: "Self",
    fullName: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    height: "",
    maritalStatus: "Never Married",
    motherTongue: "Telugu",
    religion: "Hindu",
    caste: "",
    subCaste: "",
    gothram: "",
    education: "",
    occupation: "",
    annualIncome: "",
    city: "",
    state: "",
    country: "India",
    familyDetails: "",
    contactPreference: "Phone",
    aboutMe: "",
    preferredAgeFrom: "",
    preferredAgeTo: "",
    preferredCaste: "",
    preferredLocation: "",
    status: "approved",
    profilePhoto: null,
    stylishPhoto0: null,
    stylishPhoto1: null,
    showPhotosToMembers: true,
};

const getPhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return nvLogo;
    if (profilePhoto.startsWith("http")) return profilePhoto;

    const photoPath = profilePhoto.replace(/\\/g, "/");

    return photoPath.startsWith("uploads/")
        ? `${API_BASE_URL}/${photoPath}`
        : `${API_BASE_URL}/uploads/${photoPath}`;
};

const getStatusLabel = (status) => {
    const match = PROFILE_STATUS_OPTIONS.find(([value]) => value === status);
    return match?.[1] || "Pending Approval";
};

const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatHistoryValue = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "-";
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (value === null || value === undefined || value === "") return "-";
    if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return formatDateTime(value);

    return String(value);
};

const getExpectedGender = (registeringFor) => {
    if (["Son", "Brother"].includes(registeringFor)) return "Groom";
    if (["Daughter", "Sister"].includes(registeringFor)) return "Bride";
    return "";
};

const PROFILE_VIEW_LIMITS = {
    free: 5,
    premium: 20,
    elite: 40,
};

const getProfileViewSummary = (profile) => {
    const user = profile?.user && typeof profile.user === "object" ? profile.user : {};
    const plan = String(user.membershipPlan || profile?.membershipPlan || "free").toLowerCase();
    const limit = PROFILE_VIEW_LIMITS[plan] ?? PROFILE_VIEW_LIMITS.free;
    const used = Math.max(user.profileViewsUsed || 0, user.viewedProfileIds?.length || 0);
    const pending = Math.max(limit - used, 0);

    return { limit, used, pending, plan };
};

export default function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isAssistedCreateOpen, setIsAssistedCreateOpen] = useState(false);
    const [historyProfile, setHistoryProfile] = useState(null);
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = loggedInUser?.role?.toLowerCase?.().trim();
    const canReviewProfiles = ["admin", "oper_admin", "super_admin"].includes(userRole);
    const isSuperAdmin = userRole === "super_admin";

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    useEffect(() => {
        fetchPendingProfiles(1, "", "all");
    }, []);

    const fetchPendingProfiles = async (
        pageToLoad = page,
        searchToUse = search,
        statusToUse = statusFilter
    ) => {
        try {
            if (!canReviewProfiles) return;

            setLoading(true);

            const res = await axios.get(
                `${API_BASE_URL}/api/profiles/admin/pending`,
                {
                    ...authConfig(),
                    params: {
                        search: searchToUse,
                        status: statusToUse,
                        page: pageToLoad,
                        limit: PAGE_SIZE,
                    },
                }
            );

            setProfiles(res.data.profiles || []);
            setPage(Number(res.data.page || pageToLoad));
            setStatusFilter(statusToUse);
            setTotalPages(Number(res.data.totalPages || 1));
            setTotal(Number(res.data.total || 0));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to load profiles");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (profileId, status) => {
        try {
            if (!canReviewProfiles) return;

            await axios.put(
                `${API_BASE_URL}/api/profiles/admin/${profileId}/status`,
                { status },
                authConfig()
            );

            toast.success(`Profile ${status}`);
            setSelectedProfile(null);
            fetchPendingProfiles(page, search, statusFilter);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to update profile");
        }
    };

    const saveProfileUpdates = async (profileId, updates, photoFiles = {}) => {
        try {
            if (!canReviewProfiles) return;

            const currentStatus = selectedProfile?.status || "pending";
            const hasPhotoUploads = Boolean(
                photoFiles.profilePhoto ||
                photoFiles.stylishPhoto0 ||
                photoFiles.stylishPhoto1
            );
            const payload = hasPhotoUploads ? new FormData() : {
                status: currentStatus,
                updates,
            };
            const config = authConfig();

            if (hasPhotoUploads) {
                payload.append("status", currentStatus);
                payload.append("updates", JSON.stringify(updates));

                if (photoFiles.profilePhoto) {
                    payload.append("profilePhoto", photoFiles.profilePhoto);
                }

                if (photoFiles.stylishPhoto0) {
                    payload.append("stylishPhoto0", photoFiles.stylishPhoto0);
                }

                if (photoFiles.stylishPhoto1) {
                    payload.append("stylishPhoto1", photoFiles.stylishPhoto1);
                }

            }

            const res = await axios.put(
                `${API_BASE_URL}/api/profiles/admin/${profileId}/status`,
                payload,
                config
            );

            toast.success("Profile updated");
            setSelectedProfile(res.data.profile);
            setProfiles((currentProfiles) =>
                currentProfiles.map((profile) =>
                    profile._id === res.data.profile?._id ? res.data.profile : profile
                )
            );
            fetchPendingProfiles(page, search, statusFilter);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to save profile changes");
        }
    };

    const createAssistedProfile = async (formData) => {
        try {
            if (!canReviewProfiles) return;

            const payload = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") return;
                payload.append(key, value);
            });

            const config = authConfig();
            config.headers = {
                ...config.headers,
                "Content-Type": "multipart/form-data",
            };

            const res = await axios.post(
                `${API_BASE_URL}/api/profiles/admin/assisted-create`,
                payload,
                config
            );

            toast.success(res.data?.message || "Assisted profile created");
            setIsAssistedCreateOpen(false);
            fetchPendingProfiles(1, search, statusFilter);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to create assisted profile");
        }
    };

    const revertProfileChange = async (profileId, changeId) => {
        const confirmed = window.confirm("Revert this profile to the selected previous version?");

        if (!confirmed) return;

        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/profiles/admin/${profileId}/revert/${changeId}`,
                {},
                authConfig()
            );

            toast.success(res.data?.message || "Profile version restored");
            setHistoryProfile(res.data.profile);
            setSelectedProfile((current) =>
                current?._id === res.data.profile?._id ? res.data.profile : current
            );
            setProfiles((currentProfiles) =>
                currentProfiles.map((profile) =>
                    profile._id === res.data.profile?._id ? res.data.profile : profile
                )
            );
            fetchPendingProfiles(page, search, statusFilter);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to revert profile version");
        }
    };

    const handleSearch = () => {
        fetchPendingProfiles(1, search, statusFilter);
    };

    const handleClear = () => {
        setSearch("");
        setStatusFilter("all");
        fetchPendingProfiles(1, "", "all");
    };

    const handlePageChange = (nextPage) => {
        fetchPendingProfiles(nextPage, search, statusFilter);
    };

    const handleStatusFilterChange = (nextStatus) => {
        setStatusFilter(nextStatus);
        fetchPendingProfiles(1, search, nextStatus);
    };

    if (!canReviewProfiles) {
        return (
            <>

                <div className="min-h-screen bg-[#fff8f2] px-4 pt-44 text-center font-bold text-red-700 lg:pt-56">
                    Access denied. Admin only.
                </div>
            </>
        );
    }

    return (
        <>

            <div className="min-h-screen bg-[#fff8f2] px-4 pb-12 pt-44 lg:pt-56">
                <div className="mx-auto max-w-7xl">
                    <nav className="mb-3 text-sm font-medium text-gray-500">
                        <Link to="/" className="hover:text-[#800020]">
                            Home
                        </Link>
                        <span className="mx-2 text-amber-600">/</span>
                        <span className="text-[#800020]">Admin Profile Management</span>
                    </nav>

                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-[#800020]">
                                Admin Profile Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View approved, pending, rejected, and deactivated profiles.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchPendingProfiles(page, search, statusFilter)}
                            className="rounded-xl border border-[#800020] px-4 py-2 font-semibold text-[#800020] hover:bg-white"
                        >
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAssistedCreateOpen(true)}
                            className="rounded-xl bg-[#800020] px-4 py-2 font-semibold text-white hover:bg-[#5c0017]"
                        >
                            Create Assisted Profile
                        </button>
                    </div>

                    <div className="mb-6 rounded-2xl bg-white p-4 shadow">
                        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                                placeholder="Search by Profile No or name, example PN000002"
                                className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#800020]"
                            />

                            <select
                                value={statusFilter}
                                onChange={(event) => handleStatusFilterChange(event.target.value)}
                                className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#800020]"
                            >
                                {PROFILE_STATUS_OPTIONS.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={handleSearch}
                                className="rounded-xl bg-[#800020] px-6 py-3 font-semibold text-white"
                            >
                                Search
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-xl border border-[#800020] px-6 py-3 font-semibold text-[#800020]"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                            <span>Showing {profiles.length} of {total} profiles</span>
                            <span>Page {page} of {totalPages}</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow">
                            Loading profiles...
                        </div>
                    )}

                    {!loading && profiles.length === 0 && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow">
                            No profiles found.
                        </div>
                    )}

                    <div className="grid gap-4 xl:grid-cols-2">
                        {profiles.map((profile) => {
                            const hasReviewChanges = (profile.reviewChanges || []).length > 0;
                            const hasHistory = (profile.changeHistory || []).length > 0;
                            const viewSummary = getProfileViewSummary(profile);

                            return (
                            <div
                                key={profile._id}
                                className={`grid gap-4 rounded-2xl border p-4 text-gray-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[88px_minmax(0,1fr)] ${
                                    hasReviewChanges
                                        ? "border-amber-300 bg-gradient-to-br from-amber-100 via-white to-rose-50 ring-2 ring-amber-200"
                                        : "border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 hover:border-[#800020]/30"
                                }`}
                            >
                                <div className="flex items-center gap-4 md:block">
                                    <img
                                        src={getPhotoUrl(profile.profilePhoto)}
                                        alt={profile.fullName || "Profile"}
                                        className="h-20 w-20 flex-shrink-0 rounded-xl border border-rose-100 bg-[#fff8f2] object-cover shadow-md md:h-[88px] md:w-[88px]"
                                    />
                                    <p className="mt-0 rounded-full bg-white px-3 py-1 text-center text-[11px] font-bold text-[#800020] ring-1 ring-[#800020]/15 md:mt-2">
                                        {hasReviewChanges ? "Change Review" : getStatusLabel(profile.status)}
                                    </p>
                                    {hasReviewChanges && (
                                        <p className="mt-2 rounded-full bg-amber-500 px-3 py-1 text-center text-[11px] font-bold text-white shadow">
                                            Modified
                                        </p>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-lg font-bold leading-tight text-[#800020]">
                                            Name: {profile.fullName || "Profile"}
                                        </h2>
                                        {profile.profileNumber && (
                                            <span className="rounded-full bg-[#fff8f2] px-2 py-1 text-xs font-bold text-[#800020] ring-1 ring-[#800020]/15">
                                                {profile.profileNumber}
                                            </span>
                                        )}
                                        {hasHistory && (
                                            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                                                {profile.changeHistory.length} version{profile.changeHistory.length === 1 ? "" : "s"}
                                            </span>
                                        )}
                                    </div>

                                    {hasReviewChanges && (
                                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-[#800020]">
                                            Changed: {profile.reviewChanges.join(", ")}
                                        </div>
                                    )}

                                    <div className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                                        <p>
                                            <span className="font-semibold text-gray-900">Age:</span>{" "}
                                            {profile.age || "N/A"}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-900">Occupation:</span>{" "}
                                            {profile.occupation || "N/A"}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-900">City:</span>{" "}
                                            {profile.city || "N/A"}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-900">Caste:</span>{" "}
                                            {profile.caste || "N/A"}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-900">Education:</span>{" "}
                                            {profile.education || "N/A"}
                                        </p>
                                        {isSuperAdmin && (
                                            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-gray-700 sm:col-span-2">
                                                <span className="font-bold text-[#800020]">Views:</span>{" "}
                                                {viewSummary.used} / {viewSummary.limit} used, {viewSummary.pending} pending
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProfile(profile)}
                                            className="rounded-lg border border-[#800020] px-3 py-2 text-sm font-semibold text-[#800020] hover:bg-white"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setHistoryProfile(profile)}
                                            disabled={!hasHistory}
                                            className="rounded-lg border border-amber-500 bg-white px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            History
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => updateStatus(profile._id, "approved")}
                                            className="rounded-lg border border-green-500 bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                                        >
                                            {hasReviewChanges ? "Approve Changes" : "Approve"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => updateStatus(profile._id, "rejected")}
                                            className="rounded-lg border border-red-500 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                                        >
                                            {hasReviewChanges ? "Reject Changes" : "Reject"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => updateStatus(profile._id, "deactivated")}
                                            className="rounded-lg border border-orange-500 bg-white px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                disabled={loading || page <= 1}
                                onClick={() => handlePageChange(page - 1)}
                                className="rounded-xl border border-[#800020] px-5 py-2 font-semibold text-[#800020] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={loading || page >= totalPages}
                                onClick={() => handlePageChange(page + 1)}
                                className="rounded-xl bg-[#800020] px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedProfile && (
                <ProfileViewModal
                    profile={selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                    onApprove={(profileId) => updateStatus(profileId, "approved")}
                    onReject={(profileId) => updateStatus(profileId, "rejected")}
                    onDeactivate={(profileId) => updateStatus(profileId, "deactivated")}
                    onSave={saveProfileUpdates}
                    showAdminActions
                />
            )}

            {isAssistedCreateOpen && (
                <AssistedProfileModal
                    onClose={() => setIsAssistedCreateOpen(false)}
                    onSave={createAssistedProfile}
                />
            )}

            {historyProfile && (
                <ProfileHistoryModal
                    profile={historyProfile}
                    onClose={() => setHistoryProfile(null)}
                    onRevert={revertProfileChange}
                />
            )}
        </>
    );
}

function ProfileHistoryModal({ profile, onClose, onRevert }) {
    const history = [...(profile.changeHistory || [])].reverse();

    return (
        <div className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-black/75 px-3 py-6 backdrop-blur-sm sm:px-6">
            <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-rose-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase text-amber-600">
                            {profile.profileNumber || "Profile"}
                        </p>
                        <h2 className="text-2xl font-bold text-[#800020]">
                            Profile Change History
                        </h2>
                        <p className="text-sm text-gray-600">
                            {profile.fullName || "Profile"} has {history.length} saved version{history.length === 1 ? "" : "s"}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="self-start rounded-full border border-rose-100 px-4 py-2 text-sm font-bold text-[#800020] hover:bg-rose-50 sm:self-auto"
                    >
                        Close
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-5">
                    {history.length === 0 ? (
                        <div className="rounded-2xl bg-[#fff8f2] p-8 text-center font-semibold text-gray-600">
                            No profile change history yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry, index) => {
                                const entryId = entry._id || entry.id;
                                const fields = entry.changedFields || [];
                                const isReverted = Boolean(entry.revertedAt);
                                const sourceLabel = entry.source === "revert"
                                    ? "Revert"
                                    : entry.source === "admin"
                                        ? "Admin Edit"
                                        : "User Edit";

                                return (
                                    <article key={entryId || index} className="rounded-2xl border border-rose-100 bg-[#fff8f2] p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-[#800020]">
                                                        Version {history.length - index}
                                                    </h3>
                                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                                                        {sourceLabel}
                                                    </span>
                                                    {isReverted && (
                                                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">
                                                            Reverted
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm font-semibold text-gray-600">
                                                    Changed: {formatDateTime(entry.changedAt)}
                                                </p>
                                                {isReverted && (
                                                    <p className="mt-1 text-xs font-semibold text-gray-500">
                                                        Reverted: {formatDateTime(entry.revertedAt)}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onRevert(profile._id, entryId)}
                                                disabled={isReverted || entry.source === "revert"}
                                                className="rounded-xl bg-[#800020] px-4 py-2 text-sm font-bold text-white hover:bg-[#5c0017] disabled:cursor-not-allowed disabled:bg-gray-300"
                                            >
                                                Revert to Previous
                                            </button>
                                        </div>

                                        <div className="mt-4 overflow-x-auto">
                                            <table className="min-w-[720px] w-full overflow-hidden rounded-xl bg-white text-sm">
                                                <thead className="bg-[#800020] text-white">
                                                    <tr>
                                                        <th className="p-3 text-left">Field</th>
                                                        <th className="p-3 text-left">Previous</th>
                                                        <th className="p-3 text-left">New</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fields.map((field) => (
                                                        <tr key={field} className="border-b border-rose-50">
                                                            <td className="p-3 font-bold text-[#800020]">{field}</td>
                                                            <td className="p-3 text-gray-700">
                                                                {formatHistoryValue(entry.previousData?.[field])}
                                                            </td>
                                                            <td className="p-3 text-gray-700">
                                                                {formatHistoryValue(entry.newData?.[field])}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AssistedProfileModal({ onClose, onSave }) {
    const [formData, setFormData] = useState(ASSISTED_INITIAL_FORM);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [stylishPreviews, setStylishPreviews] = useState([null, null]);

    const calculateAge = (dob) => {
        if (!dob) return "";

        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const updateField = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "accountFullName" && !prev.fullName ? { fullName: value } : {}),
            ...(name === "dateOfBirth" ? { age: calculateAge(value) } : {}),
        }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "mobile") {
            updateField(name, value.replace(/\D/g, "").slice(0, 10));
            return;
        }

        updateField(name, value);
    };

    const validatePhotoFile = (file) => {
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            toast.error("Only JPG, JPEG and PNG files are allowed.");
            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Photo size should be less than 2 MB.");
            return false;
        }

        return true;
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file || !validatePhotoFile(file)) return;

        updateField("profilePhoto", file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleStylishPhotoChange = (index, event) => {
        const file = event.target.files?.[0];

        if (!file || !validatePhotoFile(file)) return;

        updateField(`stylishPhoto${index}`, file);
        setStylishPreviews((prev) => {
            const next = [...prev];
            next[index] = URL.createObjectURL(file);
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.profilePhoto) {
            toast.error("Please upload a profile photo");
            return;
        }

        const expectedGender = getExpectedGender(formData.registeringFor);

        if (expectedGender && formData.gender !== expectedGender) {
            toast.error(`${formData.registeringFor} registration should be selected as ${expectedGender}`);
            return;
        }

        try {
            setSaving(true);
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 px-3 py-6 backdrop-blur-sm sm:px-6">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-[#800020]/10 bg-[#fff8f2] px-5 py-5 sm:px-7">
                    <div>
                        <h2 className="text-2xl font-bold text-[#800020] sm:text-3xl">
                            Create Assisted Profile
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Create the user login and complete profile while speaking with the family.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-gray-700 shadow hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-5 sm:p-7">
                    <AssistedSection title="Login Details">
                        <AssistedInput name="accountFullName" placeholder="Account Holder Name *" value={formData.accountFullName} onChange={handleChange} required />
                        <AssistedInput name="mobile" placeholder="Mobile Number *" value={formData.mobile} onChange={handleChange} required />
                        <AssistedInput type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} required />
                        <AssistedInput name="password" placeholder="Temporary Password" value={formData.password} onChange={handleChange} />
                        <AssistedSelect name="registeringFor" value={formData.registeringFor} onChange={handleChange} options={[
                            ["Self", "Self"],
                            ["Son", "Son"],
                            ["Daughter", "Daughter"],
                            ["Brother", "Brother"],
                            ["Sister", "Sister"],
                        ]} />
                        <AssistedSelect name="status" value={formData.status} onChange={handleChange} options={[
                            ["approved", "Approve now"],
                            ["pending", "Keep pending"],
                        ]} />
                    </AssistedSection>

                    <AssistedSection title="Basic Profile">
                        <AssistedInput name="fullName" placeholder="Profile Full Name *" value={formData.fullName} onChange={handleChange} required />
                        <AssistedSelect name="gender" value={formData.gender} onChange={handleChange} required options={[
                            ["", "Select Gender *"],
                            ["Bride", "Bride"],
                            ["Groom", "Groom"],
                        ]} />
                        <AssistedInput type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        <AssistedInput name="age" placeholder="Age" value={formData.age} readOnly className="bg-gray-100" />
                        <AssistedInput name="height" placeholder="Height *" value={formData.height} onChange={handleChange} required />
                        <AssistedSelect name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={[
                            ["Never Married", "Never Married"],
                            ["Divorced", "Divorced"],
                            ["Widowed", "Widowed"],
                        ]} />
                    </AssistedSection>

                    <AssistedSection title="Community, Career & Location">
                        <AssistedInput name="motherTongue" placeholder="Mother Tongue" value={formData.motherTongue} onChange={handleChange} />
                        <AssistedInput name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} />
                        <AssistedInput name="caste" placeholder="Caste *" value={formData.caste} onChange={handleChange} required />
                        <AssistedInput name="subCaste" placeholder="Sub Caste" value={formData.subCaste} onChange={handleChange} />
                        <AssistedInput name="gothram" placeholder="Gothram" value={formData.gothram} onChange={handleChange} />
                        <AssistedInput name="education" placeholder="Education *" value={formData.education} onChange={handleChange} required />
                        <AssistedInput name="occupation" placeholder="Occupation *" value={formData.occupation} onChange={handleChange} required />
                        <AssistedInput name="annualIncome" placeholder="Annual Income" value={formData.annualIncome} onChange={handleChange} />
                        <AssistedInput name="city" placeholder="City *" value={formData.city} onChange={handleChange} required />
                        <AssistedInput name="state" placeholder="State *" value={formData.state} onChange={handleChange} required />
                        <AssistedInput name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
                    </AssistedSection>

                    <AssistedSection title="Family, About & Preferences">
                        <AssistedTextarea name="familyDetails" placeholder="Family Details" value={formData.familyDetails} onChange={handleChange} />
                        <AssistedTextarea name="aboutMe" placeholder="About Profile" value={formData.aboutMe} onChange={handleChange} />
                        <AssistedInput name="preferredAgeFrom" placeholder="Preferred Age From" value={formData.preferredAgeFrom} onChange={handleChange} />
                        <AssistedInput name="preferredAgeTo" placeholder="Preferred Age To" value={formData.preferredAgeTo} onChange={handleChange} />
                        <AssistedInput name="preferredCaste" placeholder="Preferred Caste" value={formData.preferredCaste} onChange={handleChange} />
                        <AssistedInput name="preferredLocation" placeholder="Preferred Location" value={formData.preferredLocation} onChange={handleChange} />
                        <AssistedSelect name="contactPreference" value={formData.contactPreference} onChange={handleChange} options={[
                            ["Phone", "Phone"],
                            ["WhatsApp", "WhatsApp"],
                            ["Email", "Email"],
                            ["Any", "Any"],
                        ]} />
                    </AssistedSection>

                    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                        <h3 className="mb-3 text-lg font-bold text-[#800020]">
                            Photo Consent
                        </h3>
                        <label className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.showPhotosToMembers}
                                onChange={(event) =>
                                    updateField("showPhotosToMembers", event.target.checked)
                                }
                                className="mt-1 h-5 w-5 accent-[#800020]"
                            />
                            <span>
                                Family agreed that uploaded photos can be shown to other brides
                                or grooms. If unchecked, photos will be hidden from members.
                            </span>
                        </label>
                    </section>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-1 text-lg font-bold text-[#800020]">Photos</h3>
                        <p className="mb-4 text-sm text-gray-500">JPG, JPEG or PNG. Maximum 2 MB per photo.</p>

                        <div className="grid gap-4 md:grid-cols-3">
                            <PhotoInput label="Profile Photo *" preview={photoPreview} onChange={handlePhotoChange} required />
                            {[0, 1].map((index) => (
                                <PhotoInput
                                    key={index}
                                    label={`Stylish Photo ${index + 1}`}
                                    preview={stylishPreviews[index]}
                                    onChange={(event) => handleStylishPhotoChange(index, event)}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-xl bg-[#800020] py-4 text-lg font-bold text-white shadow-lg hover:bg-[#5c0017] disabled:opacity-60"
                    >
                        {saving ? "Creating Profile..." : "Create Login & Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AssistedSection({ title, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#800020]">{title}</h3>
            <div className="grid gap-4 md:grid-cols-2">{children}</div>
        </section>
    );
}

function AssistedInput({ className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 ${className}`}
        />
    );
}

function AssistedSelect({ options, className = "", ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 ${className}`}
        >
            {options.map(([value, label]) => (
                <option key={value || label} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );
}

function AssistedTextarea({ className = "", ...props }) {
    return (
        <textarea
            {...props}
            rows="4"
            className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 md:col-span-2 ${className}`}
        />
    );
}

function PhotoInput({ label, preview, onChange, required = false }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-[#fff8f2] p-4">
            <div className="mb-3 h-40 overflow-hidden rounded-2xl border border-[#800020]/20 bg-white">
                {preview ? (
                    <img src={preview} alt={label} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-400">
                        {label}
                    </div>
                )}
            </div>

            <label className="mb-2 block text-sm font-bold text-[#800020]">{label}</label>
            <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={onChange}
                required={required}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
            />
        </div>
    );
}


