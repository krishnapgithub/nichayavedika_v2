
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";


export default function ReceivedInterests() {
    const [interests, setInterests] = useState([]);
    const userId = "6a39857828603c403e7c71bf";

    useEffect(() => {
        fetchReceivedInterests();
    }, []);

    const fetchReceivedInterests = async () => {
        const response = await axios.get(
            `http://localhost:5000/api/interests/received/${userId}`
        );

        setInterests(response.data.interests || []);
    };

    const updateStatus = async (interestId, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/interests/${interestId}/status`,
                { status }
            );

            fetchReceivedInterests();



        } catch (error) {
            alert(error.response?.data?.message || "Failed to update interest");
        }
    };

    return (
        <>
            <Header />

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
                            const profile = item.toProfile;

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl shadow-lg p-5 flex gap-4"
                                >
                                    <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                                        {profile?.profilePhoto ? (
                                            <img
                                                src={`http://localhost:5000/uploads/${profile.profilePhoto}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            "Photo"
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-[#800020]">
                                            {profile?.fullName}
                                        </h2>

                                        <p className="text-gray-600">
                                            {profile?.age} yrs • {profile?.height}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.education} • {profile?.occupation}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.city}, {profile?.state}
                                        </p>

                                        {item.status === "Pending" ? (
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => updateStatus(item._id, "Accepted")}
                                                    className="bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-white px-5 py-2 rounded-lg shadow-md"
                                                >
                                                    ✅ Accept
                                                </button>

                                                <button
                                                    onClick={() => updateStatus(item._id, "Rejected")}
                                                    className="bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-white px-5 py-2 rounded-lg shadow-md"
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                className={`inline-block mt-4 px-4 py-2 rounded-full font-semibold ${item.status === "Accepted"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status === "Accepted" ? "✅ Accepted" : "❌ Rejected"}
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