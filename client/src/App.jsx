import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;