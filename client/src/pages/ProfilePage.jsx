import { useParams } from "react-router-dom";
import Header from "../components/Header";

const profiles = [
    {
        id: 1,
        name: "Ravi Kumar",
        age: 28,
        caste: "Brahmin",
        location: "Hyderabad",
        mobile: "9999999999",
        email: "ravi@example.com",
        bio: "Software Engineer, family-oriented and traditional values.",
    },
    {
        id: 2,
        name: "Priya Sharma",
        age: 25,
        caste: "Kshatriya",
        location: "Chennai",
        mobile: "8888888888",
        email: "priya@example.com",
        bio: "Doctor, loves traveling and cultural activities.",
    },
];

export default function ProfilePage() {
    const { id } = useParams();

    const profile = profiles.find((p) => p.id === Number(id));

    if (!profile) {
        return <div className="p-10">Profile not found</div>;
    }

    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const isFreeUser = loggedUser?.membershipPlan === "free";

    return (
        <>
            <Header />

            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white shadow-xl rounded-2xl p-6">

                    <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                        Photo
                    </div>

                    <h1 className="text-3xl font-bold text-center mt-4">
                        {profile.name}
                    </h1>

                    <p className="text-center text-gray-600 mt-2">
                        {profile.age} yrs • {profile.caste}
                    </p>

                    <p className="text-center text-gray-500">
                        {profile.location}
                    </p>

                    <p className="mt-6 text-center text-gray-700">
                        {profile.bio}
                    </p>

                    <div className="mt-6 p-4 rounded-xl border bg-gray-50">
                        <h3 className="font-bold text-[#800020] mb-2">
                            Contact Details
                        </h3>

                        {isFreeUser ? (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
                                Contact details are available for Premium members only.
                                Please upgrade your membership to view mobile and email.
                            </div>
                        ) : (
                            <>
                                <p>Mobile: {profile.mobile}</p>
                                <p>Email: {profile.email}</p>
                            </>
                        )}
                    </div>

                    <button className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg">
                        Send Interest
                    </button>

                </div>
            </div>
        </>
    );
}