import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileViewModal from "../components/ProfileViewModal.jsx";
import toast from "react-hot-toast";
import nvLogo from "../images/nvlogo-v1.png";

const PAGE_SIZE = 10;
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const getPhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return nvLogo;
    if (profilePhoto.startsWith("http")) return profilePhoto;

    const photoPath = profilePhoto.replace(/\\/g, "/");

    return photoPath.startsWith("uploads/")
        ? `${API_BASE_URL}/${photoPath}`
        : `${API_BASE_URL}/uploads/${photoPath}`;
};

export default function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = loggedInUser?.role?.toLowerCase?.().trim();
    const canReviewProfiles = ["admin", "oper_admin", "super_admin"].includes(userRole);

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    useEffect(() => {
        fetchPendingProfiles(1, "");
    }, []);

    const fetchPendingProfiles = async (pageToLoad = page, searchToUse = search) => {
        try {
            if (!canReviewProfiles) return;

            setLoading(true);

            const res = await axios.get(
                `${API_BASE_URL}/api/profiles/admin/pending`,
                {
                    ...authConfig(),
                    params: {
                        search: searchToUse,
                        page: pageToLoad,
                        limit: PAGE_SIZE,
                    },
                }
            );

            setProfiles(res.data.profiles || []);
            setPage(Number(res.data.page || pageToLoad));
            setTotalPages(Number(res.data.totalPages || 1));
            setTotal(Number(res.data.total || 0));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to load pending profiles");
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
            fetchPendingProfiles(page, search);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Unable to update profile");
        }
    };

    const handleSearch = () => {
        fetchPendingProfiles(1, search);
    };

    const handleClear = () => {
        setSearch("");
        fetchPendingProfiles(1, "");
    };

    const handlePageChange = (nextPage) => {
        fetchPendingProfiles(nextPage, search);
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
                <div className="mx-auto max-w-6xl">
                    <nav className="mb-3 text-sm font-medium text-gray-500">
                        <Link to="/" className="hover:text-[#800020]">
                            Home
                        </Link>
                        <span className="mx-2 text-amber-600">/</span>
                        <span className="text-[#800020]">Admin Profile Review</span>
                    </nav>

                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-[#800020]">
                                Admin Profile Approvals
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Review pending user profiles before they appear in search.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchPendingProfiles(page, search)}
                            className="rounded-xl border border-[#800020] px-4 py-2 font-semibold text-[#800020] hover:bg-white"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="mb-6 rounded-2xl bg-white p-4 shadow">
                        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                                placeholder="Search by Profile No, example PN000002"
                                className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#800020]"
                            />

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
                            <span>Showing {profiles.length} of {total} pending profiles</span>
                            <span>Page {page} of {totalPages}</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow">
                            Loading pending profiles...
                        </div>
                    )}

                    {!loading && profiles.length === 0 && (
                        <div className="rounded-2xl bg-white p-8 text-center shadow">
                            No pending profiles.
                        </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {profiles.map((profile) => (
                            <div key={profile._id} className="rounded-2xl bg-white p-5 shadow">
                                <div className="flex gap-4 xl:block">
                                    <img
                                        src={getPhotoUrl(profile.profilePhoto)}
                                        alt={profile.fullName || "Profile"}
                                        className="h-24 w-24 flex-shrink-0 rounded-xl border border-rose-100 bg-[#fff8f2] object-contain p-2 shadow-sm xl:mb-4 xl:h-40 xl:w-full"
                                    />

                                    <div className="min-w-0">
                                        {profile.profileNumber && (
                                            <p className="mb-1 text-xs font-bold text-amber-700">
                                                {profile.profileNumber}
                                            </p>
                                        )}

                                        <h2 className="text-xl font-bold text-[#800020]">
                                            {profile.fullName || "Profile"}
                                        </h2>

                                        <p className="text-sm text-gray-700">
                                            {profile.gender || "Gender N/A"} | {profile.age || "Age N/A"} yrs | {profile.height || "Height N/A"}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {profile.education || "Education N/A"} | {profile.occupation || "Occupation N/A"}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {[profile.city, profile.state].filter(Boolean).join(", ") || "Location N/A"}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 line-clamp-3 text-gray-600">
                                    {profile.aboutMe || "No profile summary provided."}
                                </p>

                                <div className="mt-5 grid gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProfile(profile)}
                                        className="rounded-lg border border-[#800020] px-4 py-2 font-semibold text-[#800020]"
                                    >
                                        View Profile
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateStatus(profile._id, "approved")}
                                        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateStatus(profile._id, "rejected")}
                                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
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
                    showAdminActions
                />
            )}
        </>
    );
}


