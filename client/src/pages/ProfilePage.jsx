import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/profilePage.css";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const FREE_PROFILE_VIEW_LIMIT = 5;

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewLimitReached, setViewLimitReached] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            toast.error("Please login to view profiles");
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/api/profiles/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProfile(response.data.profile);

            } catch (error) {

                console.error("Fetch Profile Error:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );

            } finally {

                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }

    }, [id]);
    const isPremiumUser =
        user?.membership === "premium" ||
        user?.membershipType === "premium" ||
        user?.role === "admin";

    const canViewFullProfile = Boolean(user && isPremiumUser);

    useEffect(() => {
        if (!profile || !user) return;
        if (isPremiumUser) return;

        const viewedProfiles = JSON.parse(
            localStorage.getItem("viewedProfiles") || "[]"
        );

        if (viewedProfiles.includes(profile._id)) return;

        if (viewedProfiles.length >= FREE_PROFILE_VIEW_LIMIT) {
            setViewLimitReached(true);
            toast.error("Free profile view limit reached. Please upgrade.");
            return;
        }

        viewedProfiles.push(profile._id);
        localStorage.setItem("viewedProfiles", JSON.stringify(viewedProfiles));
    }, [profile, user, isPremiumUser]);

    // ==========================================
    // Send Interest
    // Logged-in user can send interest to profile
    // ==========================================
    const handleSendInterest = async (profileId) => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!savedUser || !token) {
                toast.error("Please login to send interest");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/interests/send`,
                {
                    senderId: savedUser._id,
                    receiverProfileId: profileId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Interest sent successfully");

        } catch (error) {
            console.error("Interest failed:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to send interest"
            );
        }
    };

    const lockedValue = <span className="locked-value">Locked 🔒</span>;

    const showValue = (value, locked = false) => {
        if (locked && !canViewFullProfile) return lockedValue;
        return value || "Not provided";
    };

    if (loading) {
        return <div className="profile-page-loading">Loading profile...</div>;
    }

    // ==========================================
    // Free User Restriction
    // Hide sensitive information for free members
    // ==========================================
    const savedUser = JSON.parse(localStorage.getItem("user"));

    const canViewFullDetails =
        savedUser?.role === "admin" ||
        savedUser?.role === "super_admin" ||
        savedUser?.membershipPlan !== "free";

    if (viewLimitReached) {
        return (
            <div className="profile-page-container">
                <div className="upgrade-box">
                    <h3>Free View Limit Reached 🔒</h3>
                    <p>
                        You have viewed 5 profiles with your free membership. Please upgrade
                        to continue viewing more profiles.
                    </p>

                    <Link to="/membership" className="upgrade-btn">
                        Upgrade Membership
                    </Link>

                    <div className="profile-actions">
                        <Link to="/search-profiles" className="back-btn">
                            ← Back to Search
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page-container">
                <div className="profile-not-found">
                    <h2>Profile not found</h2>
                    <Link to="/search-profiles">Back to Search</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            <div className="profile-detail-card">
                <div className="profile-top-section">
                    <div className="profile-photo-box">
                        {canViewFullProfile && profile.profilePhoto ? (
                            <img
                                src={profile.profilePhoto}
                                alt="Profile"
                                className="profile-photo"
                            />
                        ) : (
                            <div className="profile-photo-locked">
                                <span>🔒</span>
                                <p>Photo Locked</p>
                            </div>
                        )}
                    </div>

                    <div className="profile-basic-info">
                        <h1>
                            {showValue(profile.fullName || profile.name, true)}

                            {profile.membership === "premium" && (
                                <span className="premium-badge">
                                    ⭐ Premium
                                </span>
                            )}
                        </h1>

                        <p className="profile-subtitle">
                            {profile.age || "Age not provided"} years •{" "}
                            {profile.caste || "Caste not provided"} •{" "}
                            {profile.city || "City not provided"}
                        </p>

                        {!canViewFullProfile && (
                            <div className="profile-lock-alert">
                                ✨ Upgrade to Premium to unlock complete profiles and connect with families.
                                for premium members.
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Basic Details</h2>

                    <div className="profile-grid">
                        <Info label="Age" value={showValue(profile.age)} />
                        <Info label="Gender" value={showValue(profile.gender)} />
                        <Info label="Height" value={showValue(profile.height)} />
                        <Info label="Marital Status" value={showValue(profile.maritalStatus)} />
                        <Info label="Caste" value={showValue(profile.caste)} />
                        <Info label="Sub Caste" value={showValue(profile.subCaste)} />

                        <p>
                            <strong>Gothram:</strong>{" "}
                            {canViewFullDetails ? profile.gothram : "🔒 Premium Only"}
                        </p>

                        <Info
                            label="Location"
                            value={showValue(`${profile.city || ""}, ${profile.state || ""}`)}
                        />
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Education & Career</h2>

                    <div className="profile-grid">
                        <Info label="Education" value={showValue(profile.education)} />
                        <Info label="Occupation" value={showValue(profile.occupation)} />
                        <p>
                            <strong>Income:</strong>{" "}
                            {canViewFullDetails ? profile.annualIncome : "🔒 Premium Only"}
                        </p>

                        <Info label="Company" value={showValue(profile.company, true)} />
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Contact Details</h2>

                    <div className="profile-grid">
                        <p>
                            <strong>Mobile:</strong>{" "}
                            {canViewFullDetails ? profile.mobile : "🔒 Premium Only"}
                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            {canViewFullDetails ? profile.email : "🔒 Premium Only"}
                        </p>

                        <Info label="Address" value={showValue(profile.address, true)} />
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Family Details</h2>

                    <div className="profile-grid">
                        <Info label="Father Name" value={showValue(profile.fatherName, true)} />
                        <Info label="Mother Name" value={showValue(profile.motherName, true)} />
                        <Info label="Family Type" value={showValue(profile.familyType, true)} />
                        <Info label="Family Status" value={showValue(profile.familyStatus, true)} />
                    </div>
                </div>

                <div className="profile-section">
                    <h2>About</h2>
                    <p className="profile-about">
                        {showValue(profile.aboutMe || profile.about)}
                    </p>
                </div>

                {!canViewFullProfile && (
                    <div className="upgrade-box">
                        <h3>Upgrade Required</h3>
                        <p>
                            Upgrade to premium membership to view full name, photo, mobile,
                            email, income, and family details.
                        </p>

                        <Link to="/membership" className="upgrade-btn">
                            View Membership Plans
                        </Link>
                    </div>
                )}

                {/* ==========================================
    Premium Upgrade Banner
========================================== */}
                {!canViewFullDetails && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 my-6 text-center shadow-sm">

                        <h3 className="text-lg font-bold text-[#800020]">
                            🔒 Premium Membership Required
                        </h3>

                        <p className="text-gray-600 mt-2 text-sm">
                            Mobile number, email, income, gothram, horoscope,
                            and complete profile details are available only to Premium members.
                        </p>

                        <button className="mt-4 bg-gradient-to-r from-[#800020] to-[#a52a2a] text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition">
                            Upgrade to Premium
                        </button>

                    </div>
                )}

                <div className="profile-actions">
                    <button className="interest-btn" onClick={handleSendInterest}>
                        ❤️ Send Interest
                    </button>

                    <Link to="/search-profiles" className="back-btn">
                        ← Back to Search
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="profile-info-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}