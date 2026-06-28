import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/ProfilePage.css";
import Header from "../components/Header.jsx";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const FREE_PROFILE_VIEW_LIMIT = 5;

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewLimitReached, setViewLimitReached] = useState(false);

    useEffect(() => {
        const savedUser = getSavedUser();

        if (!savedUser) {
            toast.error("Please login to view profiles");
            navigate("/");
            return;
        }

        setUser(savedUser);
    }, [navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Please login again");
                    navigate("/");
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/profiles/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProfile(response.data.profile || response.data);
            } catch (error) {
                console.error("Fetch Profile Error:", error);
                toast.error(error.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id, navigate]);

    const userRole = user?.role?.toLowerCase?.().trim();

    const isPremiumUser =
        user?.membership === "premium" ||
        user?.membershipType === "premium" ||
        user?.membershipPlan === "premium" ||
        userRole === "admin" ||
        userRole === "super_admin";

    const canViewFullProfile = Boolean(user && isPremiumUser);
    const canViewFullDetails = canViewFullProfile;

    useEffect(() => {
        if (!profile || !user || isPremiumUser) return;

        const storageKey = `viewedProfiles_${user._id || user.id || "guest"}`;

        const viewedProfiles = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        if (viewedProfiles.includes(profile._id)) return;

        if (viewedProfiles.length >= FREE_PROFILE_VIEW_LIMIT) {
            setViewLimitReached(true);
            toast.error("Free profile view limit reached. Please upgrade.");
            return;
        }

        viewedProfiles.push(profile._id);
        localStorage.setItem(storageKey, JSON.stringify(viewedProfiles));
    }, [profile, user, isPremiumUser]);

    const handleSendInterest = async (profileId) => {
        try {
            const savedUser = getSavedUser();
            const token = localStorage.getItem("token");

            if (!savedUser || !token) {
                toast.error("Please login to send interest");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/interests/send`,
                {
                    senderId: savedUser._id || savedUser.id,
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
            console.error("Interest failed:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Failed to send interest");
        }
    };

    const lockedValue = <span className="locked-value">Locked 🔒</span>;

    const showValue = (value, locked = false) => {
        if (locked && !canViewFullProfile) return lockedValue;
        return value || "Not provided";
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="profile-page-loading">Loading profile...</div>
            </>
        );
    }

    if (viewLimitReached) {
        return (
            <>
                <Header />
                <div className="profile-page-container">
                    <div className="upgrade-box">
                        <h3>Free View Limit Reached 🔒</h3>
                        <p>
                            You have viewed 5 profiles with your free membership. Please
                            upgrade to continue viewing more profiles.
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
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <Header />
                <div className="profile-page-container">
                    <div className="profile-not-found">
                        <h2>Profile not found</h2>
                        <Link to="/search-profiles">Back to Search</Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

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
                                    <span className="premium-badge">⭐ Premium</span>
                                )}
                            </h1>

                            <p className="profile-subtitle">
                                {profile.age || "Age not provided"} years •{" "}
                                {profile.caste || "Caste not provided"} •{" "}
                                {profile.city || "City not provided"}
                            </p>

                            {!canViewFullProfile && (
                                <div className="profile-lock-alert">
                                    ✨ Upgrade to Premium to unlock complete profiles and connect
                                    with families.
                                </div>
                            )}
                        </div>
                    </div>

                    <ProfileSection title="Basic Details">
                        <Info label="Age" value={showValue(profile.age)} />
                        <Info label="Gender" value={showValue(profile.gender)} />
                        <Info label="Height" value={showValue(profile.height)} />
                        <Info
                            label="Marital Status"
                            value={showValue(profile.maritalStatus)}
                        />
                        <Info label="Caste" value={showValue(profile.caste)} />
                        <Info label="Sub Caste" value={showValue(profile.subCaste)} />
                        <Info
                            label="Gothram"
                            value={canViewFullDetails ? profile.gothram : "🔒 Premium Only"}
                        />
                        <Info
                            label="Location"
                            value={showValue(
                                [profile.city, profile.state].filter(Boolean).join(", ")
                            )}
                        />
                    </ProfileSection>

                    <ProfileSection title="Education & Career">
                        <Info label="Education" value={showValue(profile.education)} />
                        <Info label="Occupation" value={showValue(profile.occupation)} />
                        <Info
                            label="Income"
                            value={
                                canViewFullDetails ? profile.annualIncome : "🔒 Premium Only"
                            }
                        />
                        <Info label="Company" value={showValue(profile.company, true)} />
                    </ProfileSection>

                    <ProfileSection title="Contact Details">
                        <Info
                            label="Mobile"
                            value={canViewFullDetails ? profile.mobile : "🔒 Premium Only"}
                        />
                        <Info
                            label="Email"
                            value={canViewFullDetails ? profile.email : "🔒 Premium Only"}
                        />
                        <Info label="Address" value={showValue(profile.address, true)} />
                    </ProfileSection>

                    <ProfileSection title="Family Details">
                        <Info
                            label="Father Name"
                            value={showValue(profile.fatherName, true)}
                        />
                        <Info
                            label="Mother Name"
                            value={showValue(profile.motherName, true)}
                        />
                        <Info
                            label="Family Type"
                            value={showValue(profile.familyType, true)}
                        />
                        <Info
                            label="Family Status"
                            value={showValue(profile.familyStatus, true)}
                        />
                    </ProfileSection>

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

                    <div className="profile-actions">
                        <button
                            className="interest-btn"
                            onClick={() => handleSendInterest(profile._id)}
                        >
                            ❤️ Send Interest
                        </button>

                        <Link to="/search-profiles" className="back-btn">
                            ← Back to Search
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function ProfileSection({ title, children }) {
    return (
        <div className="profile-section">
            <h2>{title}</h2>
            <div className="profile-grid">{children}</div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="profile-info-item">
            <span>{label}</span>
            <strong>{value || "Not provided"}</strong>
        </div>
    );
}