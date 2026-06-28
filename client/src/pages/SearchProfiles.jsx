import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

import ProfileCard from "../components/ProfileCard";
import ProfileViewModal from "../components/ProfileViewModal.jsx";
import RegisterModal from "../components/RegisterModal.jsx";

const PAGE_SIZE = 20;
const defaultFilters = {
    search: "",
    gender: "",
    ageFrom: "",
    ageTo: "",
    caste: "",
    city: "",
};

function SearchProfiles() {
    const [searchParams] = useSearchParams();
    const filtersFromUrl = {
        ...defaultFilters,
        search: searchParams.get("search") || "",
        gender: searchParams.get("gender") || "",
        ageFrom: searchParams.get("ageFrom") || "",
        ageTo: searchParams.get("ageTo") || "",
        caste: searchParams.get("caste") || "",
        city: searchParams.get("city") || "",
    };

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isGuestProfilePrompt, setIsGuestProfilePrompt] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

    const [filters, setFilters] = useState(filtersFromUrl);

    const isSearchTextValid = (searchText) => {
        const trimmedSearch = searchText.trim();

        return !trimmedSearch || trimmedSearch.length >= 3;
    };

    const fetchProfiles = async (pageToLoad = 1, filtersToUse = filters) => {
        console.log("Search button clicked");

        try {
            setLoading(true);

            console.log("API URL:", import.meta.env.VITE_API_URL);

            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE_URL}/api/profiles/search`,
                {
                    params: {
                        ...filtersToUse,
                        page: pageToLoad,
                        limit: PAGE_SIZE,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("SEARCH RESPONSE:", res.data);

            setProfiles(res.data.profiles || []);
            setPage(Number(res.data.page || pageToLoad));
            setTotalPages(Number(res.data.totalPages || 1));
            setTotal(Number(res.data.total || 0));
        } catch (error) {
            console.log("SEARCH ERROR:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!isSearchTextValid(filters.search)) {
            toast.error("Please enter at least 3 characters to search.");
            return;
        }

        fetchProfiles(1);
    };

    const handleClearFilters = () => {
        setFilters(defaultFilters);
        fetchProfiles(1, defaultFilters);
    };

    const handlePageChange = (nextPage) => {
        fetchProfiles(nextPage);
    };

    const handleViewProfile = async (profile) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setSelectedProfile(profile);
                setIsGuestProfilePrompt(true);
                return;
            }

            setIsGuestProfilePrompt(false);

            const res = await axios.get(`${API_BASE_URL}/api/profiles/${profile._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedProfile(res.data.profile || profile);
        } catch (error) {
            console.log("PROFILE POPUP ERROR:", error.response?.data || error.message);
            setSelectedProfile(profile);
        }
    };

    useEffect(() => {
        if (!isSearchTextValid(filtersFromUrl.search)) {
            toast.error("Please enter at least 3 characters to search.");
            return;
        }

        fetchProfiles(1, filtersFromUrl);
    }, []);

    return (

        <>

        <div className="max-w-7xl mx-auto px-6 pb-10 pt-36 lg:pt-44">

            <nav className="mb-3 text-sm font-medium text-gray-500">
                <Link to="/" className="hover:text-[#800020]">
                    Home
                </Link>
                <span className="mx-2 text-amber-600">/</span>
                <span className="text-[#800020]">Search</span>
            </nav>

            <h2 className="text-3xl font-bold text-[#800020] mb-5">
                Search Profiles
            </h2>

            {/* Search Filters */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

                    <input
                        type="text"
                        placeholder="Profile No / Name / Caste - min 3 characters"
                        value={filters.search}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                search: e.target.value,
                            })
                        }
                        className="border rounded-xl p-3"
                    />

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
                        disabled={loading}
                        className="bg-[#800020] text-white rounded-xl p-3 font-semibold disabled:cursor-wait disabled:opacity-80"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>

                    <button
                        type="button"
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="rounded-xl border border-[#800020] p-3 font-semibold text-[#800020] hover:bg-[#fff8f2] disabled:cursor-wait disabled:opacity-60"
                    >
                        Clear
                    </button>

                </div>

            </div>

            {loading && (
                <PremiumSearchLoading hasResults={profiles.length > 0} />
            )}

            {/* Results */}
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                    {loading && profiles.length === 0
                        ? "Finding verified profiles..."
                        : `Showing ${profiles.length} of ${total} profiles`}
                </span>
                <span>
                    Page {page} of {totalPages}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {loading && profiles.length === 0 && (
                    <SearchLoadingCards />
                )}

                {Array.isArray(profiles) &&
                    profiles.map((profile) => (
                        <ProfileCard
                            key={profile._id}
                            profile={profile}
                            onView={handleViewProfile}
                        />
                    ))}

            </div>

            {!loading && profiles.length === 0 && (
                <div className="mt-8 rounded-2xl bg-white p-8 text-center text-gray-600 shadow">
                    No profiles found.
                </div>
            )}

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

        {selectedProfile && (
            <ProfileViewModal
                profile={selectedProfile}
                onClose={() => {
                    setSelectedProfile(null);
                    setIsGuestProfilePrompt(false);
                }}
                guestPrompt={isGuestProfilePrompt}
                onRegister={() => {
                    setSelectedProfile(null);
                    setIsGuestProfilePrompt(false);
                    setIsRegisterOpen(true);
                }}
            />
        )}

        <RegisterModal
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
        />

        </>
    );
    
}

function SearchLoadingCards() {
    return Array.from({ length: 8 }).map((_, index) => (
        <div
            key={index}
            className="h-[240px] rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-md"
        >
            <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 rounded-[18px] bg-rose-100" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded-full bg-rose-100" />
                    <div className="h-4 w-1/2 rounded-full bg-amber-100" />
                    <div className="h-4 w-2/3 rounded-full bg-rose-100" />
                </div>
            </div>
            <div className="mt-6 space-y-3">
                <div className="h-4 rounded-full bg-rose-100" />
                <div className="h-4 w-5/6 rounded-full bg-amber-100" />
            </div>
            <div className="mt-5 rounded-2xl bg-[#800020] px-4 py-2 text-center text-xs font-semibold text-white">
                Loading verified profile
            </div>
        </div>
    ));
}

function PremiumSearchLoading({ hasResults }) {
    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-lg">
            <div className="relative p-5">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#800020] via-amber-400 to-[#800020]" />

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-lg font-bold text-[#800020]">
                            {hasResults
                                ? "Refreshing matching profiles..."
                                : "Finding verified Telugu matrimony profiles..."}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            Please wait while we match your search filters with approved profiles.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-[#fff8f2] px-4 py-3 text-sm font-semibold text-[#800020]">
                        <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
                        Searching carefully
                    </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-rose-100">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#800020] to-amber-400" />
                </div>
            </div>
        </div>
    );
}

export default SearchProfiles;


