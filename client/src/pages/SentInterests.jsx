import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";

export default function SentInterests() {
    const [interests, setInterests] = useState([]);
    const userId = "6a39857828603c403e7c71bf";

    useEffect(() => {
        fetchSentInterests();
    }, []);

    const fetchSentInterests = async () => {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/interests/sent/${userId}`
            
        );

        setInterests(response.data.interests || []);
    };

    return (
        <>
            <Header />

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
                                                src= ''
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
                                            {profile?.age} yrs   {profile?.height}
                                        </p>

                                        <p className="text-gray-600">
                                            {profile?.education}   {profile?.occupation}
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