import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

export default function SentInterests() {
    const [interests, setInterests] = useState([]);

    useEffect(() => {
        fetchSentInterests();
    }, []);

    const fetchSentInterests = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));

            if (!savedUser?._id) {
                toast.error("Please login to view sent interests");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/interests/sent/${savedUser._id}`
            );

            setInterests(response.data.interests || []);
        } catch (error) {
            console.error(error);
            toast.error("Unable to load sent interests");
        }
    };

    return (
        <>

            <div className="min-h-screen bg-[#fff8f2] pt-32 px-4 pb-12">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#800020] mb-6">
                        Sent Interests
                    </h1>

                    {interests.length === 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow text-center">
                            No sent interests found.
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {interests.map((item) => {
                            const profile = item.toProfile;

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl shadow-lg p-5 flex gap-4"
                                >
                                    <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                                        {profile?.profilePhoto ? (
                                            <img
                                                src={profile.profilePhoto}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            "Photo"
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-[#800020]">
                                            {profile?.fullName || "Profile"}
                                        </h2>

                                        <p className="text-gray-600">
                                            {profile?.age} yrs â€¢ {profile?.height}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.education} â€¢ {profile?.occupation}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.city}, {profile?.state}
                                        </p>

                                        <span className="inline-block mt-3 px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

