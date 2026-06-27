import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

export default function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        fetchPendingProfiles();
    }, []);

    const fetchPendingProfiles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/profiles/admin/pending`);
            setProfiles(res.data.profiles || []);
        } catch (error) {
            console.error(error);
            toast.error("Unable to load pending profiles");
        }
    };

    const updateStatus = async (profileId, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/profiles/admin/${profileId}/status`, {
                status,
            });

            toast.success(`Profile ${status}`);
            fetchPendingProfiles();
        } catch (error) {
            console.error(error);
            toast.error("Unable to update profile");
        }
    };

    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#fff8f2] pt-32 px-4 pb-12">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#800020] mb-6">
                        Admin Profile Approvals
                    </h1>

                    {profiles.length === 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow text-center">
                            No pending profiles.
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {profiles.map((profile) => (
                            <div key={profile._id} className="bg-white rounded-2xl shadow p-5">
                                <h2 className="text-xl font-bold text-[#800020]">
                                    {profile.fullName || "Profile"}
                                </h2>

                                <p>{profile.age} yrs • {profile.height}</p>
                                <p>{profile.education} • {profile.occupation}</p>
                                <p>{profile.city}, {profile.state}</p>
                                <p className="mt-3 text-gray-600">{profile.aboutMe}</p>

                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => updateStatus(profile._id, "approved")}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg"
                                    >
                                        ✅ Approve
                                    </button>

                                    <button
                                        onClick={() => updateStatus(profile._id, "rejected")}
                                        className="bg-red-600 text-white px-5 py-2 rounded-lg"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}