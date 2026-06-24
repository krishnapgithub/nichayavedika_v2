import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import SearchProfiles from "./pages/SearchProfiles.jsx";
import SessionTimeout from "./components/SessionTimeout.jsx";

function App() {
    const isLoggedIn = !!localStorage.getItem("user");
    console.log("SessionTimeout Loaded", isLoggedIn);
    console.log("Rama & Sita loading..");
    

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        alert("Your session expired. Please login again.");
        window.location.href = "/";
    };

    return (
        <>
            <SessionTimeout
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
            />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/search" element={<SearchProfiles />} />
            </Routes>
        </>
    );
}

export default App;