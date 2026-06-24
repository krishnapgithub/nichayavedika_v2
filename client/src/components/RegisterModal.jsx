import { useState } from "react";
import axios from "axios";
import OtpModal from "./OtpModal";

export default function RegisterModal({ isOpen, onClose }) {
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        email: "",
        registeringFor: "",
        gender: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {
        try {
            setLoading(true);

            await axios.post("${API_BASE_URL}/auth/register", formData);

            await axios.post("${API_BASE_URL}/auth/send-otp", {
                mobile: formData.mobile,
            });

            setIsOtpOpen(true);
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen z-[99999] bg-black/60 flex items-start justify-center px-4 pt-20"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-3xl font-bold text-center text-[#800020]">
                    Register Free
                </h2>

                <p className="text-center text-gray-500 mt-2">
                    Create your NichayaVedika profile
                </p>

                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Full Name"
                    />

                    <input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Mobile Number"
                    />

                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Email Address"
                    />

                    <select
                        name="registeringFor"
                        value={formData.registeringFor}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                    >
                        <option value="">Registering For</option>
                        <option value="Self">Self</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                    </select>

                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                    >
                        <option value="">Gender</option>
                        <option value="Bride">Bride</option>
                        <option value="Groom">Groom</option>
                    </select>

                    <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Password"
                        type="password"
                    />
                </div>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full mt-6 bg-[#800020] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0017] disabled:opacity-60"
                >
                    {loading ? "Please wait..." : "Register & Send OTP"}
                </button>
            </div>

            <OtpModal
                isOpen={isOtpOpen}
                onClose={() => setIsOtpOpen(false)}
                mobile={formData.mobile}
            />
        </div>
    );
}