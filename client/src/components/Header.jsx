import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/home.css";
import { Link } from "react-router-dom";
import CreateProfileModal from "./CreateProfileModal";



export default function Header() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
    
    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        alert("Logged out successfully");
    };

    return (

        <div className="fixed top-0 left-0 w-full z-[9999]">
            <div className="bg-[#800020] text-white text-center py-2 text-sm">
                💖 Trusted Telugu Matrimony Platform • Secure • Verified Profiles • Privacy Protected
            </div>

            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
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
                            <Link className="nav-link" to="/">Home</Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            {/* {user && (
                                <>
                                    <Link className="nav-link" to="/create-profile">
                                        Create Profile
                                    </Link>

                                    <span className="mx-4 text-amber-500 text-xl font-bold">|</span>
                                </>
                            )}*/}

                            <button 
                                onClick={() => setIsCreateProfileOpen(true)}
                                className="nav-link bg-transparent border-0 cursor-pointer"
                            >
                                Create Profile
                            </button>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/search">
                                Search Profiles
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/membership">
                                Membership
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/success-stories">
                                Success Stories
                            </Link>

                            <span className="mx-4 text-amber-500 text-xl font-bold">|</span>

                            <Link className="nav-link" to="/contact">
                                Contact
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <span className="text-sm text-gray-600">
                                        Hi, {user.fullName}
                                    </span>

                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2 rounded-xl bg-[#800020] text-white hover:bg-[#5c0017] transition shadow-lg"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                                    >
                                        Login
                                    </button>

                                    <button
                                        onClick={() => setIsRegisterOpen(true)}
                                        className="px-5 py-2 rounded-xl bg-[#800020] text-white hover:bg-[#5c0017] transition shadow-lg"
                                    >
                                        Register Free
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

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
                />
            </header>
            {isCreateProfileOpen && (
                <CreateProfileModal onClose={() => setIsCreateProfileOpen(false)} />
            )}

        </div>
    );
}