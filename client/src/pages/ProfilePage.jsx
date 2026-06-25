import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";


export default function ProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [interestSent, setInterestSent] = useState(false);



    const sendInterest = async () => {
        if (!profile?._id) {
            alert("Profile not loaded yet");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/interests/send", {
                fromUser: "6a39857828603c403e7c71bf",
                toProfile: profile._id,
            });

            console.log("INTEREST SUCCESS:", response.data);

            setInterestSent(true);
            alert("Interest Sent Successfully ❤️");
        } catch (error) {
            console.log("INTEREST ERROR:", error);
            console.log("SERVER RESPONSE:", error.response?.data);

            alert(error.response?.data?.message || "Failed to send interest");
        }
    };

    

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/profiles/${id}`
            );

            setProfile(response.data.profile);
        } catch (error) {
            console.error("Profile fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="pt-32 text-center text-[#800020] font-semibold">
                    Loading profile...
                </div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <Header />
                <div className="pt-32 text-center text-red-600 font-semibold">
                    Profile not found
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#fff8f2] pt-32 px-4 pb-12">
                <div className="max-w-5xl mx-auto">

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="bg-[#800020] h-32"></div>

                        <div className="px-6 pb-8 text-center -mt-20">
                            <div className="h-40 w-40 rounded-full mx-auto border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                                {profile.profilePhoto ? (
                                    <img
                                        src={`http://localhost:5000/uploads/${profile.profilePhoto}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Photo
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold mt-4 text-[#800020]">
                                {profile.fullName}
                            </h1>

                            <p className="text-gray-600 mt-2">
                                {profile.age} yrs • {profile.height} • {profile.maritalStatus}
                            </p>

                            <p className="text-gray-600">
                                {profile.education} • {profile.occupation}
                            </p>

                            <p className="text-gray-600">
                                {profile.city}, {profile.state}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    console.log("BUTTON CLICKED");
                                    sendInterest();
                                }}
                                disabled={interestSent}
                                className={`mt-6 px-10 py-3 rounded-xl font-semibold text-white ${interestSent ? "bg-green-600" : "bg-[#800020]"
                                    }`}
                            >
                                {interestSent ? "✓ Interest Sent" : "❤️ Send Interest"}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-8">

                        <Section title="Basic Details">
                            <Info label="Gender" value={profile.gender} />
                            <Info label="Date of Birth" value={profile.dateOfBirth?.slice(0, 10)} />
                            <Info label="Mother Tongue" value={profile.motherTongue} />
                            <Info label="Religion" value={profile.religion} />
                            <Info label="Caste" value={profile.caste} />
                            <Info label="Sub Caste" value={profile.subCaste} />
                            <Info label="Gothram" value={profile.gothram} />
                        </Section>

                        <Section title="Education & Career">
                            <Info label="Education" value={profile.education} />
                            <Info label="Occupation" value={profile.occupation} />
                            <Info label="Annual Income" value={profile.annualIncome} />
                        </Section>

                        <Section title="Location">
                            <Info label="City" value={profile.city} />
                            <Info label="State" value={profile.state} />
                            <Info label="Country" value={profile.country} />
                        </Section>

                        <Section title="Partner Preferences">
                            <Info label="Preferred Age" value={`${profile.preferredAgeFrom || "-"} to ${profile.preferredAgeTo || "-"}`} />
                            <Info label="Preferred Caste" value={profile.preferredCaste} />
                            <Info label="Preferred Location" value={profile.preferredLocation} />
                        </Section>

                        <Section title="About Me" full>
                            <p className="text-gray-600">
                                {profile.aboutMe || "Not added"}
                            </p>
                        </Section>

                        <Section title="Family Details" full>
                            <p className="text-gray-600">
                                {profile.familyDetails || "Not added"}
                            </p>
                        </Section>

                    </div>
                </div>
            </div>
        </>
    );
}


function Section({ title, children, full }) {
    return (
        <div className={`bg-white rounded-2xl shadow-md p-6 ${full ? "md:col-span-2" : ""}`}>
            <h2 className="text-xl font-bold text-[#800020] mb-4">
                {title}
            </h2>
            {children}
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex justify-between border-b py-2 gap-4">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800 text-right">
                {value || "Not added"}
            </span>
        </div>
    );
}