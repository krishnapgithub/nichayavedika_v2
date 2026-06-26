

import { useEffect, useState } from "react";
import axios from "axios";
import ProfileCard from "../components/ProfileCard";

import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import weddingHero from "../images/wedding-hero.png";
import { useNavigate } from "react-router-dom";



function Home() {

    const [likedProfiles, setLikedProfiles] = useState([]);
    const [profiles, setProfiles] = useState([]);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
   

    useEffect(() => {
        fetchProfiles();
    }, []);


    const fetchProfiles = async () => {
        try {
            const response = await axios.get(
                "${API_BASE_URL}/profiles"
            );

            setProfiles(response.data.profiles);
        } catch (error) {
            console.log(error);
        }
    };


    const toggleLike = (id) => {
        if (likedProfiles.includes(id)) {
            setLikedProfiles(likedProfiles.filter((pid) => pid !== id));
        } else {
            setLikedProfiles([...likedProfiles, id]);
        }
    };

    /*const profiles = [
        { id: 1, name: "Ravi Kumar", age: 28, gender: "Groom", caste: "Brahmin", location: "Hyderabad", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { id: 2, name: "Priya Sharma", age: 25, gender: "Bride", caste: "Kshatriya", location: "Chennai", image: "https://randomuser.me/api/portraits/men/32.jpg"  },
        { id: 3, name: "Ravi Kumar", age: 28, gender: "Groom", caste: "Brahmin", location: "Hyderabad", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { id: 4, name: "Priya Sharma", age: 25, gender: "Bride", caste: "Kshatriya", location: "Chennai", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    ];*/

    const displayProfiles = (profiles || []).slice(0, 4) //profiles.slice(0, 4);

    while (displayProfiles.length < 4) {
        displayProfiles.push({
            _id: `dummy-${displayProfiles.length}`,
            isDummy: true,
        });
    }

    const navigate = useNavigate();
    return (


        <>
            <Header />


            <div className="max-w-7xl mx-auto px-6">
                <main className="pt-25">
                    {/* Hero */}
                   
                    <section
                        className="-mt-6 relative overflow-hidden text-white h-[60vh] flex items-center rounded-[40px] shadow-2xl border border-rose-100 pb-20 z-10"
                        style={{
                            backgroundImage: `url(${weddingHero})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center right",
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#800020] via-[#800020]/90 to-[#800020]/10"></div>
                        <div className="absolute inset-0 bg-black/10"></div>

                        <div className="relative z-10 px-10 pt-20 pb-8 w-full">
                            <div className="max-w-2xl">

                                <h1 className="text-3xl md:text-5xl font-bold leading-tight px-4">
                                    Blessed Matches,
                                    <br />
                                    Beautiful Beginnings
                                </h1>

                                <p className="mt-6 text-xl text-white/90">
                                    A trusted platform for Telugu families seeking lifelong companionship.
                                </p>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => navigate("/search")}
                                        className="px-6 py-3 bg-amber-400 text-black rounded-xl font-semibold hover:bg-amber-300 transition"
                                    >
                                        Search Now
                                    </button>

                                    <button
                                        onClick={() => navigate("/search")}
                                        className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-[#800020] transition"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Search */}
                
                    {/* Floating Search Card */}
                    <div className="relative z-20 max-w-5xl mx-auto -mt-12 px-6">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">

                            <div className="grid md:grid-cols-4 gap-4">

                                <select className="border border-gray-200 p-3 rounded-xl">
                                    <option>Bride</option>
                                    <option>Groom</option>
                                </select>

                                <select className="border border-gray-200 p-3 rounded-xl">
                                    <option>Age</option>
                                </select>

                                <select className="border border-gray-200 p-3 rounded-xl">
                                    <option>Caste</option>
                                </select>

                                <button
                                    onClick={() => navigate("/search")}
                                    className="w-full py-3 px-6 bg-[#800020] text-white rounded-xl font-semibold hover:bg-[#5c0017] transition duration-300"
                                >
                                    Search Profiles
                                </button>

                            </div>
                        </div>
                    </div>
                

                {/* Stats */}
                    {/* Success Stories */}
                    <section className="mt-6 mb-2 bg-white rounded-[32px] shadow-lg border border-rose-100 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#800020]">
                                Success Stories
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Beautiful journeys that began at NichayaVedika
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    names: "Arjun & Sravya",
                                    place: "Hyderabad",
                                    text: "We found our perfect match through NichayaVedika. A truly blessed journey."
                                },
                                {
                                    names: "Rahul & Anusha",
                                    place: "Vijayawada",
                                    text: "Simple, trusted, and family-friendly platform for Telugu matrimony."
                                },
                                {
                                    names: "Kiran & Deepika",
                                    place: "Warangal",
                                    text: "Our families connected easily and everything felt very genuine."
                                }
                            ].map((story, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden group bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-[28px] p-6 border border-rose-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#800020]/10 via-amber-200/20 to-pink-200/30"></div>

                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 snow-layer"></div>

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#800020] text-white flex items-center justify-center text-2xl shadow-lg">
                                            ❤
                                        </div>

                                        <h3 className="mt-5 text-xl font-bold text-[#800020] text-center">
                                            {story.names}
                                        </h3>

                                        <p className="text-sm text-amber-700 text-center mt-1">
                                            {story.place}
                                        </p>

                                        <p className="mt-4 text-gray-600 text-center leading-relaxed">
                                            “{story.text}”
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6 mb-2">

                    {/* Free */}
                    <div className="group bg-white rounded-3xl shadow-lg p-6 min-h-[430px] border border-rose-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#800020]">

                        <h3 className="text-xl font-bold text-center text-[#800020] transition-all duration-300 group-hover:text-amber-600">
                            Free
                        </h3>

                        <div className="text-center mt-3">
                            <span className="text-4xl font-bold">₹0</span>
                        </div>

                        <ul className="mt-5 space-y-2 text-gray-600 text-sm">
                            <li>✓ Create Profile</li>
                            <li>✓ Browse Profiles</li>
                            <li>✓ View Limited Details</li>
                            <li>✓ Up to 5 Profile Views</li>
                            <li>✗ Contact Details Hidden</li>
                        </ul>

                        <button className="w-full mt-6 py-2.5 rounded-xl border border-[#800020] text-[#800020] font-semibold transition-all duration-300 group-hover:bg-[#800020] group-hover:text-white">
                            Get Started
                        </button>
                    </div>

                    {/* Premium */}
                    <div className="group relative bg-gradient-to-br from-[#800020] to-[#5c0017] text-white rounded-3xl shadow-xl p-6 min-h-[430px] transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_20px_40px_rgba(128,0,32,0.25)]">

                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                        <div className="text-center mb-2">
                            <span className="bg-amber-400 text-[#800020] px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                Most Popular
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-center">
                            Premium
                        </h3>

                        <div className="text-center mt-3">
                            <span cla="text-4xl font-bold">₹2,000</span>
                            <span className="block mt-1 text-rose-100 text-sm">
                                /3 Months
                            </span>
                        </div>

                        <ul className="mt-5 space-y-2 text-sm">
                            <li>✓ Up to 20 Profile Views</li>
                            <li>✓ Send Interests</li>
                            <li>✓ View Contact Details</li>
                            <li>✓ Priority Listing</li>
                            <li>✓ WhatsApp Support</li>
                        </ul>

                        <button className="w-full mt-6 py-2.5 rounded-xl bg-white text-[#800020] font-bold transition-all duration-300 hover:bg-amber-400">
                            Choose Premium
                        </button>
                    </div>

                    {/* Elite */}
                    <div className="group bg-white rounded-3xl shadow-lg p-6 min-h-[430px] border border-rose-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-500">

                        <h3 className="text-xl font-bold text-center text-[#800020] transition-all duration-300 group-hover:text-amber-600">
                            Elite
                        </h3>

                        <div className="text-center mt-3">
                            <span className="text-4xl font-bold">₹5,000</span>
                            <span className="block mt-1 text-gray-500 text-sm">
                                /6 Months
                            </span>
                        </div>

                        <ul className="mt-5 space-y-2 text-gray-600 text-sm">
                            <li>✓ Everything in Premium</li>
                            <li>✓ Dedicated Relationship Manager</li>
                            <li>✓ Profile Boost</li>
                            <li>✓ Exclusive Matches</li>
                            <li>✓ Priority Support</li>
                        </ul>

                        <button className="w-full mt-6 py-2.5 rounded-xl border border-[#800020] text-[#800020] font-semibold transition-all duration-300 group-hover:bg-[#800020] group-hover:text-white">
                            Choose Elite
                        </button>
                    </div>

                </div>

                
                    <section className="mt-6 mb-2  mb-2nv-section bg-white">
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
                    <section className="nv-section bg-gradient-to-b from-white to-rose-50 mt-2">
                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-4xl font-bold text-center text-gray-900">
                            Featured Profiles
                        </h2>

                        <p className="text-center text-gray-500 mt-3 mb-12">
                            Discover verified brides and grooms from trusted families
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {displayProfiles.slice(0, 4).map((profile) => (
                                <ProfileCard
                                    key={profile._id}
                                    profile={profile}
                                />
                            ))}
                        </div>
                    </div>
                </section>
                    </main>
            </div>
            <footer className="bg-[#800020] text-white mt-2">
                <div className="max-w-7xl mx-auto px-6 py-12">

                    <div className="grid md:grid-cols-4 gap-8">

                        <div>
                            <h3 className="text-2xl font-bold">నిశ్చయ వేదిక</h3>
                            <p className="mt-3 text-white/80">
                                Trusted Telugu Matrimony Platform
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-white/80">
                                <li>Home</li>
                                <li>Membership</li>
                                <li>Events</li>
                                <li>Contact</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Support</h4>
                            <ul className="space-y-2 text-white/80">
                                <li>FAQ</li>
                                <li>Privacy Policy</li>
                                <li>Terms & Conditions</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Contact</h4>
                            <p className="text-white/80">
                                support@nichayavedika.com
                            </p>
                        </div>

                    </div>

                    <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/70">
                        © 2026 NichayaVedika. All Rights Reserved.
                    </div>

                </div>
            </footer>

            
        </>
    );
}

export default Home;