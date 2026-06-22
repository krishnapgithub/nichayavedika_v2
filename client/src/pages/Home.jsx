import { useState } from "react";

import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
function Home() {

    const [likedProfiles, setLikedProfiles] = useState([]);

    const toggleLike = (id) => {
        if (likedProfiles.includes(id)) {
            setLikedProfiles(likedProfiles.filter((pid) => pid !== id));
        } else {
            setLikedProfiles([...likedProfiles, id]);
        }
    };

    const profiles = [
        { id: 1, name: "Ravi Kumar", age: 28, gender: "Groom", caste: "Brahmin", location: "Hyderabad", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { id: 2, name: "Priya Sharma", age: 25, gender: "Bride", caste: "Kshatriya", location: "Chennai", image: "https://randomuser.me/api/portraits/men/32.jpg"  },
        { id: 3, name: "Ravi Kumar", age: 28, gender: "Groom", caste: "Brahmin", location: "Hyderabad", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { id: 4, name: "Priya Sharma", age: 25, gender: "Bride", caste: "Kshatriya", location: "Chennai", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    ];

    return (
        <>
            <Header />

            <main>

                {/* Hero */}
                <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-24">
                        <h1 className="text-6xl font-bold">
                            Find Your Perfect Life Partner
                        </h1>
                        <p className="mt-6 text-xl">
                            Trusted Telugu Matrimony Platform
                        </p>
                    </div>
                </section>

                {/* Search */}
                <div className="max-w-6xl mx-auto -mt-12 px-6">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="grid md:grid-cols-4 gap-4">
                            <select className="border p-3 rounded-lg">
                                <option>Bride</option>
                                <option>Groom</option>
                            </select>

                            <select className="border p-3 rounded-lg">
                                <option>Age</option>
                            </select>

                            <select className="border p-3 rounded-lg">
                                <option>Caste</option>
                            </select>

                            <button className="bg-red-600 text-white rounded-lg">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-4xl font-bold text-center text-gray-900">
                            Success Stories
                        </h2>

                        <p className="text-center text-gray-500 mt-3 mb-12">
                            Celebrating happy marriages made possible through NichayaVedika
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">

                            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-md hover:shadow-xl transition">
                                <div className="text-5xl text-center mb-4">💑</div>

                                <h3 className="text-xl font-bold text-center">
                                    Ravi & Priya
                                </h3>

                                <p className="text-gray-600 text-center mt-4">
                                    "We found each other through NichayaVedika.
                                    The platform made our search simple and meaningful.
                                    Today we are happily married."
                                </p>

                                <p className="text-center text-red-600 font-semibold mt-4">
                                    Married in 2025
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-md hover:shadow-xl transition">
                                <div className="text-5xl text-center mb-4">❤️</div>

                                <h3 className="text-xl font-bold text-center">
                                    Suresh & Anjali
                                </h3>

                                <p className="text-gray-600 text-center mt-4">
                                    "The profile verification process gave us confidence.
                                    We connected with our families and everything worked perfectly."
                                </p>

                                <p className="text-center text-red-600 font-semibold mt-4">
                                    Married in 2024
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-md hover:shadow-xl transition">
                                <div className="text-5xl text-center mb-4">🌸</div>

                                <h3 className="text-xl font-bold text-center">
                                    Kiran & Deepika
                                </h3>

                                <p className="text-gray-600 text-center mt-4">
                                    "We were looking for someone who shared our values.
                                    NichayaVedika helped us find the perfect match."
                                </p>

                                <p className="text-center text-red-600 font-semibold mt-4">
                                    Married in 2025
                                </p>
                            </div>

                        </div>

                    </div>
                </section>

                <section className="py-20 bg-gradient-to-b from-rose-50 to-white">
                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-4xl font-bold text-center text-gray-900">
                            Membership Plans
                        </h2>

                        <p className="text-center text-gray-500 mt-3 mb-12">
                            Choose the plan that helps you find your perfect life partner
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">

                            {/* Free */}
                            <div className="bg-white rounded-3xl shadow-lg p-8 border">
                                <h3 className="text-2xl font-bold text-center">
                                    Free
                                </h3>

                                <div className="text-center mt-4">
                                    <span className="text-5xl font-bold">₹0</span>
                                </div>

                                <ul className="mt-8 space-y-3 text-gray-600">
                                    <li>✓ Create Profile</li>
                                    <li>✓ Browse Profiles</li>
                                    <li>✓ View Limited Details</li>
                                    <li>✓ Up to 5 Profile Views</li>
                                    <li>✗ Contact Details Hidden</li>
                                </ul>

                                <button className="w-full mt-8 py-3 rounded-xl border border-red-600 text-red-600 font-semibold">
                                    Get Started
                                </button>
                            </div>

                            {/* Premium */}
                            <div className="bg-red-600 text-white rounded-3xl shadow-2xl p-8 scale-105">
                                <div className="text-center mb-2">
                                    <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-center">
                                    Premium
                                </h3>

                                <div className="text-center mt-4">
                                    <span className="text-5xl font-bold">₹2,000</span>
                                    <span>/3 Months</span>
                                    
                                </div>

                                <ul className="mt-8 space-y-3">
                                    <li>✓ Unlimited Profile Views</li>
                                    <li>✓ Send Interests</li>
                                    <li>✓ View Contact Details</li>
                                    <li>✓ Priority Listing</li>
                                    <li>✓ WhatsApp Support</li>
                                </ul>

                                <button className="w-full mt-8 py-3 rounded-xl bg-white text-red-600 font-semibold">
                                    Choose Premium
                                </button>
                            </div>

                            {/* Elite */}
                            <div className="bg-white rounded-3xl shadow-lg p-8 border">
                                <h3 className="text-2xl font-bold text-center">
                                    Elite
                                </h3>

                                <span className="text-5xl font-bold">₹5,000</span>
                                <span>/6 Months</span>

                                <ul className="mt-8 space-y-3 text-gray-600">
                                    <li>✓ Everything in Premium</li>
                                    <li>✓ Dedicated Relationship Manager</li>
                                    <li>✓ Profile Boost</li>
                                    <li>✓ Exclusive Matches</li>
                                    <li>✓ Priority Support</li>
                                </ul>

                                <button className="w-full mt-8 py-3 rounded-xl border border-red-600 text-red-600 font-semibold">
                                    Choose Elite
                                </button>
                            </div>

                        </div>

                    </div>
                </section>

                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-4xl font-bold text-center text-gray-900">
                            Why Choose NichayaVedika?
                        </h2>

                        <p className="text-center text-gray-500 mt-3 mb-12">
                            A trusted platform built to help families find meaningful matches
                        </p>

                        <div className="grid md:grid-cols-4 gap-8">

                            {/* Card 1 */}
                            <div className="bg-rose-50 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition">
                                <div className="text-5xl mb-4">🔒</div>
                                <h3 className="text-xl font-bold mb-3">
                                    Privacy Protected
                                </h3>
                                <p className="text-gray-600">
                                    Your personal information remains secure and visible only to eligible members.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-rose-50 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition">
                                <div className="text-5xl mb-4">✅</div>
                                <h3 className="text-xl font-bold mb-3">
                                    Verified Profiles
                                </h3>
                                <p className="text-gray-600">
                                    Every profile goes through verification to ensure authenticity and trust.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-rose-50 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition">
                                <div className="text-5xl mb-4">❤️</div>
                                <h3 className="text-xl font-bold mb-3">
                                    Telugu Community Focus
                                </h3>
                                <p className="text-gray-600">
                                    Dedicated to helping Telugu families find culturally compatible matches.
                                </p>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-rose-50 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition">
                                <div className="text-5xl mb-4">📞</div>
                                <h3 className="text-xl font-bold mb-3">
                                    Dedicated Support
                                </h3>
                                <p className="text-gray-600">
                                    Our team is available to assist you throughout your matchmaking journey.
                                </p>
                            </div>

                        </div>

                    </div>
                </section>

                {/* Profiles */}
                <section className="py-20 bg-gradient-to-b from-white to-rose-50">
                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-4xl font-bold text-center text-gray-900">
                            Featured Profiles
                        </h2>

                        <p className="text-center text-gray-500 mt-3 mb-12">
                            Discover verified brides and grooms from trusted families
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                            {profiles.map((p) => (
                                <div
                                    key={p.id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                                >
                                    <div className="relative h-48 bg-gradient-to-br from-red-100 via-pink-100 to-yellow-100 flex items-center justify-center">
                                        <div className="absolute top-4 left-4 bg-white text-green-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                                            ✓ Verified
                                        </div>

                                        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                            {p.gender}
                                        </div>

                                        <div className="h-28 w-28 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 font-semibold border-4 border-white">
                                            <img
  src={p.image}
  alt={p.name}
  className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
/>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-center text-gray-900">
                                            {p.name}
                                        </h3>

                                        <p className="text-center text-gray-600 mt-1">
                                            {p.age} yrs • {p.caste}
                                        </p>

                                        <p className="text-center text-gray-500 text-sm mt-1">
                                            📍 {p.location}
                                        </p>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <Link
                                                to={`/profile/${p.id}`}
                                                className="text-center bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition"
                                            >
                                                View
                                            </Link>

                                            <button
                                                onClick={() => toggleLike(p.id)}
                                                className={`py-2 rounded-xl font-medium border transition ${likedProfiles.includes(p.id)
                                                        ? "bg-red-600 text-white border-red-600"
                                                        : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                                                    }`}
                                            >
                                                {likedProfiles.includes(p.id) ? "❤️ Sent" : "♡ Interest"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </section>
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-6">

                        <div className="grid md:grid-cols-4 gap-8">

                            <div>
                                <h2 className="text-2xl font-bold text-red-400">
                                    నిశ్చయ వేదిక
                                </h2>
                                <p className="mt-4 text-gray-400">
                                    Trusted Telugu Matrimony Platform for meaningful matches.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Home</li>
                                    <li>Membership</li>
                                    <li>Success Stories</li>
                                    <li>Contact Us</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Legal</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Privacy Policy</li>
                                    <li>Terms & Conditions</li>
                                    <li>Refund Policy</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Contact</h3>
                                <p className="text-gray-400">Email: support@nichayavedika.com</p>
                                <p className="text-gray-400 mt-2">Phone: +91 XXXXX XXXXX</p>
                                <p className="text-gray-400 mt-2">India</p>
                            </div>

                        </div>

                        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
                            © 2026 NichayaVedika. All rights reserved.
                        </div>

                    </div>
                </footer>
            </main>
        </>
    );
}

export default Home;