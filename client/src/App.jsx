import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/create-profile" element={<CreateProfile />} />
        </Routes>
    );
}

export default App;