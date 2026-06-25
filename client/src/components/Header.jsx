import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/home.css";
import { Link } from "react-router-dom";
import CreateProfileModal from "./CreateProfileModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    FaUserCircle,
    FaSearch,
    FaHeart,
    FaPhoneAlt,
    FaEnvelope,
    FaWhatsapp,
    FaFacebook,
    FaInstagram,
    FaSignOutAlt,
    FaUserPlus,
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
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);

        setIsLoginOpen(false);
        setIsRegisterOpen(false);
        setIsCreateProfileOpen(false);

        console.log("🙏 Sita Rama Blessings!");

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
                        <div>
                            <h1 className="text-3xl font-bold text-[#800020]">
                                నిశ్చయ వేదిక
                            </h1>

                            <p className="text-xs text-gray-500">
                                Trusted Telugu Matrimony
                            </p>
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

                            {/* ---------------- LOGGED IN MENU ---------------- */}

                            {isLoggedIn && (
                                <>
                                    <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                                    <Link className="nav-link" to="/dashboard">
                                        Dashboard
                                    </Link>

                                    <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                                    <button
                                        onClick={() => setIsCreateProfileOpen(true)}
                                        className="nav-link bg-transparent border-0 cursor-pointer"
                                    >
                                        Profile
                                    </button>

                                    <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                                    <Link className="nav-link" to="/sent-interests">
                                        Sent
                                    </Link>

                                    <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                                    <Link className="nav-link" to="/received-interests">
                                        Received
                                    </Link>

                                  
                                </>
                            )}

                            {/* ---------------- LOGGED OUT MENU ---------------- */}

                            

                        </nav>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden text-[#800020] text-2xl"
                        >
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>

                                       

                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-1">
                                        <span className="flex items-center gap-1 text-sm text-gray-600 font-medium whitespace-nowrap">
                                            <FaUserCircle className="text-[#800020] text-lg" />
                                            Hi, {user.fullName}
                                        </span>

                                        <span className="text-amber-500 font-semibold">|</span>

                                        <button
                                            onClick={handleLogout}
                                            className="nav-link bg-transparent border-0 cursor-pointer"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                        <button
                                            onClick={() => setIsLoginOpen(true)}
                                            className="nav-link bg-transparent border-0 cursor-pointer"
                                        >
                                            Login
                                        </button>

                                        <span className="mx-1 text-amber-500 font-semibold">|</span>

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
                    <div className="lg:hidden w-full bg-white border-t border-gray-200 py-4 shadow-lg">
                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/" onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>

                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/search" onClick={() => setIsMobileMenuOpen(false)}>
                            Search
                        </Link>

                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/membership" onClick={() => setIsMobileMenuOpen(false)}>
                            Membership
                        </Link>

                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/success-stories" onClick={() => setIsMobileMenuOpen(false)}>
                            Success
                        </Link>

                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/events" onClick={() => setIsMobileMenuOpen(false)}>
                            Events
                        </Link>

                        <Link className="block px-4 py-3 text-[#800020] font-medium" to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                            Contact
                        </Link>

                        {isLoggedIn && (
                            <>
                                <Link className="block px-4 py-3 text-[#800020] font-medium" to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsCreateProfileOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 text-[#800020] font-medium bg-transparent border-0"
                                >
                                    Profile
                                </button>

                                <Link className="block px-4 py-3 text-[#800020] font-medium" to="/sent-interests" onClick={() => setIsMobileMenuOpen(false)}>
                                    Sent
                                </Link>

                                <Link className="block px-4 py-3 text-[#800020] font-medium" to="/received-interests" onClick={() => setIsMobileMenuOpen(false)}>
                                    Received
                                </Link>
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


            {user?.role === "admin" && (
                <Link
                    to="/admin"
                    className="
            fixed
            top-36
            right-5
            z-[9998]
            bg-white
            text-[#800020]
            border
            border-[#800020]/20
            px-4
            py-2
            rounded-full
            shadow-lg
            hover:bg-[#fff7f0]
            hover:border-[#800020]
            transition
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            whitespace-nowrap
        "
                >
                    🛡️ Admin
                </Link>
            )}

        </div>
    );
}