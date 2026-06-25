import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import SearchProfiles from "./pages/SearchProfiles.jsx";
import SessionTimeout from "./components/SessionTimeout.jsx";
import SentInterests from "./pages/SentInterests.jsx";
import ReceivedInterests from "./pages/ReceivedInterests.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Membership from "./pages/Membership.jsx";
import Events from "./pages/Events.jsx";
import Contact from "./pages/Contact.jsx";

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
                    alert("Your session expired. Please login again.");
                    window.location.href = "/";
                }}
            />

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
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />

            </Routes>
        </>
    );
}

export default App;