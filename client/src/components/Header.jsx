import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
export default function Header() {

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    return (

        <div className="fixed top-0 left-0 w-full z-[9999]">
            <div className="bg-[#800020] text-white text-center py-2 text-sm">
                💖 Trusted Telugu Matrimony Platform • Secure • Verified Profiles • Privacy Protected
            </div>



            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">

            
            

            <div className="max-w-7xl mx-auto px-6">

                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <div>
                        <h1 className="text-3xl font-bold text-[#800020]">
                            నిశ్చయ వేదిక
                        </h1>

                        <p className="text-xs text-gray-500">
                            Trusted Telugu Matrimony
                        </p>
                    </div>

                    {/* Menu */}
                    <nav className="hidden lg:flex items-center text-sm font-medium">

                        <a
                            href="#"
                            className="
    text-gray-700
    hover:text-[#800020]
    hover:font-semibold
    transition-all duration-200
  "
                        >
                            Home
                        </a>

                        <span className="mx-4 text-amber-500 text-xl font-bold">•</span>

                        <a href="#" className="
    text-gray-700
    hover:text-[#800020]
    hover:font-semibold
    transition-all duration-200
  ">Search Profiles</a>

                        <span className="mx-4 text-amber-500 text-xl font-bold">•</span>

                        <a href="#" className="
    text-gray-700
    hover:text-[#800020]
    hover:font-semibold
    transition-all duration-200
  ">Membership</a>

                        <span className="mx-4 text-amber-500 text-xl font-bold">•</span>

                        <a href="#" className="
    text-gray-700
    hover:text-[#800020]
    hover:font-semibold
    transition-all duration-200
  ">Success Stories</a>

                        <span className="mx-4 text-amber-500 text-xl font-bold">•</span>

                        <a href="#" className="
    text-gray-700
    hover:text-[#800020]
    hover:font-semibold
    transition-all duration-200
  ">Contact</a>

                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">

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

                    </div>

                </div>
            </div>
            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
            />
            </header>
        </div>
    );
}