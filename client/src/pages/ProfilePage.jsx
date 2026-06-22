import { useParams } from "react-router-dom";
import Header from "../components/Header";

const profiles = [
    {
        id: 1,
        name: "Ravi Kumar",
        age: 28,
        caste: "Brahmin",
        location: "Hyderabad",
        bio: "Software Engineer, family-oriented and traditional values.",
    },
    {
        id: 2,
        name: "Priya Sharma",
        age: 25,
        caste: "Kshatriya",
        location: "Chennai",
        bio: "Doctor, loves traveling and cultural activities.",
    },
    {
        id: 3,
        name: "Ravi Kumar",
        age: 28,
        caste: "Brahmin",
        location: "Hyderabad",
        bio: "Software Engineer, family-oriented and traditional values.",
    },
    {
        id: 4,
        name: "Priya Sharma",
        age: 25,
        caste: "Kshatriya",
        location: "Chennai",
        bio: "Doctor, loves traveling and cultural activities.",
    },
];

export default function ProfilePage() {
    const { id } = useParams();

    const profile = profiles.find((p) => p.id === Number(id));

    if (!profile) {
        return <div className="p-10">Profile not found</div>;
    }

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

                    <button className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg">
                        Send Interest
                    </button>

                </div>
            </div>
        </>
    );
}