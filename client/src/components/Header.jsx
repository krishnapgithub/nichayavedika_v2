import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/home.css";
import { Link, useNavigate } from "react-router-dom";
import CreateProfileModal from "./CreateProfileModal";
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

    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const isLoggedIn = !!user;

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
                            <Link className="nav-link" to="/">
                                Home
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/search">
                                Search
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/membership">
                                Membership
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/success-stories">
                                Success
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/events">
                                Events
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/contact">
                                Contact
                            </Link>
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

                        <Link to="/membership" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Membership
                        </Link>

                        <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Contact
                        </Link>

                        <Link to="/events" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Events
                        </Link>

                        <Link to="/success-stories" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Success Stories
                        </Link>

                        {user && (user.role === "admin" || user.role === "superadmin" || user.role === "superAdmin") && (
                            <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                Admin Dashboard
                            </Link>
                        )}

                        {user && (user.role === "admin" || user.role === "superadmin") && (
                            <Link
                                to="/admin"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin Dashboard
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
                <div className="hidden lg:flex fixed top-40 right-5 z-[9998] flex-col gap-3 side-user-menu">


                    <Link className="side-menu-link" to="/dashboard">
                        👤 Dashboard
                    </Link>

                    <button
                        onClick={() => setIsCreateProfileOpen(true)}
                        className="side-menu-link"
                    >
                        💍 Profile
                    </button>

                    <Link className="side-menu-link" to="/sent-interests">
                        📤 Sent
                    </Link>

                    <Link className="side-menu-link" to="/received-interests">
                        📥 Received
                    </Link>
                    {["admin", "super_admin"].includes(user?.role) && (
                        <Link className="side-menu-link" to="/admin/profiles">
                            🛡️ Admin
                        </Link>
                    )}
                    {user?.role === "super_admin" && (
                        <Link className="side-menu-link" to="/admin/users">
                            👑 Super Admin
                        </Link>
                    )}
                </div>
            )}
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                setUser={setUser}
            />
        </div>
    );
}