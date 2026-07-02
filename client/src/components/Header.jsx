import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/home.css";
import "../styles/home-feature-fixes.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CreateProfileModal from "./CreateProfileModal";
import HeaderInfoModal from "./HeaderInfoModal.jsx";
import toast from "react-hot-toast";

import nvLogo from "../images/nvlogo-v1.png";
import {
    FaUserCircle,
    FaBars,
    FaTimes,
    FaCog
} from "react-icons/fa";

const legalSections = [
    { id: "privacy", label: "Privacy" },
    { id: "purpose", label: "Matrimony Purpose" },
    { id: "rules", label: "Safety Rules" },
];

const hasMenuAccess = (user, key) => {
    const role = user?.role?.toLowerCase?.().trim();

    if (role === "super_admin") return true;
    if (!Array.isArray(user?.menuAccess)) {
        return ["dashboard", "profile"].includes(key);
    }

    return user.menuAccess.includes(key);
};

export default function Header() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [infoModal, setInfoModal] = useState(null);
    const [activeLegalSection, setActiveLegalSection] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isMobileMenuOpen]);

    const isLoggedIn = !!user;
    const userRole = user?.role?.toLowerCase?.().trim();
    const membershipPlan = (
        user?.membershipPlan ||
        user?.membershipType ||
        user?.membership ||
        "free"
    ).toString().toLowerCase();
    const isPremiumMember = membershipPlan === "premium";
    const isEliteMember = membershipPlan === "elite";
    const canReviewProfiles = ["admin", "oper_admin", "super_admin"].includes(userRole);
    const canManageUsers = ["admin", "super_admin"].includes(userRole);
    const isNormalAdmin = userRole === "admin";
    const canSeeDashboardMenu = !isNormalAdmin && hasMenuAccess(user, "dashboard");
    const canSeeProfileMenu = !isNormalAdmin && hasMenuAccess(user, "profile");
    const canSeeSentMenu = !isNormalAdmin && hasMenuAccess(user, "sentInterests");
    const canSeeReceivedMenu = !isNormalAdmin && hasMenuAccess(user, "receivedInterests");
    const canSeeAdminProfilesMenu = canReviewProfiles && (isNormalAdmin || hasMenuAccess(user, "adminProfiles"));
    const canSeeAdminPaymentsMenu = userRole === "super_admin" && hasMenuAccess(user, "adminPayments");
    const canSeeAdminContentMenu = userRole === "super_admin" && hasMenuAccess(user, "adminContent");
    const canSeeAdminUsersMenu = canManageUsers && (userRole === "admin" || hasMenuAccess(user, "adminUsers"));
    const canSeeSuperAdminMenu = userRole === "super_admin" && hasMenuAccess(user, "adminUsers");
    const displayName = user?.fullName?.trim?.() || "User";
    const accountInfoRows = [
        ["Name", user?.fullName],
        ["Email", user?.email],
        ["Phone", user?.mobile],
        ["Registering For", user?.registeringFor],
        ["Gender", user?.gender],
    ];

    useEffect(() => {
        const shouldMaskNames =
            !user ||
            (!["premium", "elite"].includes(membershipPlan) &&
                !["admin", "oper_admin", "super_admin"].includes(userRole));

        document.documentElement.dataset.maskProfileNames = shouldMaskNames ? "true" : "false";
        document.documentElement.dataset.loggedIn = user ? "true" : "false";

        return () => {
            delete document.documentElement.dataset.maskProfileNames;
            delete document.documentElement.dataset.loggedIn;
        };
    }, [membershipPlan, user, userRole]);

    useEffect(() => {
        const syncUserFromStorage = () => {
            const savedUser = localStorage.getItem("user");
            setUser(savedUser ? JSON.parse(savedUser) : null);
        };

        window.addEventListener("account:user-updated", syncUserFromStorage);

        return () => {
            window.removeEventListener("account:user-updated", syncUserFromStorage);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();

        setUser(null);

        setIsLoginOpen(false);
        setIsRegisterOpen(false);
        setIsCreateProfileOpen(false);

        window.dispatchEvent(new Event("account:user-updated"));
        toast.success("Logged out successfully!");

        navigate("/");
    };

    const handleLoginSuccess = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLoginOpen(false);
        setIsRegisterOpen(false);
        setIsCreateProfileOpen(true);
    };

    useEffect(() => {
        const rateCardLabels = new Set(["Get Started", "Choose Premium", "Choose Elite"]);

        const handleRateCardClick = (event) => {
            if (location.pathname !== "/") return;

            const button = event.target.closest("button");
            const isRateCardButton = button && rateCardLabels.has(button.textContent.trim());
            const isPremiumCardClick = event.target.closest(".group")?.textContent.includes("Choose Premium");

            if (!isRateCardButton && !isPremiumCardClick) return;

            event.preventDefault();

            if (isLoggedIn) {
                const buttonText = button?.textContent.trim() || "";
                const cardText = event.target.closest(".group")?.textContent || "";
                const selectedPlan = buttonText.includes("Elite") || cardText.includes("Choose Elite")
                    ? "elite"
                    : "premium";

                if (isEliteMember) return;

                if (isPremiumMember && selectedPlan !== "elite") {
                    return;
                }

                navigate(`/payment/${selectedPlan}`);
                return;
            }

            setIsRegisterOpen(true);
        };

        document.addEventListener("click", handleRateCardClick);

        return () => {
            document.removeEventListener("click", handleRateCardClick);
        };
    }, [isEliteMember, isLoggedIn, isPremiumMember, location.pathname, navigate]);

    const openInfoModal = (type) => {
        setInfoModal(type);
        setIsMobileMenuOpen(false);
    };

    const handleMembershipAction = (planTitle) => {
        setInfoModal(null);

        if (isLoggedIn) {
            const selectedPlan = String(planTitle).toLowerCase() === "elite" ? "elite" : "premium";

            if (isEliteMember) return;

            if (isPremiumMember && selectedPlan !== "elite") {
                return;
            }

            navigate(`/payment/${selectedPlan}`);
            return;
        }

        setIsRegisterOpen(true);
    };

    const navClass = (path, modalType = null) => {
        const isActive = modalType
            ? infoModal === modalType
            : !infoModal && location.pathname === path;

        return isActive ? "nav-link active" : "nav-link";
    };

    const accountLinkClass = (path) =>
        location.pathname === path && !activeLegalSection ? "account-menu-link active" : "account-menu-link";

    const legalSectionLinkClass = (sectionId) =>
        location.pathname === "/legal" && activeLegalSection === sectionId
            ? "account-menu-link active"
            : "account-menu-link";

    useEffect(() => {
        if (location.pathname !== "/legal") {
            setActiveLegalSection("");
            return;
        }

        const updateActiveLegalSection = () => {
            const headerOffset = 190;
            const visibleSection = legalSections
                .map((section) => ({
                    id: section.id,
                    top: document.getElementById(section.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
                }))
                .filter((section) => section.top <= headerOffset)
                .sort((a, b) => b.top - a.top)[0];

            setActiveLegalSection(visibleSection?.id || window.location.hash.replace("#", ""));
        };

        updateActiveLegalSection();
        window.addEventListener("scroll", updateActiveLegalSection, { passive: true });
        window.addEventListener("hashchange", updateActiveLegalSection);

        return () => {
            window.removeEventListener("scroll", updateActiveLegalSection);
            window.removeEventListener("hashchange", updateActiveLegalSection);
        };
    }, [location.pathname]);

    const goToLegalSection = (sectionId) => {
        setActiveLegalSection(sectionId);

        if (location.pathname !== "/legal") {
            navigate(`/legal#${sectionId}`);
            return;
        }

        window.history.replaceState(null, "", `/legal#${sectionId}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
    };

    const goToLegalHome = () => {
        setActiveLegalSection("");
        setIsMobileMenuOpen(false);

        if (location.pathname !== "/legal") {
            navigate("/legal");
            return;
        }

        window.history.replaceState(null, "", "/legal");
        window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    };

    const goToHome = () => {
        setActiveLegalSection("");
        setInfoModal(null);
        setIsMobileMenuOpen(false);

        if (location.pathname !== "/") {
            navigate("/");
            window.setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 0);
            return;
        }

        window.history.replaceState(null, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goToAccountSettings = () => {
        setIsMobileMenuOpen(false);
        navigate("/dashboard#account-settings");
    };

    const renderAccountPreview = () => (
        <div className="absolute right-0 top-full z-[10080] hidden w-[22rem] max-w-[calc(100vw-2rem)] pt-3 group-hover:block group-focus-within:block">
            <div className="rounded-xl border border-rose-100 bg-white p-4 text-left shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-rose-100 pb-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-amber-600">Registration</p>
                        <p className="truncate text-sm font-bold text-[#800020]">{displayName}</p>
                    </div>
                    <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                            event.stopPropagation();
                            goToAccountSettings();
                        }}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-[#800020] transition hover:bg-[#800020] hover:text-white"
                        aria-label="Open account settings"
                        title="Account settings"
                    >
                        <FaCog />
                    </button>
                </div>

                <div className="space-y-2">
                    {accountInfoRows.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-2 text-xs">
                            <span className="font-semibold text-gray-500">{label}</span>
                            <span className="break-words font-medium text-gray-800">{value || "-"}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed top-0 left-0 w-full z-[9999]">
            <img
                src={nvLogo}
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed right-6 top-[78px] z-[1] h-[150px] w-[150px] rounded-full object-cover opacity-[0.13] mix-blend-multiply md:right-10 md:h-[190px] md:w-[190px]"
            />

            <div className="bg-[#800020] px-3 py-1.5 text-center text-xs leading-snug text-white sm:py-2 sm:text-sm">
                💖 Trusted Telugu Matrimony Platform • Secure • Verified Profiles • Privacy Protected
            </div>

            <header className="relative z-[10050] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:relative">
                    <div className="flex h-16 items-center justify-between gap-3 sm:h-20">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                            {/* Small Logo */}
                            <img
                                src={nvLogo}
                                alt="నిశ్చయ వేదిక"
                                className=" h-12
        w-12
        sm:h-16
        sm:w-16
        rounded-full
        object-cover
        shadow-lg
        bg-white
        p-1"
                            />

                            {/* Title & Subtitle */}
                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-bold leading-tight text-[#800020] sm:text-3xl">
                                    నిశ్చయ వేదిక
                                </h1>

                                <p className="mt-1 truncate text-[11px] text-gray-500 sm:text-xs">
                                    Trusted Telugu Matrimony
                                </p>
                            </div>

                        </div>

                        <nav className="hidden lg:flex items-center text-sm font-medium">
                            <button
                                type="button"
                                className={`${navClass("/")} bg-transparent border-0 cursor-pointer`}
                                onClick={goToHome}
                            >
                                Home
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className={navClass("/search")} to="/search">
                                Search
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <button
                                type="button"
                                className={`${navClass("/membership", "membership")} bg-transparent border-0 cursor-pointer`}
                                onClick={() => openInfoModal("membership")}
                            >
                                Membership
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <button
                                type="button"
                                className={`${navClass("/success-stories", "success")} bg-transparent border-0 cursor-pointer`}
                                onClick={() => openInfoModal("success")}
                            >
                                Success
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <button
                                type="button"
                                className={`${navClass("/events", "events")} bg-transparent border-0 cursor-pointer`}
                                onClick={() => openInfoModal("events")}
                            >
                                Events
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <button
                                type="button"
                                className={`${navClass("/muhurthalu", "muhurthalu")} bg-transparent border-0 cursor-pointer`}
                                onClick={() => openInfoModal("muhurthalu")}
                            >
                                ముహూర్తాలు
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <button
                                type="button"
                                className={`${navClass("/contact", "contact")} bg-transparent border-0 cursor-pointer`}
                                onClick={() => openInfoModal("contact")}
                            >
                                Contact
                            </button>
                        </nav>

                        <div className="flex flex-shrink-0 items-center gap-2 lg:hidden">
                            {user && (
                                <div className="group relative flex max-w-[132px] items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-2 py-1 text-xs shadow-sm sm:max-w-[190px] sm:px-3">
                                    <span className="min-w-0 truncate font-semibold text-gray-700">
                                        Hi, {displayName}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex-shrink-0 border-0 bg-transparent font-semibold text-[#800020]"
                                    >
                                        Logout
                                    </button>
                                    {renderAccountPreview()}
                                </div>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-2xl text-[#800020]"
                                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                            </button>
                        </div>

                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <>
                                    <div className="group relative">
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 border-0 bg-transparent text-gray-600 font-medium"
                                        >
                                            <FaUserCircle className="text-[#800020]" />
                                            Hi, {displayName}
                                        </button>
                                        {renderAccountPreview()}
                                    </div>

                                    <span className="mx-2 text-amber-500 font-semibold">|</span>

                                    <button
                                        onClick={handleLogout}
                                        className="nav-link bg-transparent border-0 cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="nav-link bg-transparent border-0 cursor-pointer"
                                    >
                                        Login
                                    </button>

                                    <span className="mx-2 text-amber-500 font-semibold">|</span>

                                    <button
                                        onClick={() => setIsRegisterOpen(true)}
                                        className="nav-link bg-transparent border-0 cursor-pointer"
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="mobile-menu-panel max-h-[calc(100vh-5rem)] overflow-y-auto border-t bg-white px-4 py-4 shadow-lg sm:px-6 lg:hidden">

                        <button type="button" className="mobile-nav-link" onClick={goToHome}>
                            Home
                        </button>

                        <Link
                            to="/search"
                            className="mobile-nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Search
                        </Link>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("membership")}>
                            Membership
                        </button>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("contact")}>
                            Contact
                        </button>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("events")}>
                            Events
                        </button>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("success")}>
                            Success Stories
                        </button>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("muhurthalu")}>
                            ముహూర్తాలు
                        </button>

                        {user && (
                            <div className="mt-3 border-t border-rose-100 pt-3">
                                {canSeeDashboardMenu && (
                                    <Link
                                        to="/dashboard"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {canSeeProfileMenu && (
                                    <button
                                        type="button"
                                        className="mobile-nav-link"
                                        onClick={() => {
                                            setIsCreateProfileOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        Profile
                                    </button>
                                )}

                                {canSeeSentMenu && (
                                    <Link
                                        to="/sent-interests"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sent
                                    </Link>
                                )}

                                {canSeeReceivedMenu && (
                                    <Link
                                        to="/received-interests"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Received
                                    </Link>
                                )}

                                {canSeeAdminProfilesMenu && (
                                    <Link
                                        to="/admin/profiles"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Admin
                                    </Link>
                                )}

                                {canSeeAdminPaymentsMenu && (
                                    <Link
                                        to="/admin/payments"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Payments
                                    </Link>
                                )}

                                {canSeeAdminContentMenu && (
                                    <Link
                                        to="/admin/content"
                                        className="mobile-nav-link"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Pages
                                    </Link>
                                )}

                                {canSeeAdminUsersMenu && (
                                    <Link to="/admin/users" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        Users
                                    </Link>
                                )}

                                {canSeeSuperAdminMenu && (
                                    <Link to="/admin/super-admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        Super Admin
                                    </Link>
                                )}
                            </div>
                        )}

                        {!user && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsLoginOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mobile-nav-link text-left w-full"
                                >
                                    Login
                                </button>

                                <button
                                    onClick={() => {
                                        setIsRegisterOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mobile-nav-link text-left w-full"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                )}

                <RegisterModal
                    isOpen={isRegisterOpen}
                    onClose={() => setIsRegisterOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </header>

            {isCreateProfileOpen && (
                <CreateProfileModal onClose={() => setIsCreateProfileOpen(false)} />
            )}

            {isLoggedIn && (
                <div className="relative z-[10000] hidden lg:flex items-center justify-center gap-4 border-t border-gray-100 bg-white/95 py-3 text-sm font-medium shadow-sm account-user-menu">
                    {canSeeDashboardMenu && (
                        <Link className={accountLinkClass("/dashboard")} data-label="Dashboard" to="/dashboard">
                            Dashboard
                        </Link>
                    )}

                    {canSeeProfileMenu && (
                        <button
                            onClick={() => setIsCreateProfileOpen(true)}
                            className="account-menu-link"
                            data-label="Profile"
                        >
                            Profile
                        </button>
                    )}

                    {canSeeSentMenu && (
                        <Link className={accountLinkClass("/sent-interests")} data-label="Sent" to="/sent-interests">
                            Sent
                        </Link>
                    )}

                    {canSeeReceivedMenu && (
                        <Link className={accountLinkClass("/received-interests")} data-label="Received" to="/received-interests">
                            Received
                        </Link>
                    )}
                    {canSeeAdminProfilesMenu && (
                        <Link className={accountLinkClass("/admin/profiles")} data-label="Admin" to="/admin/profiles">
                            Admin
                        </Link>
                    )}
                    {canSeeAdminPaymentsMenu && (
                        <Link className={accountLinkClass("/admin/payments")} data-label="Payments" to="/admin/payments">
                            Payments
                        </Link>
                    )}
                    {canSeeAdminContentMenu && (
                        <Link className={accountLinkClass("/admin/content")} data-label="Pages" to="/admin/content">
                            Pages
                        </Link>
                    )}
                    {canSeeAdminUsersMenu && (
                        <Link className={accountLinkClass("/admin/users")} data-label="Users" to="/admin/users">
                            Users
                        </Link>
                    )}
                    {canSeeSuperAdminMenu && (
                        <Link className={accountLinkClass("/admin/super-admin")} data-label="Super Admin" to="/admin/super-admin">
                            Super Admin
                        </Link>
                    )}
                </div>
            )}
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                setUser={setUser}
            />

            {infoModal && (
                <HeaderInfoModal
                    type={infoModal}
                    onClose={() => setInfoModal(null)}
                    isLoggedIn={isLoggedIn}
                    membershipPlan={membershipPlan}
                    onMembershipAction={handleMembershipAction}
                />
            )}
        </div>
    );
}
