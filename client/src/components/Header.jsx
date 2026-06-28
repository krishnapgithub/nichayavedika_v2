import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/home.css";
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

export default function Header() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [infoModal, setInfoModal] = useState(null);

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
    const canReviewProfiles = ["admin", "oper_admin", "super_admin"].includes(userRole);
    const canManageUsers = userRole === "super_admin";

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

    const openInfoModal = (type) => {
        setInfoModal(type);
        setIsMobileMenuOpen(false);
    };

    const navClass = (path, modalType = null) => {
        const isActive = modalType
            ? infoModal === modalType
            : !infoModal && location.pathname === path;

        return isActive ? "nav-link active" : "nav-link";
    };

    return (
        <div className="fixed top-0 left-0 w-full z-[9999]">
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
                            <Link className={navClass("/")} to="/">
                                Home
                            </Link>

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

                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Home
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

                        {canReviewProfiles && (
                            <Link
                                to="/admin/profiles"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin
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

                <LoginModal
                    isOpen={isLoginOpen}
                    onClose={() => {
                        setIsLoginOpen(false);
                        const savedUser = localStorage.getItem("user");
                        if (savedUser) {
                            setUser(JSON.parse(savedUser));
                        }
                    }}
                />

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
                <div className="hidden lg:flex items-center justify-center gap-4 border-t border-gray-100 bg-white/95 py-3 text-sm font-medium shadow-sm account-user-menu">


                    <Link className="account-menu-link" data-label="Dashboard" to="/dashboard">
                        Dashboard
                    </Link>

                    <button
                        onClick={() => setIsCreateProfileOpen(true)}
                        className="account-menu-link"
                        data-label="Profile"
                    >
                        Profile
                    </button>

                    <Link className="account-menu-link" data-label="Sent" to="/sent-interests">
                        Sent
                    </Link>

                    <Link className="account-menu-link" data-label="Received" to="/received-interests">
                        Received
                    </Link>
                    {canReviewProfiles && (
                        <Link className="account-menu-link" data-label="Admin" to="/admin/profiles">
                            Admin
                        </Link>
                    )}
                    {canManageUsers && (
                        <Link className="account-menu-link" data-label="Super Admin" to="/admin/users">
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
                />
            )}
        </div>
    );
}
