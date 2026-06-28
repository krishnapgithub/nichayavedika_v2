import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

export default function ReceivedInterests() {
    const [interests, setInterests] = useState([]);

    useEffect(() => {
        fetchReceivedInterests();
    }, []);

    const fetchReceivedInterests = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem("user"));

            if (!savedUser?._id) {
                toast.error("Please login to view received interests");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/interests/received/${savedUser._id}`
            );

            setInterests(response.data.interests || []);
        } catch (error) {
            console.error(error);
            toast.error("Unable to load received interests");
        }
    };

    const updateStatus = async (interestId, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/interests/${interestId}/status`, {
                status,
            });

            toast.success(`Interest ${status}`);
            fetchReceivedInterests();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update interest");
        }
    };

    return (
        <>

            <div className="min-h-screen bg-[#fff8f2] pt-32 px-4 pb-12">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#800020] mb-6">
                        Received Interests
                    </h1>

                    {interests.length === 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow text-center">
                            No received interests found.
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {interests.map((item) => {
                            const profile = item.fromUser || item.toProfile;
                            const status = String(item.status || "").toLowerCase();

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
                                            {profile?.fullName || profile?.name || "Profile"}
                                        </h2>

                                        <p className="text-gray-600">
                                            {profile?.age || "-"} yrs • {profile?.height || "-"}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.education || "-"} • {profile?.occupation || "-"}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.city || "-"}, {profile?.state || "-"}
                                        </p>

                                        {status === "pending" ? (
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => updateStatus(item._id, "accepted")}
                                                    className="bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-white px-5 py-2 rounded-lg shadow-md"
                                                >
                                                    ? Accept
                                                </button>

                                                <button
                                                    onClick={() => updateStatus(item._id, "rejected")}
                                                    className="bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-white px-5 py-2 rounded-lg shadow-md"
                                                >
                                                    ? Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                className={`inline-block mt-4 px-4 py-2 rounded-full font-semibold ${status === "accepted"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {status === "accepted" ? "? Accepted" : "? Rejected"}
                                            </span>
                                        )}
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

