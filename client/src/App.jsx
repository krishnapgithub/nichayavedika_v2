import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SessionTimeout from "./components/SessionTimeout.jsx";
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
    console.log("SessionTimeout Loaded", isLoggedIn);
    console.log("Rama & Sita loading..");

    //    const navigate = useNavigate();



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
        </>
    );
}

export default App;


