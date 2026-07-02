
import "../styles/membership.css";
import { useNavigate } from "react-router-dom";

export default function Membership() {
    const navigate = useNavigate();

    return (
        <>

            <div className="membership-page">
                <div className="membership-container">
                    <div className="membership-header">
                        <h1>Membership Plans</h1>
                        <p>Choose the right plan to find your perfect match</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-6 mb-2">

                        {/* Free */}
                        <div className="group bg-white rounded-3xl shadow-lg p-6 min-h-[430px] border border-rose-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#800020]">

                            <h3 className="text-xl font-bold text-center text-[#800020] transition-all duration-300 group-hover:text-amber-600">
                                Free
                            </h3>

                            <div className="text-center mt-3">
                                <span className="text-4xl font-bold">INR 0</span>
                            </div>

                            <ul className="mt-5 space-y-2 text-gray-600 text-sm">
                                <li>? Create Profile</li>
                                <li>? Browse Profiles</li>
                                <li>? View Limited Details</li>
                                <li>? Up to 5 Profile Views</li>
                                <li>? Contact Details Hidden</li>
                            </ul>

                            <button
                                type="button"
                                onClick={() => navigate("/create-profile")}
                                className="w-full mt-6 py-2.5 rounded-xl border border-[#800020] text-[#800020] font-semibold transition-all duration-300 group-hover:bg-[#800020] group-hover:text-white"
                            >
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
                                <span className="text-4xl font-bold">INR 1,999</span>
                                <span className="block mt-1 text-white/95 text-sm font-medium tracking-[0.5px]">
                                    / 3 Months
                                </span>
                            </div>

                            <ul className="mt-5 space-y-2 text-sm">
                                <li>? Up to 20 Profile Views</li>
                                <li>? Send Interests</li>
                                <li>? View Contact Details</li>
                                <li>? Priority Listing</li>
                                <li>? WhatsApp Support</li>
                            </ul>

                            <button
                                type="button"
                                onClick={() => navigate("/payment/premium")}
                                className="w-full mt-6 py-2.5 rounded-xl bg-white text-[#800020] font-bold transition-all duration-300 hover:bg-amber-400"
                            >
                                Choose Premium
                            </button>
                        </div>

                        {/* Elite */}
                        <div className="group bg-white rounded-3xl shadow-lg p-6 min-h-[430px] border border-rose-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-500">

                            <h3 className="text-xl font-bold text-center text-[#800020] transition-all duration-300 group-hover:text-amber-600">
                                Elite
                            </h3>

                            <div className="text-center mt-3">
                                <span className="text-4xl font-bold">INR 4,999</span>
                                <span className="block mt-1 text-gray-500 text-sm">
                                    /6 Months
                                </span>
                            </div>

                            <ul className="mt-5 space-y-2 text-gray-600 text-sm">
                                <li>? Everything in Premium</li>
                                <li>? Up to 40 Profile Views</li>
                                <li>? Dedicated Relationship Manager</li>
                                <li>? Profile Boost</li>
                                <li>? Exclusive Matches</li>
                                <li>? Priority Support</li>
                            </ul>

                            <button
                                type="button"
                                onClick={() => navigate("/payment/elite")}
                                className="w-full mt-6 py-2.5 rounded-xl border border-[#800020] text-[#800020] font-semibold transition-all duration-300 group-hover:bg-[#800020] group-hover:text-white"
                            >
                                Choose Elite
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}

