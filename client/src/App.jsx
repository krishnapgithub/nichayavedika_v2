import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SessionTimeout from "./components/SessionTimeout.jsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import SearchProfiles from "./pages/SearchProfiles.jsx";

import SentInterests from "./pages/SentInterests.jsx";
import ReceivedInterests from "./pages/ReceivedInterests.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Membership from "./pages/Membership.jsx";
import Events from "./pages/Events.jsx";
import Contact from "./pages/Contact.jsx";
import SuccessStories from "./pages/SuccessStories.jsx";
import Muhurthalu from "./pages/Muhurthalu.jsx";
import LegalInformation from "./pages/LegalInformation.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProfiles from "./pages/AdminProfiles.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import PaymentCheckout from "./pages/PaymentCheckout.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import AdminPageContent from "./pages/AdminPageContent.jsx";


function ProtectedRoute({ children }) {
    const isLoggedIn = !!localStorage.getItem("user");

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;

    }

    return children;
}




function App() {
    const isLoggedIn = !!localStorage.getItem("user");
    const location = useLocation();
    console.log("SessionTimeout Loaded", isLoggedIn);
    console.log("Rama & Sita loading..");

    //    const navigate = useNavigate();

    useEffect(() => {
        const id = location.hash.replace("#", "");

        if (!id) return;

        const scrollToHashTarget = () => {
            document.getElementById(id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        };

        const frameId = window.requestAnimationFrame(() => {
            window.setTimeout(scrollToHashTarget, 50);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [location.pathname, location.hash]);



    return (
        <>
            <SessionTimeout
                isLoggedIn={isLoggedIn}
                onLogout={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    //toast.success("Your session expired. Please login again.");
                    window.location.href = "/";
                }}
            />

            <Header />

            <Routes>


                <Route path="/" element={<Home />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route
                    path="/create-profile"
                    element={
                        <ProtectedRoute>
                            <CreateProfile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/search" element={<SearchProfiles />} />
                <Route path="/profile/:id" element={<ProfilePage />} />


                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sent-interests"
                    element={
                        <ProtectedRoute>
                            <SentInterests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/received-interests"
                    element={
                        <ProtectedRoute>
                            <ReceivedInterests />
                        </ProtectedRoute>
                    }
                />

                <Route path="/membership" element={<Membership />} />
                <Route
                    path="/payment/:plan"
                    element={
                        <ProtectedRoute>
                            <PaymentCheckout />
                        </ProtectedRoute>
                    }
                />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/muhurthalu" element={<Muhurthalu />} />
                <Route path="/legal" element={<LegalInformation />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/profiles"
                    element={
                        <ProtectedRoute>
                            <AdminProfiles />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/payments"
                    element={
                        <ProtectedRoute>
                            <AdminPayments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/content"
                    element={
                        <ProtectedRoute>
                            <AdminPageContent />
                        </ProtectedRoute>
                    }
                />

            </Routes>
            <FloatingInfoFooter />
        </>
    );
}

function FloatingInfoFooter() {
    const navigate = useNavigate();

    const goToLegal = (sectionId = "") => {
        const path = sectionId ? `/legal#${sectionId}` : "/legal";

        navigate(path);
    };

    const goToFaq = () => {
        navigate("/#faq");
    };

    return (
        <div className="fixed bottom-0 left-0 z-[9998] w-full border-t border-gray-100 bg-white px-2 py-1 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-center gap-y-0 text-center text-xs font-medium text-[#800020] sm:flex-nowrap sm:whitespace-nowrap sm:text-sm">
                <button
                    type="button"
                    onClick={() => goToLegal()}
                    className="border-0 bg-transparent px-1 py-1 font-medium text-[#374151] transition-colors hover:text-[#800020]"
                >
                    Legal
                </button>
                <span className="mx-1 text-base font-bold text-amber-500 sm:mx-4 sm:text-xl">|</span>
                <button
                    type="button"
                    onClick={() => goToLegal("privacy")}
                    className="border-0 bg-transparent px-1 py-1 font-medium text-[#374151] transition-colors hover:text-[#800020]"
                >
                    Privacy
                </button>
                <span className="mx-1 text-base font-bold text-amber-500 sm:mx-4 sm:text-xl">|</span>
                <button
                    type="button"
                    onClick={() => goToLegal("terms")}
                    className="border-0 bg-transparent px-1 py-1 font-medium text-[#374151] transition-colors hover:text-[#800020]"
                >
                    Terms
                </button>
                <span className="mx-1 text-base font-bold text-amber-500 sm:mx-4 sm:text-xl">|</span>
                <button
                    type="button"
                    onClick={goToFaq}
                    className="border-0 bg-transparent px-1 py-1 font-medium text-[#374151] transition-colors hover:text-[#800020]"
                >
                    FAQ
                </button>
                <span className="mx-1 text-base font-bold text-amber-500 sm:mx-4 sm:text-xl">|</span>
                <span className="text-gray-600">
                    Contact: info@nichayavedika.com
                </span>
                <span className="mx-1 text-base font-bold text-amber-500 sm:mx-4 sm:text-xl">|</span>
                <span className="text-gray-600">
                    © 2026 NichayaVedika. All Rights Reserved.
                </span>
            </div>
        </div>
    );
}

export default App;


