

import { useEffect, useState } from "react";
import axios from "axios";

import { FaSearch } from "react-icons/fa";

import { Link } from "react-router-dom";

import weddingHero from "../images/wedding-hero.png";
import nvLogo from "../images/nvlogo-v1.png";

import { useNavigate } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";
import ProfileCard from "../components/ProfileCard";
import ProfileViewModal from "../components/ProfileViewModal.jsx";
import toast from "react-hot-toast";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

function Home() {

    const [likedProfiles, setLikedProfiles] = useState([]);
    const [profiles, setProfiles] = useState([]);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [homeFilters, setHomeFilters] = useState({
        search: "",
        gender: "",
        ageRange: "",
    });

    useEffect(() => {
        fetchProfiles();
    }, []);


    const fetchProfiles = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API_BASE_URL}/api/profiles/search`
            );

            setProfiles(res.data.profiles || []);

        } catch (error) {
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
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

    const handleFilteredSearch = () => {
        const params = new URLSearchParams();
        const searchText = homeFilters.search.trim();

        if (searchText && searchText.length < 3) {
            toast.error("Please enter at least 3 characters to search.");
            return;
        }

        if (searchText) params.set("search", searchText);

        if (homeFilters.gender) params.set("gender", homeFilters.gender);

        if (homeFilters.ageRange) {
            const [ageFrom, ageTo] = homeFilters.ageRange.split("-");
            params.set("ageFrom", ageFrom);
            params.set("ageTo", ageTo);
        }

        const queryString = params.toString();

        navigate(queryString ? `/search?${queryString}` : "/search");
    };

    const handleGuestProfileClick = (profile) => {
        setSelectedProfile(profile);
    };

    return (


        <>


            <div className="max-w-7xl mx-auto px-6 pt-20 lg:pt-24">
                <main>
                    {/* Hero */}

                    <section
                        className="relative overflow-hidden text-white min-h-[430px] flex items-center rounded-b-[36px] rounded-t-none shadow-2xl border-x border-b border-rose-100 pb-24 z-10"
                        style={{
                            backgroundImage: `url(${weddingHero})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center right",
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#800020] via-[#800020]/90 to-[#800020]/10"></div>
                        <div className="absolute inset-0 bg-black/10"></div>

                        {/* Watermark Logo */}
                        <img
                            src={nvLogo}
                            alt="Nichaya Vedika"
                            className="
        absolute
        bottom-[-20px]
        right-[-20px]
        w-[260px]
        md:w-[320px]
        opacity-10
        pointer-events-none
        select-none
        z-[1]
    "
                        />

                        <div className="relative z-10 px-10 pt-6 pb-6 w-full">
                            <div className="max-w-2xl">

                                <h1 className="text-xl md:text-3xl lg:text-[34px] font-bold leading-snug px-4 text-left">
                                    చక్కని చిరకాల అనుబంధానికి
                                    <br />
                                    ముచ్చటైన వేదిక... మన నిశ్చయ!!!
                                </h1>

                                <p className="mt-4 text-base md:text-lg italic font-light text-amber-100 tracking-wide drop-shadow-lg">
                                    ✨ Blessed unions bring lifelong happiness.
                                </p>

                                <div className="mt-6 flex gap-3">

                                    <button
                                        onClick={() => navigate("/search")}
                                        className="primary-btn premium-hover px-5 py-2.5 min-w-[145px] text-[15px] font-medium tracking-[0.5px]"
                                    >
                                        Search Profiles
                                    </button>

                                    <button
                                        onClick={() => setIsRegisterOpen(true)}
                                        className="primary-btn premium-hover px-5 py-2.5 min-w-[145px] text-[15px] font-medium tracking-[0.5px]"
                                    >
                                        Register Free
                                    </button>

                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Search */}

                    {/* Floating Search Card */}
                    <div className="relative z-20 max-w-5xl mx-auto -mt-10 px-6">
                        <div className="bg-white rounded-3xl shadow-2xl p-5 border border-gray-100">

                            <div className="grid md:grid-cols-4 gap-4">

                                <select
                                    value={homeFilters.gender}
                                    onChange={(event) =>
                                        setHomeFilters({
                                            ...homeFilters,
                                            gender: event.target.value,
                                        })
                                    }
                                    className="border border-gray-200 p-3 rounded-xl"
                                >
                                    <option value="">Bride / Groom</option>
                                    <option value="Bride">Bride</option>
                                    <option value="Groom">Groom</option>
                                </select>

                                <select
                                    value={homeFilters.ageRange}
                                    onChange={(event) =>
                                        setHomeFilters({
                                            ...homeFilters,
                                            ageRange: event.target.value,
                                        })
                                    }
                                    className="border border-gray-200 p-3 rounded-xl"
                                >
                                    <option value="">Age</option>
                                    <option value="18-25">18 - 25</option>
                                    <option value="26-30">26 - 30</option>
                                    <option value="31-35">31 - 35</option>
                                    <option value="36-45">36 - 45</option>
                                </select>

                                <input
                                    type="text"
                                    value={homeFilters.search}
                                    onChange={(event) =>
                                        setHomeFilters({
                                            ...homeFilters,
                                            search: event.target.value,
                                        })
                                    }
                                    placeholder="Profile No / Name / Caste - min 3 characters"
                                    className="border border-gray-200 p-3 rounded-xl"
                                />

                                <button
                                    onClick={handleFilteredSearch}
                                    className="primary-btn premium-hover"
                                >
                                    Search Profiles
                                </button>

                            </div>
                        </div>
                    </div>

                    
                    {/* Profiles */}
                    {/* Profiles */}
                    <section className="nv-section bg-gradient-to-b from-white to-rose-50 -mt-10 pt-1">
                        <div className="max-w-7xl mx-auto px-6">

                            <h2 className="text-4xl font-bold text-center text-gray-900 mb-2">
                                Featured Profiles
                            </h2>

                            <p className="text-center text-gray-500 mt-2 mb-8">
                                Discover verified brides and grooms from trusted families
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {loading ? (
                                    <HomeLoadingCards />
                                ) : (
                                    displayProfiles.slice(0, 8).map((profile) => (
                                        <ProfileCard
                                            key={profile._id}
                                            profile={profile}
                                            onView={handleGuestProfileClick}
                                        />
                                    ))
                                )}
                            </div>

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
                                <span className="text-4xl font-bold">₹1,999</span>
                                <span className="block mt-1 text-white/95 text-sm font-medium tracking-[0.5px]">
                                    / 3 Months
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
                                <span className="text-4xl font-bold">₹4,999</span>
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                {
                                    names: "Arjun & Sravya",
                                    place: "Hyderabad",
                                    text: "We found our perfect match through NichayaVedika. A truly blessed journey."
                                },

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
                                    <div className="text-5xl mb-4">ðŸ”’</div>
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
                                    <div className="text-5xl mb-4">ðŸ“ž</div>
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
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
            />

            {selectedProfile && (
                <ProfileViewModal
                    profile={selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                    guestPrompt
                    onRegister={() => {
                        setSelectedProfile(null);
                        setIsRegisterOpen(true);
                    }}
                />
            )}

        </>
    );
}

function HomeLoadingCards() {
    return Array.from({ length: 4 }).map((_, index) => (
        <div
            key={index}
            className="h-[240px] rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-md"
        >
            <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 rounded-[18px] bg-rose-100" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded-full bg-rose-100" />
                    <div className="h-4 w-1/2 rounded-full bg-amber-100" />
                    <div className="h-4 w-2/3 rounded-full bg-rose-100" />
                </div>
            </div>
            <div className="mt-6 space-y-3">
                <div className="h-4 rounded-full bg-rose-100" />
                <div className="h-4 w-5/6 rounded-full bg-amber-100" />
            </div>
            <div className="mt-5 rounded-2xl bg-[#800020] px-4 py-2 text-center text-xs font-semibold text-white">
                Loading verified profile
            </div>
        </div>
    ));
}

export default Home;


