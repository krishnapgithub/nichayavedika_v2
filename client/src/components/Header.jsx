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
    FaTimes
} from "react-icons/fa";

const legalSections = [
    { id: "privacy", label: "Privacy" },
    { id: "purpose", label: "Matrimony Purpose" },
    { id: "rules", label: "Safety Rules" },
];

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
    const canManageUsers = userRole === "super_admin";

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

    const handleLogout = () => {
        localStorage.clear();

        setUser(null);

        setIsLoginOpen(false);
        setIsRegisterOpen(false);
        setIsCreateProfileOpen(false);

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
            const selectedPlan = planTitle === "Elite" ? "elite" : "premium";

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

    return (
        <div className="fixed top-0 left-0 w-full z-[9999]">
            <img
                src={nvLogo}
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed right-6 top-[78px] z-[1] h-[150px] w-[150px] rounded-full object-cover opacity-[0.055] mix-blend-multiply md:right-10 md:h-[190px] md:w-[190px]"
            />

            <div className="bg-[#800020] text-white text-center py-2 text-sm">
                💖 Trusted Telugu Matrimony Platform • Secure • Verified Profiles • Privacy Protected
            </div>

            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 relative -top-2">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">

                            {/* Small Logo */}
                            <img
                                src={nvLogo}
                                alt="నిశ్చయ వేదిక"
                                className=" h-16
        w-16
        rounded-full
        object-cover
        shadow-lg
        bg-white
        p-1"
                            />

                            {/* Title & Subtitle */}
                            <div>
                                <h1 className="text-3xl font-bold text-[#800020] leading-none">
                                    నిశ్చయ వేదిక
                                </h1>

                                <p className="text-xs text-gray-500 mt-1">
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

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden text-[#800020] text-2xl"
                        >
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>

                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <>
                                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                                        <FaUserCircle className="text-[#800020]" />
                                        Hi, {user.fullName}
                                    </span>

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
                    <div className="md:hidden bg-white border-t shadow-lg px-6 py-4 space-y-4">

                        <button type="button" className="mobile-nav-link" onClick={goToHome}>
                            Home
                        </button>

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

                        <button type="button" className="mobile-nav-link" onClick={goToLegalHome}>
                            Legal & Terms
                        </button>

                        <button type="button" className="mobile-nav-link" onClick={() => openInfoModal("muhurthalu")}>
                            ముహూర్తాలు
                        </button>

                        {canReviewProfiles && (
                            <Link
                                to="/admin/profiles"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}

                        {canReviewProfiles && (
                            <Link
                                to="/admin/payments"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Payments
                            </Link>
                        )}

                        {canReviewProfiles && (
                            <Link
                                to="/admin/content"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pages
                            </Link>
                        )}

                        {canManageUsers && (
                            <Link to="/admin/users" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                Super Admin
                            </Link>
                        )}

                        {user && (
                            <>
                                <div className="text-sm text-gray-600">
                                    Hi, {user.fullName}
                                </div>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mobile-nav-link text-left w-full"
                                >
                                    Logout
                                </button>
                            </>
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

            <div className="hidden lg:flex items-center justify-center gap-4 border-t border-gray-100 bg-white/95 py-3 text-sm font-medium shadow-sm account-user-menu">
                {isLoggedIn ? (
                    <>
                        <Link className={accountLinkClass("/dashboard")} data-label="Dashboard" to="/dashboard">
                            Dashboard
                        </Link>

                        <button
                            onClick={() => setIsCreateProfileOpen(true)}
                            className="account-menu-link"
                            data-label="Profile"
                        >
                            Profile
                        </button>

                        <Link className={accountLinkClass("/sent-interests")} data-label="Sent" to="/sent-interests">
                            Sent
                        </Link>

                        <Link className={accountLinkClass("/received-interests")} data-label="Received" to="/received-interests">
                            Received
                        </Link>
                        {canReviewProfiles && (
                            <Link className={accountLinkClass("/admin/profiles")} data-label="Admin" to="/admin/profiles">
                                Admin
                            </Link>
                        )}
                        {canReviewProfiles && (
                            <Link className={accountLinkClass("/admin/payments")} data-label="Payments" to="/admin/payments">
                                Payments
                            </Link>
                        )}
                        {canReviewProfiles && (
                            <Link className={accountLinkClass("/admin/content")} data-label="Pages" to="/admin/content">
                                Pages
                            </Link>
                        )}
                        {canManageUsers && (
                            <Link className={accountLinkClass("/admin/users")} data-label="Super Admin" to="/admin/users">
                                Super Admin
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className={accountLinkClass("/legal")}
                            data-label="Legal & Terms"
                            onClick={goToLegalHome}
                        >
                            Legal & Terms
                        </button>
                        {legalSections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                className={legalSectionLinkClass(section.id)}
                                data-label={section.label}
                                onClick={() => goToLegalSection(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </>
                )}
            </div>
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
